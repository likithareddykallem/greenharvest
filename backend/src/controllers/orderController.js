// backend/src/controllers/orderController.js

const orderService = require('../services/orderService');
const { asyncHandler } = require('../middleware/errorHandler');
const response = require('../utils/apiResponse');

exports.createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.user, req.body);
  return response.created(res, order, 'Order placed');
});

exports.listOrders = asyncHandler(async (req, res) => {
  const filters = {
    status: req.query.status,
    farmer: req.query.farmer,
  };
  const pagination = {
    page: req.query.page,
    limit: req.query.limit,
  };
  const data = await orderService.listOrders(req.user, filters, pagination);
  return response.success(res, data.items, 'Orders fetched', 200, data.meta);
});

exports.getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.user, req.params.id);
  return response.success(res, order, 'Order detail');
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.user, req.params.id, req.body);
  return response.success(res, order, 'Order status updated');
});

