import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { env } from './config/env.js';
import { connectMongo } from './config/mongo.js';
import { redis } from './config/redis.js';
import { eventBus } from './utils/eventBus.js';

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.corsOrigin,
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  socket.on('join_order', (orderId) => socket.join(`order:${orderId}`));
});

eventBus.on('order:created', (order) => {
  io.to(`order:${order.id}`).emit('order:update', order);
});

eventBus.on('order:updated', (order) => {
  io.to(`order:${order.id}`).emit('order:update', order);
});

const start = async () => {
  await connectMongo();
  redis.ping().catch((err) => console.error('Redis ping failed', err));
  server.listen(env.port, () => {
    console.log(`Server listening on port ${env.port}`);
  });
};

start();

