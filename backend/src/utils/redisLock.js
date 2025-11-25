// backend/src/utils/redisLock.js

const { redisClient } = require('../config/redis');

const acquireLock = async (key, ttlMs = 5000, value = Date.now().toString()) => {
  const lockKey = `lock:${key}`;
  const result = await redisClient.set(lockKey, value, { NX: true, PX: ttlMs });
  return result === 'OK';
};

const releaseLock = async (key) => {
  const lockKey = `lock:${key}`;
  await redisClient.del(lockKey);
};

module.exports = {
  acquireLock,
  releaseLock,
};

