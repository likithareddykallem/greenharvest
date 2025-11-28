import { catchAsync } from '../utils/catchAsync.js';
import {
  createCheckout,
  finalizeCheckout,
  getOrderTimeline,
  advanceOrderStatus,
  assignDeliveryPartner,
  listAllOrders,
  listOrdersForCustomer,
} from '../services/orderService.js';

export const createCheckoutSession = catchAsync(async (req, res) => {
  const { items } = req.body;
  const data = await createCheckout({ customerId: req.user.id, items });
  res.status(201).json(data);
});

export const trackOrder = catchAsync(async (req, res) => {
  const order = await getOrderTimeline(req.params.id, req.user.id);
  res.json(order);
});

const actorFromRequest = (req) => ({
  id: req.user.id,
  name: req.user.name,
  role: req.user.role,
});

export const markPacked = catchAsync(async (req, res) => {
  const order = await advanceOrderStatus({
    orderId: req.params.id,
    nextState: 'Packed',
    note: 'Farmer packed order',
    actor: actorFromRequest(req),
  });
  const result = await assignDeliveryPartner(order.id);
  res.json({ order, delivery: result?.partner });
});

export const updateOrderStatus = catchAsync(async (req, res) => {
  const { state, note } = req.body;
  const order = await advanceOrderStatus({
    orderId: req.params.id,
    nextState: state,
    note,
    actor: actorFromRequest(req),
  });
  res.json(order);
});

export const finalizeOrder = catchAsync(async (req, res) => {
  const { checkoutId, paymentReference } = req.body;
  const order = await finalizeCheckout({ checkoutId, paymentReference });
  res.status(201).json(order);
});

export const listOrders = catchAsync(async (req, res) => {
  const orders = await listAllOrders();
  res.json(orders);
});

export const listCustomerOrders = catchAsync(async (req, res) => {
  const orders = await listOrdersForCustomer(req.user.id);
  res.json(orders);
});

