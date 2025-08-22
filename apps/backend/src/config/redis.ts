import { createClient } from 'redis';

// Redis connection configuration
const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';

export const redis = createClient({
  url: redisUrl,
});

redis.on('error', (err): void => {
  console.error('❌ Redis Client Error:', err);
});

redis.on('connect', (): void => {
  // console.log('✅ Redis connected successfully');
});

// Connect to Redis
export async function connectRedis(): Promise<boolean> {
  try {
    await redis.connect();
    // console.log('✅ Redis connection established');
    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    return false;
  }
}

// Disconnect from Redis
export async function disconnectRedis(): Promise<void> {
  try {
    await redis.disconnect();
    // console.log('✅ Redis disconnected');
  } catch (error) {
    console.error('❌ Redis disconnect error:', error);
  }
}
