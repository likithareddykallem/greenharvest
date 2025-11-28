import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createFarmerProduct,
  approveFarmerProduct,
  updateFarmerProductController,
  resubmitFarmerProductController,
  listTaxonomyPublic,
} from '../controllers/productController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

router.get('/', getProducts);
router.get('/taxonomy', listTaxonomyPublic);
router.get('/:id', getProductById);
router.post(
  '/farmer',
  authenticate,
  authorize('farmer'),
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'certifications', maxCount: 5 },
    { name: 'gallery', maxCount: 5 },
  ]),
  createFarmerProduct
);
router.patch(
  '/:id/farmer',
  authenticate,
  authorize('farmer'),
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'certifications', maxCount: 5 },
    { name: 'gallery', maxCount: 5 },
  ]),
  updateFarmerProductController
);
router.post(
  '/:id/resubmit',
  authenticate,
  authorize('farmer'),
  resubmitFarmerProductController
);
router.post('/:id/approve', authenticate, authorize('admin'), approveFarmerProduct);

export default router;

