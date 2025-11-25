// backend/src/routes/index.js

const express = require('express');
const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const orderRoutes = require('./orderRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);

router.get('/health', (req, res) =>
  res.json({ success: true, message: 'GreenHarvest API', timestamp: new Date().toISOString() })
);

module.exports = router;

