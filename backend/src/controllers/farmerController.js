import { catchAsync } from '../utils/catchAsync.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { advanceOrderStatus } from '../services/orderService.js';
import { deleteProduct } from '../services/productService.js';

export const listMyProducts = catchAsync(async (req, res) => {
  const products = await Product.find({ farmer: req.user.id });
  res.json(products);
});

export const listMyOrders = catchAsync(async (req, res) => {
  const orders = await Order.find({ 'items.product': { $exists: true } })
    .populate('customer', 'name')
    .populate('items.product', 'farmer name')
    .lean();
  const filtered = orders.filter((order) =>
    order.items.some(
      (item) => item.product?.farmer?.toString && item.product.farmer.toString() === req.user.id.toString()
    )
  );
  const trimmed = filtered.map((order) => ({
    ...order,
    items: order.items.filter(
      (item) => item.product?.farmer?.toString && item.product.farmer.toString() === req.user.id.toString()
    ),
  }));
  res.json(trimmed);
});

export const getFarmerSalesSummary = catchAsync(async (req, res) => {
  const orders = await Order.find({ 'items.product': { $exists: true } })
    .populate('items.product', 'farmer price name')
    .lean();

  const revenueByDay = {};
  orders.forEach((order) => {
    const day = new Date(order.createdAt).toISOString().slice(0, 10);
    const revenue = order.items
      .filter((item) => item.product?.farmer?.toString() === req.user.id.toString())
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (!revenue) return;
    revenueByDay[day] = (revenueByDay[day] || 0) + revenue;
  });

  const series = Object.entries(revenueByDay)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([date, value]) => ({ date, value }));

  res.json({ series });
});

export const getFarmerProfile = catchAsync(async (req, res) => {
  res.json(req.user.profile || {});
});

export const updateFarmerProfile = catchAsync(async (req, res) => {
  const update = {
    'profile.farmName': req.body.farmName,
    'profile.location': req.body.location,
    'profile.phone': req.body.phone,
    'profile.bio': req.body.bio,
    'profile.certifications': req.body.certifications,
    'profile.payoutPreference': req.body.payoutPreference,
    'profile.links': req.body.links,
    'profile.newsletterOptIn': req.body.newsletterOptIn,
  };

  Object.keys(update).forEach((key) => update[key] === undefined && delete update[key]);

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: update },
    { new: true }
  ).select('-password');

  res.json(user.profile || {});
});

export const updateFarmerInventory = catchAsync(async (req, res) => {
  const parsedStock = Number(req.body.stock);
  if (Number.isNaN(parsedStock) || parsedStock < 0) {
    const err = new Error('Invalid stock value');
    err.status = 400;
    throw err;
  }
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, farmer: req.user.id },
    {
      $set: {
        stock: parsedStock,
        status: parsedStock > 0 ? 'published' : 'draft',
      },
    },
    { new: true }
  );
  res.json(product);
});

export const toggleFarmerProduct = catchAsync(async (req, res) => {
  const { status } = req.body;
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, farmer: req.user.id },
    {
      $set: {
        status,
        publishedAt: status === 'published' ? new Date() : null,
      },
    },
    { new: true }
  );
  res.json(product);
});

export const updateFarmerOrderStatus = catchAsync(async (req, res) => {
  const { state, note } = req.body;
  const order = await advanceOrderStatus({
    orderId: req.params.id,
    nextState: state,
    note,
    actor: { id: req.user.id, name: req.user.name, role: req.user.role },
  });
  res.json(order);
});


export const deleteFarmerProduct = catchAsync(async (req, res) => {
  await deleteProduct(req.params.id, req.user.id);
  res.status(204).send();
});
