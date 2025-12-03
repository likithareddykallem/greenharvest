import { Router } from 'express';
import {
  listUsers,
  listPendingFarmers,
  listPendingProducts,
  approveFarmer,
  approveProduct,
  toggleUserActive,
  getAdminStats,
  listTaxonomy,
  createTaxonomy,
  updateTaxonomy,
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/users', listUsers);
router.post('/users/:id/active', toggleUserActive);
router.get('/stats', getAdminStats);
router.get('/farmers/pending', listPendingFarmers);
router.post('/farmers/:id/approve', approveFarmer);
router.get('/products/pending', listPendingProducts);
router.post('/products/:id/approve', approveProduct);
router.get('/taxonomy', listTaxonomy);
router.post('/taxonomy', createTaxonomy);
router.patch('/taxonomy/:id', updateTaxonomy);

export default router;

