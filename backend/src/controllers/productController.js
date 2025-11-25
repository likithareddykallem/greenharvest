// backend/src/controllers/productController.js

const productService = require('../services/productService');
const { asyncHandler } = require('../middleware/errorHandler');
const response = require('../utils/apiResponse');

exports.listProducts = asyncHandler(async (req, res) => {
  const filters = {
    category: req.query.category,
    status: req.query.status,
    farmer: req.query.farmer,
    search: req.query.search,
  };

  const pagination = {
    page: req.query.page,
    limit: req.query.limit,
  };

  const data = await productService.listProducts(filters, pagination);
  return response.success(res, data.items, 'Products fetched', 200, data.meta);
});

exports.getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  return response.success(res, product, 'Product detail');
});

exports.createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.user, req.body);
  return response.created(res, product, 'Product created');
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.user, req.body);
  return response.success(res, product, 'Product updated');
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id, req.user);
  return response.success(res, null, 'Product deleted');
});

