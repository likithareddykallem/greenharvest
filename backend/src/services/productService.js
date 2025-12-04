import { Product } from '../models/Product.js';
import { sendTemplatedEmail } from './mailerService.js';

export const listProducts = async ({ page = 1, limit = 10, search, category, certification, status, approvedOnly = true }) => {
  const skip = (page - 1) * limit;

  const query = {};

  if (approvedOnly) {
    query['approvals.approvedByAdmin'] = true;
    query.status = 'published';
  }

  if (status) {
    query['approvals.status'] = status;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  if (category) {
    query.categories = category;
  }

  if (certification) {
    query.certificationTags = certification;
  }

  const [items, total] = await Promise.all([
    Product.find(query)
      .populate('farmer', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Product.countDocuments(query),
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
  const product = await Product.findByIdAndUpdate(productId, update, { new: true }).populate('farmer', 'name email');

  if (product?.farmer?.email) {
    sendTemplatedEmail({
      template: 'productDecision',
      to: product.farmer.email,
      data: {
        farmerName: product.farmer.name,
        productName: product.name,
        status,
        note: adminNote,
      },
    });
  }

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


export const deleteProduct = async (productId, farmerId) => {
  const product = await Product.findOneAndDelete({ _id: productId, farmer: farmerId });
  if (!product) {
    const err = new Error('Product not found or unauthorized');
    err.status = 404;
    throw err;
  }
  return product;
};
