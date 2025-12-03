import { catchAsync } from '../utils/catchAsync.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { Taxonomy } from '../models/Taxonomy.js';
import { sendTemplatedEmail } from '../services/mailerService.js';
import { listProducts } from '../services/productService.js';

export const listUsers = catchAsync(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
});

export const listPendingFarmers = catchAsync(async (req, res) => {
  const farmers = await User.find({ role: 'farmer', approved: false }).select('-password');
  res.json(farmers);
});

export const listPendingProducts = catchAsync(async (req, res) => {
  const result = await listProducts({
    page: 1,
    limit: 100,
    status: 'pending',
    approvedOnly: false,
  });
  res.json(result.items);
});

export const approveFarmer = catchAsync(async (req, res) => {
  const approved = req.body?.approved ?? true;
  const farmer = await User.findByIdAndUpdate(
    req.params.id,
    { approved },
    { new: true }
  ).select('-password');
  if (farmer?.email) {
    sendTemplatedEmail({
      template: 'farmerDecision',
      to: farmer.email,
      data: { farmerName: farmer.name, approved },
    });
  }
  res.json(farmer);
});

export const approveProduct = catchAsync(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { $set: { 'approvals.approvedByAdmin': true, 'approvals.status': 'approved' } },
    { new: true }
  );
  res.json(product);
});

export const toggleUserActive = catchAsync(async (req, res) => {
  const { active } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { active: !!active },
    { new: true }
  ).select('-password');
  res.json(user);
});

export const getAdminStats = catchAsync(async (req, res) => {
  const [totalUsers, activeUsers, totalProducts, pendingProducts, approvedProducts, ordersByStatus] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ active: true }),
      Product.countDocuments(),
      Product.countDocuments({ 'approvals.status': 'pending' }),
      Product.countDocuments({ 'approvals.status': 'approved' }),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

  res.json({
    totalUsers,
    activeUsers,
    totalProducts,
    pendingProducts,
    approvedProducts,
    ordersByStatus,
  });
});

export const listTaxonomy = catchAsync(async (req, res) => {
  const type = req.query.type || 'category';
  const items = await Taxonomy.find({ type }).sort({ order: 1, label: 1 });
  res.json(items);
});

export const createTaxonomy = catchAsync(async (req, res) => {
  const { type, label, description, order = 0 } = req.body;
  const item = await Taxonomy.create({ type, label, description, order });
  res.status(201).json(item);
});

export const updateTaxonomy = catchAsync(async (req, res) => {
  const item = await Taxonomy.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true }
  );
  res.json(item);
});

