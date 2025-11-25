// backend/src/routes/productRoutes.js

const express = require('express');
const productController = require('../controllers/productController');
const { validate } = require('../middleware/validation');
const { protect, authorize } = require('../middleware/auth');
const { USER_ROLES } = require('../utils/constants');

const router = express.Router();

router.get('/', productController.listProducts);
router.get('/:id', productController.getProduct);

router.post(
  '/',
  protect,
  authorize(USER_ROLES.FARMER, USER_ROLES.ADMIN),
  validate('createProduct'),
  productController.createProduct
);

router.put(
  '/:id',
  protect,
  authorize(USER_ROLES.FARMER, USER_ROLES.ADMIN),
  productController.updateProduct
);

router.delete(
  '/:id',
  protect,
  authorize(USER_ROLES.FARMER, USER_ROLES.ADMIN),
  productController.deleteProduct
);

module.exports = router;

