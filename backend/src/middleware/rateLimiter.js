const rateLimit = require('express-rate-limit');
const { redisClient } = require('../config/redis');

// Custom rate limit store using Redis
class RedisStore {
  constructor(options) {
    this.client = options.client;
    this.prefix = options.prefix || 'rl:';
    this.windowMs = options.windowMs;
  }

  async increment(key) {
    const redisKey = this.prefix + key;
    const current = await this.client.incr(redisKey);
    
    if (current === 1) {
      await this.client.expire(redisKey, Math.ceil(this.windowMs / 1000));
    }
    
    return {
      totalHits: current,
      resetTime: new Date(Date.now() + this.windowMs)
    };
  }

  async decrement(key) {
    const redisKey = this.prefix + key;
    await this.client.decr(redisKey);
  }

  async resetKey(key) {
    const redisKey = this.prefix + key;
    await this.client.del(redisKey);
  }
}

// Create rate limiter
const createLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      client: redisClient,
      windowMs
    })
  });
};

// Different rate limiters
exports.authLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  5,
  'Too many authentication attempts, please try again later'
);

exports.apiLimiter = createLimiter(
  15 * 60 * 1000,
  100,
  'Too many requests, please try again later'
);

exports.strictLimiter = createLimiter(
  60 * 60 * 1000, // 1 hour
  10,
  'Too many requests, please try again later'
);