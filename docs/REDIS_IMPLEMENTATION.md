# Redis Implementation in FollowTrain

This document describes the Redis caching implementation in the FollowTrain application, which improves performance by caching frequently accessed data.

## Overview

Redis is used as a caching layer to reduce database load and improve response times for frequently requested data. The implementation includes caching for:

1. Social media profile data (5-minute TTL)
2. Train data (1-hour TTL)
3. Statistics data (10-minute TTL)

## Implementation Details

### Cache Structure

The Redis cache uses the following key structure:

- `profile:{platform}:{username}` - Cached social media profiles
- `train:{trainId}` - Cached train data
- `stats:all` - Cached statistics data

### Cache TTL (Time-To-Live)

- Profile data: 5 minutes (300 seconds)
- Train data: 1 hour (3600 seconds)
- Statistics data: 10 minutes (600 seconds)

## Enabling Redis

To enable Redis caching, set the `REDIS_URL` environment variable:

```bash
REDIS_URL=redis://localhost:6379
```

If `REDIS_URL` is not provided, caching will be disabled automatically.

## Zeabur Deployment

When deploying on Zeabur:

1. Add a Redis service to your project
2. The `REDIS_CONNECTION_STRING` environment variable will be automatically injected
3. The backend service is configured to use this connection string

## Cache Invalidation

The implementation includes automatic cache invalidation:

- Creating or updating a train invalidates the train cache
- Updating train data invalidates statistics cache
- Profile data expires automatically based on TTL

## Files

- `redisClient.js` - Redis connection management
- `cache.js` - Cache operations and TTL management
- `server.js` - Integration with existing database queries

## Benefits

1. **Reduced Database Load**: Frequently accessed data is served from cache
2. **Improved Response Times**: Cached data retrieval is significantly faster
3. **Scalability**: Reduced database connections under high load
4. **Graceful Degradation**: Application works without Redis if not configured

## Monitoring

Cache hits are logged to the console for monitoring purposes:

```
Instagram profile cache hit for username
Train cache hit for ABC123
Stats cache hit
```