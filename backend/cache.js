// cache.js - Cache management module
const { getRedisClient } = require('./redisClient');

// Cache TTL constants (in seconds)
const CACHE_TTL = {
  PROFILE: 300, // 5 minutes
  TRAIN: 3600,  // 1 hour
  STATS: 600    // 10 minutes
};

// Get cached data
const getCachedData = async (key) => {
  const redisClient = getRedisClient();
  if (!redisClient) return null;

  try {
    const data = await redisClient.get(key);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

// Set cached data
const setCachedData = async (key, data, ttl = CACHE_TTL.TRAIN) => {
  const redisClient = getRedisClient();
  if (!redisClient) return false;

  try {
    await redisClient.setEx(key, ttl, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
};

// Delete cached data
const deleteCachedData = async (key) => {
  const redisClient = getRedisClient();
  if (!redisClient) return false;

  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Cache delete error:', error);
    return false;
  }
};

// Clear all cache for a specific pattern
const clearCachePattern = async (pattern) => {
  const redisClient = getRedisClient();
  if (!redisClient) return false;

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch (error) {
    console.error('Cache pattern clear error:', error);
    return false;
  }
};

module.exports = {
  CACHE_TTL,
  getCachedData,
  setCachedData,
  deleteCachedData,
  clearCachePattern
};