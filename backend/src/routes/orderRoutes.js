import { Router } from 'express';
import { createCheckoutSession, trackOrder, markPacked, updateOrderStatus, finalizeOrder, listOrders, listCustomerOrders, cancelOrderController } from '../controllers/orderController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.get('/', authenticate, authorize('admin'), listOrders);
router.post('/:id/cancel', authenticate, authorize('customer'), cancelOrderController);
router.get('/mine', authenticate, authorize('customer'), listCustomerOrders);
router.get('/:id/track', authenticate, authorize('customer'), trackOrder);
router.post('/:id/packed', authenticate, authorize('farmer'), markPacked);
router.post('/:id/status', authenticate, authorize('admin', 'farmer'), updateOrderStatus);

export default router;

