import { connectRedis, redis } from "./config/redis";
import { db, testConnection } from "./db/connection";
import { products } from "./db/schema";

// Initialize connections
export async function initializeServices() {
  console.log('🔄 Initializing services...');

  const redisConnected = await connectRedis();
  await redis.ping();

  const dbConnected = await testConnection();
  await db.select().from(products).limit(1);

  if (!dbConnected || !redisConnected) {
    console.error('❌ Failed to connect to required services');
    process.exit(1);
  }

  console.log('✅ All services initialized successfully');
}
