import { EventBus } from './core/event-bus';
import type { BusMode, EventEnvelope, EventHandler, PublishOptions, SubscribeOptions } from './types';
import { allSchemas } from './schemas';

// Validate environment and create EventBus instance
const mode = (process.env.EVENT_BUS_MODE as BusMode) || 'hybrid';
const serviceName = process.env.SERVICE_NAME || process.env.INSTANCE_ID || 'backend';

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL environment variable is required for EventBus operation');
}

export const eventBus = new EventBus({ mode, serviceName });

export async function initEventBus() {
  // Register all event schemas for validation
  console.log('📋 Registering event schemas...');
  for (const schema of allSchemas) {
    eventBus.registerEventSchema(schema);
  }
  console.log(`✅ Registered ${allSchemas.length} event schemas`);

  // Start the event bus
  await eventBus.start();
}

// Helper publishers
export async function publishEphemeral<T>(name: string, payload: T, options?: Omit<PublishOptions, 'durability'>) {
  await eventBus.publish<T>(name, payload, { ...options, durability: 'ephemeral', broadcast: true });
}

export async function publishPersistent<T>(name: string, payload: T, options?: Omit<PublishOptions, 'durability'>) {
  await eventBus.publish<T>(name, payload, { ...options, durability: 'persistent' });
}

export type { EventBus } from './core/event-bus';
export type {
  BusMode,
  EventEnvelope,
  EventHandler,
  PublishOptions,
  SubscribeOptions,
} from './types';
