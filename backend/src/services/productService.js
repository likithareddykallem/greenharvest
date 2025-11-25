// backend/src/services/productService.js

const mongoose = require('mongoose');
const { Product, Inventory } = require('../models');
const { paginate, getPaginationMeta } = require('../utils/helpers');
const cache = require('../utils/cache');
const { CACHE_TTL, PRODUCT_STATUS, USER_ROLES } = require('../utils/constants');

const productCacheKey = (id) => `product:${id}`;

const listProducts = async (filters = {}, pagination = {}) => {
  const { skip, limit, page } = paginate(pagination.page, pagination.limit);
  const query = {};

  if (filters.category) query.category = filters.category;
  if (filters.status) query.status = filters.status;
  if (filters.farmer) query.farmer = filters.farmer;
  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  const [items, total] = await Promise.all([
    Product.find(query).populate('farmer').skip(skip).limit(limit).sort({ createdAt: -1 }),
    Product.countDocuments(query),
  ]);

  return {
    items,
    meta: getPaginationMeta(total, page, limit),
  };
};

const getProductById = async (id) => {
  return cache.remember(productCacheKey(id), CACHE_TTL.PRODUCT_DETAIL, async () => {
    const product = await Product.findById(id).populate('farmer');
    if (!product) {
      const err = new Error('Product not found');
      err.status = 404;
      throw err;
    }
    return product;
  });
};

const createProduct = async (user, payload) => {
  if (user.role !== USER_ROLES.FARMER || !user.profile) {
    const err = new Error('Only farmers can create products');
    err.status = 403;
    throw err;
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { inventory: inventoryInput, ...productInput } = payload;
    const initialQuantity =
      inventoryInput?.currentStock ?? inventoryInput?.totalQuantity ?? 0;
    const lowStockThreshold = inventoryInput?.lowStockThreshold;

    const product = await Product.create(
      [
        {
          ...productInput,
          inventory: {
            totalQuantity: initialQuantity,
            reservedQuantity: 0,
            lowStockThreshold: lowStockThreshold ?? 10,
            lastRestockedAt: new Date(),
          },
          farmer: user.profile,
          status: payload.status || PRODUCT_STATUS.ACTIVE,
        },
      ],
      { session }
    );

    await Inventory.create(
      [
        {
          product: product[0]._id,
          farmer: user.profile,
          totalQuantity: initialQuantity,
          reservedQuantity: 0,
          lowStockThreshold: lowStockThreshold ?? 10,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    await cache.del('products:list');
    return Product.findById(product[0]._id).populate('farmer');
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const updateProduct = async (id, user, payload) => {
  const product = await Product.findById(id);
  if (!product) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }
  if (user.role !== USER_ROLES.ADMIN && (!user.profile || product.farmer.toString() !== user.profile.toString())) {
    const err = new Error('Not authorized to update this product');
    err.status = 403;
    throw err;
  }

  const { inventory: inventoryInput, ...productInput } = payload;
  Object.assign(product, productInput);
  if (inventoryInput) {
    const inventory = await Inventory.findOne({ product: product._id });
    if (inventory) {
      if (typeof inventoryInput.currentStock === 'number' || typeof inventoryInput.totalQuantity === 'number') {
        const totalQuantity =
          typeof inventoryInput.currentStock === 'number'
            ? inventoryInput.currentStock
            : inventoryInput.totalQuantity;
        inventory.totalQuantity = totalQuantity;
        product.inventory.totalQuantity = totalQuantity;
      }
      if (typeof inventoryInput.lowStockThreshold === 'number') {
        inventory.lowStockThreshold = inventoryInput.lowStockThreshold;
        product.inventory.lowStockThreshold = inventoryInput.lowStockThreshold;
      }
      await inventory.save();
    }
  }
  await product.save();
  await cache.del(productCacheKey(id));
  return product.populate('farmer');
};

const deleteProduct = async (id, user) => {
  const product = await Product.findById(id);
  if (!product) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }
  if (user.role !== USER_ROLES.ADMIN && (!user.profile || product.farmer.toString() !== user.profile.toString())) {
    const err = new Error('Not authorized to delete this product');
    err.status = 403;
    throw err;
  }

  await Inventory.deleteOne({ product: product._id });
  await product.deleteOne();
  await cache.del(productCacheKey(id));
};

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};

