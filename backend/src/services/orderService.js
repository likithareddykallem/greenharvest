// backend/src/services/orderService.js

const mongoose = require('mongoose');
const { Order, Product, Inventory, Payment } = require('../models');
const { ORDER_STATUS, PAYMENT_METHODS, PAYMENT_STATUS, USER_ROLES } = require('../utils/constants');
const { paginate, getPaginationMeta } = require('../utils/helpers');

const buildMoney = (amount, currency = 'USD') => ({ amount, currency });

const createOrder = async (user, payload) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { items, shippingAddress, paymentMethod } = payload;

    if (!items || !items.length) {
      const err = new Error('Order requires at least one item');
      err.status = 400;
      throw err;
    }
    if (!Object.values(PAYMENT_METHODS).includes(paymentMethod)) {
      const err = new Error('Unsupported payment method');
      err.status = 400;
      throw err;
    }

    const orderItems = [];
    let subtotal = 0;
    const currency = 'USD';

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) {
        const err = new Error('Product not found');
        err.status = 404;
        throw err;
      }
      if (!product.price || typeof product.price.amount !== 'number') {
        const err = new Error(`Product ${product.name} missing price`);
        err.status = 400;
        throw err;
      }

      const inventory = await Inventory.findOne({ product: product._id }).session(session);
      if (!inventory || inventory.availableQuantity < item.quantity) {
        const err = new Error(`Insufficient inventory for ${product.name}`);
        err.status = 400;
        throw err;
      }
      inventory.reservedQuantity += item.quantity;
      await inventory.save({ session });

      const lineSubtotal = product.price.amount * item.quantity;
      subtotal += lineSubtotal;

      orderItems.push({
        product: product._id,
        farmer: product.farmer,
        name: product.name,
        sku: product.sku,
        quantity: item.quantity,
        unit: product.price.unit,
        unitPrice: buildMoney(product.price.amount, product.price.currency || currency),
        subtotal: buildMoney(lineSubtotal, product.price.currency || currency),
      });
    }

    const tax = buildMoney(0, currency);
    const shippingFee = buildMoney(0, currency);
    const total = buildMoney(subtotal + tax.amount + shippingFee.amount, currency);

    const orderDoc = await Order.create(
      [
        {
          consumer: user.id,
          farmer: orderItems[0].farmer,
          items: orderItems,
          subtotal: buildMoney(subtotal, currency),
          tax,
          shippingFee,
          total,
          shippingAddress,
          billingAddress: shippingAddress,
          paymentStatus: PAYMENT_STATUS.PENDING,
          status: ORDER_STATUS.PENDING,
          timeline: [
            {
              stage: 'order_placed',
              status: ORDER_STATUS.PENDING,
              message: 'Order submitted by customer',
              actor: user.id,
            },
          ],
        },
      ],
      { session }
    );

    await Payment.create(
      [
        {
          order: orderDoc[0]._id,
          provider: 'stripe',
          method: paymentMethod,
          amount: total.amount,
          currency: total.currency,
          status: PAYMENT_STATUS.PENDING,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return Order.findById(orderDoc[0]._id).populate('items.product').populate('farmer').populate('consumer');
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const buildOrderQueryForUser = (user, filters) => {
  const query = {};
  if (user.role === USER_ROLES.CONSUMER) {
    query.consumer = user.id;
  } else if (user.role === USER_ROLES.FARMER) {
    query.farmer = user.profile;
  }
  if (filters.status) query.status = filters.status;
  if (filters.farmer) query.farmer = filters.farmer;
  return query;
};

const listOrders = async (user, filters = {}, pagination = {}) => {
  const query = buildOrderQueryForUser(user, filters);
  const { skip, limit, page } = paginate(pagination.page, pagination.limit);

  const [items, total] = await Promise.all([
    Order.find(query).populate('items.product').populate('farmer').populate('consumer').skip(skip).limit(limit).sort({ createdAt: -1 }),
    Order.countDocuments(query),
  ]);

  return {
    items,
    meta: getPaginationMeta(total, page, limit),
  };
};

const getOrderById = async (user, id) => {
  const order = await Order.findById(id).populate('items.product').populate('farmer').populate('consumer');
  if (!order) {
    const err = new Error('Order not found');
    err.status = 404;
    throw err;
  }
  if (user.role === USER_ROLES.CONSUMER && order.consumer.toString() !== user.id) {
    const err = new Error('Not authorized to view this order');
    err.status = 403;
    throw err;
  }
  if (user.role === USER_ROLES.FARMER && order.farmer.toString() !== user.profile?.toString()) {
    const err = new Error('Not authorized to view this order');
    err.status = 403;
    throw err;
  }
  return order;
};

const updateOrderStatus = async (user, id, payload) => {
  const order = await Order.findById(id);
  if (!order) {
    const err = new Error('Order not found');
    err.status = 404;
    throw err;
  }

  const allowed =
    user.role === USER_ROLES.ADMIN ||
    (user.role === USER_ROLES.FARMER && order.farmer.toString() === user.profile?.toString());
  if (!allowed) {
    const err = new Error('Not authorized to update this order');
    err.status = 403;
    throw err;
  }

  if (!Object.values(ORDER_STATUS).includes(payload.status)) {
    const err = new Error('Invalid order status');
    err.status = 400;
    throw err;
  }

  order.status = payload.status;
  order.timeline.push({
    stage: payload.stage || 'updated',
    status: payload.status,
    message: payload.message,
    actor: user.id,
  });

  await order.save();
  return order.populate('items.product').populate('farmer').populate('consumer');
};

module.exports = {
  createOrder,
  listOrders,
  getOrderById,
  updateOrderStatus,
};

