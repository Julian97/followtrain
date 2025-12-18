// redisClient.js - Redis connection module
const redis = require('redis');

// Create Redis client
let redisClient;

// Initialize Redis client
const initializeRedis = async () => {
  // Only initialize if REDIS_URL is provided
  if (process.env.REDIS_URL) {
    try {
      redisClient = redis.createClient({
        url: process.env.REDIS_URL
      });

      // Handle connection events
      redisClient.on('connect', () => {
        console.log('Redis client connecting...');
      });

      redisClient.on('ready', () => {
        console.log('Redis client connected and ready');
      });

      redisClient.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });

      redisClient.on('end', () => {
        console.log('Redis client disconnected');
      });

      await redisClient.connect();
      console.log('Redis initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      redisClient = null;
    }
  } else {
    console.log('REDIS_URL not provided, Redis caching disabled');
    redisClient = null;
  }
};

// Get Redis client instance
const getRedisClient = () => {
  return redisClient;
};

// Gracefully shutdown Redis connection
const shutdownRedis = async () => {
  if (redisClient && redisClient.isOpen) {
    try {
      await redisClient.quit();
      console.log('Redis connection closed');
    } catch (error) {
      console.error('Error closing Redis connection:', error);
    }
  }
};

module.exports = {
  initializeRedis,
  getRedisClient,
  shutdownRedis
};