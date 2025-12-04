import { randomUUID } from 'crypto';
import { redis } from '../config/redis.js';
import { Product } from '../models/Product.js';
import { ORDER_STATES, Order } from '../models/Order.js';
import { Notification } from '../models/Notification.js';
import { eventBus } from '../utils/eventBus.js';
import { sendTemplatedEmail } from './mailerService.js';
import { env } from '../config/env.js';

const CHECKOUT_PREFIX = 'checkout:';
const LOCK_PREFIX = 'inventory-lock:';

const timelineEntry = (state, note, actor) => ({
  state,
  note,
  actor: actor?.name || 'system',
  actorRole: actor?.role || 'system',
  timestamp: new Date(),
});

const orderTransitions = {
  Pending: ['Accepted', 'Rejected', 'Cancelled'],
  Accepted: ['Packed', 'Cancelled'],
  Packed: ['Shipped'],
  Shipped: ['Delivered'],
};

const groupItemsByFarmer = (products, items) => {
  const map = new Map();
  items.forEach((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product?.farmer) return;
    const farmerId = product.farmer.id || product.farmer._id?.toString();
    if (!farmerId) return;
    if (!map.has(farmerId)) {
      map.set(farmerId, {
        farmer: {
          id: farmerId,
          name: product.farmer.name || 'Farmer',
          email: product.farmer.email,
        },
        items: [],
      });
    }
    map.get(farmerId).items.push({
      name: product.name,
      quantity: item.quantity,
      price: product.price,
    });
  });
  return [...map.values()];
};

const sendCustomerStatusEmail = async (order, status, note) => {
  if (!order.customer?.email) return;
  await sendTemplatedEmail({
    template: 'orderStatusUpdate',
    to: order.customer.email,
    data: {
      customerName: order.customer.name,
      status,
      note,
      orderId: order.id,
    },
  });
};

const notifyFarmersOfOrder = async (farmerGroups, orderId) => {
  await Promise.allSettled(
    farmerGroups.map((group) =>
      sendTemplatedEmail({
        template: 'newOrderForFarmer',
        to: group.farmer.email,
        data: {
          farmerName: group.farmer.name,
          orderId,
          items: group.items,
        },
      })
    )
  );
};

const notifyAdminOfOrder = async (order) => {
  if (!env.adminAlertEmail) return;
  await sendTemplatedEmail({
    template: 'newOrderForFarmer',
    to: env.adminAlertEmail,
    data: {
      farmerName: 'GreenHarvest Admin',
      orderId: order.id,
      items: order.items,
    },
  });
};

const sendOrderConfirmationEmail = async (order, total) => {
  if (!order.customer?.email) return;
  await sendTemplatedEmail({
    template: 'orderConfirmation',
    to: order.customer.email,
    data: {
      customerName: order.customer.name,
      orderId: order.id,
      total,
      items: order.items,
    },
  });
};

const sendLowStockEmail = async (product) => {
  if (!product.farmer?.email) return;
  await sendTemplatedEmail({
    template: 'lowStock',
    to: product.farmer.email,
    data: {
      farmerName: product.farmer.name || 'Farmer',
      productName: product.name,
      stock: product.stock,
    },
  });
};

export const createCheckout = async ({ customerId, items }) => {
  if (!Array.isArray(items) || items.length === 0) {
    const err = new Error('Cart is empty');
    err.status = 400;
    throw err;
  }
  const productIds = items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds } });
  if (products.length !== items.length) {
    const err = new Error('Some products are missing');
    err.status = 400;
    throw err;
  }
  let total = 0;
  items.forEach((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product || product.stock < item.quantity) {
      const err = new Error('Product out of stock');
      err.status = 400;
      throw err;
    }
    total += product.price * item.quantity;
  });
  const checkoutId = randomUUID();
  const payload = JSON.stringify({
    customerId,
    items,
    total,
    createdAt: Date.now(),
  });
  await redis.set(`${CHECKOUT_PREFIX}${checkoutId}`, payload, 'EX', 300);
  return { checkoutId, total };
};

const acquireLock = async (productId) => {
  const key = `${LOCK_PREFIX}${productId}`;
  const locked = await redis.set(key, '1', 'NX', 'EX', 5);
  return locked === 'OK';
};

const releaseLock = async (productId) => {
  await redis.del(`${LOCK_PREFIX}${productId}`);
};

export const finalizeCheckout = async ({ checkoutId, paymentReference }) => {
  const cache = await redis.get(`${CHECKOUT_PREFIX}${checkoutId}`);
  if (!cache) {
    const err = new Error('Checkout expired');
    err.status = 400;
    throw err;
  }
  const { customerId, items, total } = JSON.parse(cache);
  const productIds = items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds } }).populate('farmer');

  try {
    for (const item of items) {
      const productMeta = products.find((p) => p.id === item.productId);
      if (!productMeta) {
        throw new Error('Product missing');
      }
      const locked = await acquireLock(productMeta.id);
      if (!locked) {
        throw new Error('Inventory lock busy');
      }
      try {
        const freshProduct = await Product.findOneAndUpdate(
          { _id: productMeta.id, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { new: true }
        );
        if (!freshProduct) {
          throw new Error('Insufficient stock');
        }
        // Update local product instance for email data
        productMeta.stock = freshProduct.stock;
      } finally {
        await releaseLock(productMeta.id);
      }
    }
  } catch (err) {
    await Promise.all(items.map((item) => releaseLock(item.productId)));
    err.status = 409;
    throw err;
  }

  const order = await Order.create({
    customer: customerId,
    items: items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        product: product.id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
      };
    }),
    total,
    paymentReference,
    status: 'Accepted',
    timeline: [timelineEntry('Accepted', 'Order placed and payment confirmed')],
  });

  await order.populate('customer', 'name email');

  await redis.del(`${CHECKOUT_PREFIX}${checkoutId}`);

  eventBus.emit('order:created', order);

  const farmerGroups = groupItemsByFarmer(products, items);
  await Promise.allSettled([
    sendOrderConfirmationEmail(order, total),
    notifyFarmersOfOrder(farmerGroups, order.id),
    notifyAdminOfOrder(order),
  ]);

  const lowStock = products.filter((p) => p.stock <= 5);
  lowStock.forEach((product) => sendLowStockEmail(product));

  return order;
};

export const getOrderTimeline = async (orderId, userId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    const err = new Error('Order not found');
    err.status = 404;
    throw err;
  }
  if (order.customer.toString() !== userId.toString()) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }
  return order;
};

const loadOrderWithRelations = (orderId) =>
  Order.findById(orderId)
    .populate({
      path: 'items.product',
      populate: { path: 'farmer', select: 'name email' },
    })
    .populate('customer', 'name email');

export const advanceOrderStatus = async ({ orderId, nextState, note, actor }) => {
  if (!ORDER_STATES.includes(nextState)) {
    const err = new Error('Invalid order state');
    err.status = 400;
    throw err;
  }

  const order = await loadOrderWithRelations(orderId);
  if (!order) {
    const err = new Error('Order not found');
    err.status = 404;
    throw err;
  }

  if (order.status === nextState) {
    return order;
  }

  const actorRole = actor?.role || 'system';
  if (actorRole !== 'admin') {
    const allowed = orderTransitions[order.status] || [];
    if (!allowed.includes(nextState)) {
      const err = new Error('Transition not allowed');
      err.status = 400;
      throw err;
    }
  }

  if (actorRole === 'farmer') {
    const ownsOrder = order.items.some(
      (item) => item.product?.farmer?._id?.toString() === actor.id?.toString()
    );
    if (!ownsOrder) {
      const err = new Error('You cannot update this order');
      err.status = 403;
      throw err;
    }
  }

  order.status = nextState;
  order.timeline.push(timelineEntry(nextState, note, actor));
  const saved = await order.save();
  eventBus.emit('order:updated', saved);
  await sendCustomerStatusEmail(saved, nextState, note);
  return saved;
};

export const cancelOrder = async ({ orderId, userId, note }) => {
  const order = await loadOrderWithRelations(orderId);
  if (!order) {
    const err = new Error('Order not found');
    err.status = 404;
    throw err;
  }

  if (order.customer.id.toString() !== userId.toString()) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }

  if (['Packed', 'Shipped', 'Delivered', 'Cancelled'].includes(order.status)) {
    const err = new Error('Order cannot be cancelled at this stage');
    err.status = 400;
    throw err;
  }

  // Restock items
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product.id, { $inc: { stock: item.quantity } });
  }

  order.status = 'Cancelled';
  order.timeline.push(timelineEntry('Cancelled', note || 'Cancelled by customer', { id: userId, role: 'customer', name: 'Customer' }));
  const saved = await order.save();
  eventBus.emit('order:updated', saved);
  await sendCustomerStatusEmail(saved, 'Cancelled', note);
  return saved;
};

export const listAllOrders = async () => {
  const orders = await Order.find().sort({ createdAt: -1 }).limit(50);
  return orders;
};

export const listOrdersForCustomer = async (customerId) => {
  const orders = await Order.find({ customer: customerId }).sort({ createdAt: -1 });
  return orders;
};

