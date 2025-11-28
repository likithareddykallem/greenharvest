import { Product } from '../models/Product.js';

export const listProducts = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Product.find({ 'approvals.approvedByAdmin': true, status: 'published' })
      .populate('farmer', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Product.countDocuments({ 'approvals.approvedByAdmin': true, status: 'published' }),
  ]);
  return {
    items,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
  };
};

export const getProduct = async (id) => {
  const product = await Product.findById(id).populate('farmer', 'name email');
  if (!product) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }
  return product;
};

export const createProduct = async ({
  name,
  description,
  price,
  stock,
  farmerId,
  imageUrl,
  certifications,
  metadata,
  categories,
  certificationTags,
  gallery,
}) => {
  const product = await Product.create({
    name,
    description,
    price,
    stock,
    farmer: farmerId,
    imageUrl,
    status: 'published',
    certifications,
    metadata,
    categories,
    certificationTags,
    gallery,
    publishedAt: new Date(),
    approvals: { approvedByAdmin: false, status: 'pending' },
  });
  return product;
};

export const approveProduct = async ({
  productId,
  status = 'approved',
  adminNote,
  reviewerId,
}) => {
  const isApproved = status === 'approved';
  const update = {
    $set: {
      'approvals.approvedByAdmin': isApproved,
      'approvals.status': status,
      'approvals.adminNote': adminNote,
      'approvals.reviewedAt': new Date(),
      'approvals.reviewedBy': reviewerId,
    },
  };
  const product = await Product.findByIdAndUpdate(productId, update, { new: true });
  return product;
};

export const updateFarmerProduct = async (productId, farmerId, payload) => {
  const {
    name,
    description,
    price,
    stock,
    imageUrl,
    certifications,
    metadata,
    categories,
    certificationTags,
    gallery,
  } = payload;
  const product = await Product.findOneAndUpdate(
    { _id: productId, farmer: farmerId },
    {
      $set: {
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(price !== undefined ? { price } : {}),
        ...(stock !== undefined ? { stock } : {}),
        ...(imageUrl !== undefined ? { imageUrl } : {}),
        ...(certifications !== undefined ? { certifications } : {}),
        ...(metadata !== undefined ? { metadata } : {}),
        ...(categories !== undefined ? { categories } : {}),
        ...(certificationTags !== undefined ? { certificationTags } : {}),
        ...(gallery !== undefined ? { gallery } : {}),
      },
    },
    { new: true }
  );
  return product;
};

export const resubmitFarmerProduct = async (productId, farmerId) => {
  const product = await Product.findOneAndUpdate(
    { _id: productId, farmer: farmerId },
    {
      $set: {
        'approvals.approvedByAdmin': false,
        'approvals.status': 'pending',
        'approvals.adminNote': undefined,
      },
    },
    { new: true }
  );
  return product;
};

