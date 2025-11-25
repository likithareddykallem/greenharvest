// backend/src/routes/orderRoutes.js

const express = require('express');
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { USER_ROLES } = require('../utils/constants');

const router = express.Router();

router.post('/', protect, validate('createOrder'), orderController.createOrder);
router.get('/', protect, orderController.listOrders);
router.get('/:id', protect, orderController.getOrder);
router.patch(
  '/:id/status',
  protect,
  authorize(USER_ROLES.FARMER, USER_ROLES.ADMIN),
  orderController.updateOrderStatus
);

module.exports = router;

