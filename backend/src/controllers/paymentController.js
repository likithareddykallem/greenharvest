import { randomUUID } from 'crypto';
import { catchAsync } from '../utils/catchAsync.js';
import { finalizeCheckout } from '../services/orderService.js';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const simulatePayment = catchAsync(async (req, res) => {
  const { checkoutId } = req.body;
  if (!checkoutId) {
    return res.status(400).json({ message: 'checkoutId required' });
  }
  await wait(process.env.NODE_ENV === 'test' ? 10 : 3000);
  const paymentReference = `SIM-${randomUUID()}`;
  const order = await finalizeCheckout({ checkoutId, paymentReference });
  res.json({ status: 'success', paymentReference, orderId: order.id });
});

