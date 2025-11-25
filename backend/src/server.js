// backend/src/server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');

const connectDB = require('./config/database');
const { connectRedis, redisClient } = require('./config/redis');
const config = require('./config/env');
const apiRouter = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const { httpMetricsMiddleware, metricsHandler } = require('./metrics');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: config.server.frontendUrl,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middlewares
app.use(helmet());
app.use(cors({ origin: config.server.frontendUrl, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(compression());
app.use(morgan('dev'));
app.use(httpMetricsMiddleware);

// simple logger for requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} → ${req.method} ${req.originalUrl} from ${req.ip}`);
  next();
});

// Basic routes
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => res.json({ message: 'GreenHarvest minimal server (Redis + MongoDB) is running.' }));
app.get('/metrics', metricsHandler);

// Example Redis test route
app.get('/redis-test', async (req, res) => {
  try {
    const key = 'health:visits';
    // increment a counter in redis
    const visits = await redisClient.incr(key);
    // set a TTL of 1 hour if first visit
    if (visits === 1) await redisClient.expire(key, 3600);
    res.json({ redis: true, visits });
  } catch (err) {
    console.error('Redis test failed:', err);
    res.status(500).json({ redis: false, error: err.message });
  }
});

// API routes
app.use('/api/v1', apiLimiter, apiRouter);

app.use(notFound);
app.use(errorHandler);

// Socket.IO basic events
io.on('connection', (socket) => {
  console.log('⚡ New socket connection:', socket.id);
  socket.on('ping', (msg) => {
    console.log('socket ping:', msg);
    socket.emit('pong', { message: 'pong', received: msg });
  });
  socket.on('disconnect', (reason) => {
    console.log('⚡ socket disconnected:', socket.id, reason);
  });
});

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n📴 ${signal} received — shutting down gracefully...`);
  try {
    server.close(() => console.log('HTTP server closed.'));
    if (io) {
      io.close(() => console.log('Socket.IO closed.'));
    }
    try {
      await redisClient.quit();
      console.log('Redis client closed.');
    } catch (e) {
      console.warn('Error closing Redis client:', e.message || e);
    }
    const mongoose = require('mongoose');
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
    } catch (e) {
      console.warn('Error closing MongoDB:', e.message || e);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  shutdown('unhandledRejection');
});

// Start function
const startServer = async () => {
  try {
    // connect DBs (await ensures we fail fast and log)
    await connectDB();
    await connectRedis();

    const PORT = config.server.port;
    server.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log(`🌱 GreenHarvest Server Started`);
      console.log(`Environment: ${config.env}`);
      console.log(`Port: ${PORT}`);
      console.log(`Redis URL: ${config.redis.url}`);
      console.log(`MongoDB URI: ${config.mongo.uri}`);
      console.log(`Time: ${new Date().toISOString()}`);
      console.log('='.repeat(50));
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('FATAL: failed to start server:', err);
    process.exit(1);
  }
};

startServer();

// export for tests if needed
module.exports = { app, server, io };
