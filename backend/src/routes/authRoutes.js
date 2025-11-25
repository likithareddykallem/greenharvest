// backend/src/routes/authRoutes.js

const express = require('express');
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', authLimiter, validate('register'), authController.register);
router.post('/login', authLimiter, validate('login'), authController.login);
router.post('/refresh', authLimiter, validate('refresh'), authController.refresh);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.profile);

module.exports = router;

