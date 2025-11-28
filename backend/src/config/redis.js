import Redis from 'ioredis';
import { env } from './env.js';

// Lightweight in-memory Redis substitute for tests so we don't need extra deps.
class FakeRedis {
  constructor() {
    this.store = new Map();
    this.ttl = new Map();
  }

  async set(key, value, mode, durationType, duration) {
    if (mode === 'NX' && this.store.has(key)) {
      return null;
    }
    this.store.set(key, value);
    if (this.ttl.has(key)) {
      clearTimeout(this.ttl.get(key));
      this.ttl.delete(key);
    }
    if (durationType === 'EX' && typeof duration === 'number') {
      const timer = setTimeout(() => {
        this.store.delete(key);
        this.ttl.delete(key);
      }, duration * 1000);
      timer.unref?.();
      this.ttl.set(key, timer);
    }
    return 'OK';
  }

  async get(key) {
    return this.store.get(key) ?? null;
  }

  async del(key) {
    this.store.delete(key);
    if (this.ttl.has(key)) {
      clearTimeout(this.ttl.get(key));
      this.ttl.delete(key);
    }
    return 1;
  }

  async ping() {
    return 'PONG';
  }
}

const redis =
  process.env.NODE_ENV === 'test'
    ? new FakeRedis()
    : new Redis(env.redisUrl, {
        lazyConnect: true,
      });

if (redis instanceof Redis) {
  redis.on('error', (err) => {
    console.error('Redis connection error', err);
  });
}

export { redis };

