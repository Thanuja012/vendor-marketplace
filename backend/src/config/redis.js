const Redis = require('ioredis');
const logger = require('../utils/logger');

let redisClient = null;

const connectRedis = () => {
  try {
    redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => {
        if (times > 3) return null;
        return Math.min(times * 200, 1000);
      },
    });

    redisClient.on('connect', () => logger.info('Redis connected'));
    redisClient.on('error', (err) => {
      logger.warn(`Redis error: ${err.message} - caching disabled`);
    });

    redisClient.connect().catch(() => {});
  } catch (err) {
    logger.warn('Redis unavailable - running without cache');
  }
  return redisClient;
};

const getCache = async (key) => {
  if (!redisClient || redisClient.status !== 'ready') return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
};

const setCache = async (key, value, ttl = 300) => {
  if (!redisClient || redisClient.status !== 'ready') return;
  try {
    await redisClient.setex(key, ttl, JSON.stringify(value));
  } catch { /* silent */ }
};

const delCache = async (key) => {
  if (!redisClient || redisClient.status !== 'ready') return;
  try { await redisClient.del(key); } catch { /* silent */ }
};

const delCachePattern = async (pattern) => {
  if (!redisClient || redisClient.status !== 'ready') return;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length) await redisClient.del(...keys);
  } catch { /* silent */ }
};

module.exports = { connectRedis, getCache, setCache, delCache, delCachePattern };
