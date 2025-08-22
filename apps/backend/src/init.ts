import { connectRedis, redis } from "./config/redis";
import { eventBus, initEventBus } from "./event-bus";
import { AuthModule } from "./modules/auth";

// Initialize connections
export async function initializeServices() {
  console.log('🔄 Initializing services...');

  const redisConnected = await connectRedis();
  await redis.ping();

  // Start modular Event Bus system
  await initEventBus();
  console.log('📡 EventBus health:', eventBus.health());

  // Initialize modules with event-driven communication
  await AuthModule.init();

  // Log detailed health for debugging
  console.log('📊 Detailed EventBus status:', eventBus.detailedHealth());

  if (!redisConnected) {
    console.error('❌ Failed to connect to required services');
    process.exit(1);
  }

  console.log('✅ All services initialized successfully');
  console.log(`🎯 EventBus ready for ${eventBus.getRegisteredSchemas().length} event types`);
}
