import { Router } from 'express';
import {
  listMyProducts,
  listMyOrders,
  getFarmerProfile,
  updateFarmerProfile,
  updateFarmerInventory,
  toggleFarmerProduct,
  updateFarmerOrderStatus,
  getFarmerSalesSummary,
  deleteFarmerProduct,
} from '../controllers/farmerController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate, authorize('farmer'));

router.get('/products', listMyProducts);
router.get('/orders', listMyOrders);
router.get('/sales/summary', getFarmerSalesSummary);
router.get('/profile', getFarmerProfile);
router.put('/profile', updateFarmerProfile);
router.patch('/products/:id/inventory', updateFarmerInventory);
router.patch('/products/:id/publish', toggleFarmerProduct);
router.post('/orders/:id/status', updateFarmerOrderStatus);
router.delete('/products/:id', deleteFarmerProduct);

export default router;

