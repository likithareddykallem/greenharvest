// backend/src/config/redis.js
const { createClient } = require('redis');
const config = require('./env');

const redisUrl = config.redis.url;
const redisClient = createClient({ url: redisUrl });

// Event listeners
redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});
redisClient.on('connect', () => {
  console.log('🔌 Redis client connecting...');
});
redisClient.on('ready', () => {
  console.log('✅ Redis is ready');
});
redisClient.on('end', () => {
  console.log('🔴 Redis connection closed');
});

async function connectRedis() {
  try {
    if (!redisClient.isOpen) {
      console.log(`🔄 Connecting to Redis at ${redisUrl} ...`);
      await redisClient.connect();
    } else {
      console.log('🔎 Redis client already open');
    }
  } catch (err) {
    console.error('🔥 Failed to connect Redis:', err);
    throw err;
  }
}

module.exports = {
  redisClient,
  connectRedis,
};
