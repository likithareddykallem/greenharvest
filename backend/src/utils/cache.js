// backend/src/utils/cache.js

const { redisClient } = require('../config/redis');

const parse = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (err) {
    return null;
  }
};

const get = async (key) => parse(await redisClient.get(key));

const set = async (key, value, ttlSeconds = 300) => {
  const payload = JSON.stringify(value);
  if (ttlSeconds) {
    await redisClient.set(key, payload, { EX: ttlSeconds });
  } else {
    await redisClient.set(key, payload);
  }
};

const del = async (key) => redisClient.del(key);

const remember = async (key, ttlSeconds, fetcher) => {
  const cached = await get(key);
  if (cached) return cached;
  const value = await fetcher();
  if (value !== undefined && value !== null) {
    await set(key, value, ttlSeconds);
  }
  return value;
};

module.exports = {
  get,
  set,
  del,
  remember,
};

