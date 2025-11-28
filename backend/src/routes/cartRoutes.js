import { Router } from 'express';
import { createCheckoutSession } from '../controllers/orderController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.post('/checkout', authenticate, authorize('customer'), createCheckoutSession);

export default router;

