import { errorBoundaryMiddleware, loggerMiddleware } from '../middleware';
import type { BusMode, EventBusConfig, EventHandler, EventName, Middleware, PublishOptions, SubscribeOptions } from '../types';
import { EventDispatcher } from './dispatcher';
import { HealthMonitor } from './health-monitor';
import { EventPublisher } from './publisher';
import { EventSubscriber } from './subscriber';
import { RedisTransport } from './transport';
import { EventValidator, type EventSchema } from './validator';

export class EventBus {
  private mode: BusMode;
  private serviceName: string;
  private started = false;

  private publisher: EventPublisher;
  private subscriber: EventSubscriber;
  private transport: RedisTransport;
  private dispatcher: EventDispatcher;
  private healthMonitor: HealthMonitor;
  private validator: EventValidator;

  constructor(config?: EventBusConfig) {
    // Validate and set mode - no in-memory mode allowed
    const rawMode = config?.mode ?? process.env.EVENT_BUS_MODE ?? 'hybrid';
    if (rawMode === 'in-memory') {
      throw new Error('in-memory mode is not supported. Use redis-broadcast, redis-streams, or hybrid mode.');
    }
    this.mode = rawMode as BusMode;
    this.serviceName = config?.serviceName ?? process.env.SERVICE_NAME ?? process.env.INSTANCE_ID ?? 'backend';

    // Validate Redis dependency
    if (!process.env.REDIS_URL) {
      throw new Error('REDIS_URL environment variable is required for event bus operation');
    }

    this.initializeModules(config);
  }

  private initializeModules(config?: EventBusConfig): void {
    // Import Redis here to avoid circular dependency issues
    const { redis } = require('../../config/redis');

    if (!redis) {
      throw new Error('Redis connection is required but not available');
    }

    // Initialize core modules
    this.validator = new EventValidator();
    this.subscriber = new EventSubscriber();
    this.dispatcher = new EventDispatcher(this.subscriber);
    this.transport = new RedisTransport({
      mode: this.mode,
      serviceName: this.serviceName,
      redis,
    });
    this.publisher = new EventPublisher(
      redis,
      this.serviceName,
      () => this.mode,
      (envelope) => {
        // Validate before dispatching
        this.validator.validateEvent(envelope);
        return this.dispatcher.dispatch(envelope);
      }
    );
    this.healthMonitor = new HealthMonitor(
      this.mode,
      this.serviceName,
      this.transport,
      this.subscriber,
      this.dispatcher
    );

    // Add default middlewares
    this.addMiddleware(errorBoundaryMiddleware);
    this.addMiddleware(loggerMiddleware);
  }

  addMiddleware(middleware: Middleware): void {
    this.dispatcher.addMiddleware(middleware);
  }

  subscribe<T = unknown>(name: EventName, handler: EventHandler<T>, options?: SubscribeOptions): void {
    try {
      this.subscriber.subscribe(name, handler, options);

      // If already started and streams enabled, ensure the stream loop
      if (this.started && this.isStreamsEnabled()) {
        const group = options?.group ?? 'default';
        this.transport.ensureStreamLoop(name, group, (env, g) => this.dispatcher.dispatch(env, g));
      }
    } catch (error) {
      this.healthMonitor.recordError(`Subscription failed for ${name}: ${error}`);
      throw new Error(`Failed to subscribe to event ${name}: ${error}`);
    }
  }

  async publish<T = unknown>(name: EventName, payload: T, options?: PublishOptions): Promise<void> {
    if (!this.started) {
      throw new Error('EventBus must be started before publishing events');
    }

    try {
      await this.publisher.publish(name, payload, options);
    } catch (error) {
      this.healthMonitor.recordError(`Publish failed for ${name}: ${error}`);
      throw new Error(`Failed to publish event ${name}: ${error}`);
    }
  }

  async start(): Promise<void> {
    if (this.started) {
      console.warn('⚠️  EventBus is already started');
      return;
    }

    try {
      await this.transport.start(
        (envelope) => this.dispatcher.dispatch(envelope),
        (envelope, group) => this.dispatcher.dispatch(envelope, group),
        () => this.subscriber.getAllGroups()
      );

      this.started = true;
      console.log(`✅ EventBus started successfully in ${this.mode} mode`);

    } catch (error) {
      this.healthMonitor.recordError(`Failed to start EventBus: ${error}`);
      console.error('❌ EventBus startup failed:', error);
      throw new Error(`EventBus startup failed: ${error}`);
    }
  }

  async stop(): Promise<void> {
    if (!this.started) {
      console.warn('⚠️  EventBus is already stopped');
      return;
    }

    try {
      await this.transport.stop();
      this.started = false;
      console.log('✅ EventBus stopped successfully');
    } catch (error) {
      this.healthMonitor.recordError(`Failed to stop EventBus: ${error}`);
      console.error('❌ EventBus shutdown failed:', error);
      throw error;
    }
  }

  health() {
    return this.healthMonitor.getHealth(this.started);
  }

  detailedHealth() {
    return this.healthMonitor.getDetailedHealth(this.started);
  }

  async ping(): Promise<boolean> {
    return this.healthMonitor.ping();
  }

  registerEventSchema<T>(schema: EventSchema<T>): void {
    this.validator.registerSchema(schema);
  }

  getRegisteredSchemas(): EventName[] {
    return this.validator.getRegisteredSchemas();
  }

  private isStreamsEnabled(): boolean {
    return this.mode === 'redis-streams' || this.mode === 'hybrid';
  }

  // Utility methods for debugging and monitoring
  getMode(): BusMode {
    return this.mode;
  }

  getServiceName(): string {
    return this.serviceName;
  }

  isStarted(): boolean {
    return this.started;
  }

  // Advanced monitoring and debugging
  async inspectDeadLetterQueue(eventName: EventName): Promise<any[]> {
    try {
      const { redis } = require('../../config/redis');
      const dlqKey = `events:dlq:${eventName}`;
      const messages = await redis.xRead([{ key: dlqKey, id: '0-0' }], { COUNT: 100 });
      return messages || [];
    } catch (error) {
      console.error(`❌ Failed to inspect DLQ for ${eventName}:`, error);
      return [];
    }
  }

  async clearDeadLetterQueue(eventName: EventName): Promise<void> {
    try {
      const { redis } = require('../../config/redis');
      const dlqKey = `events:dlq:${eventName}`;
      await redis.del(dlqKey);
      console.log(`🗑️  Cleared DLQ for event: ${eventName}`);
    } catch (error) {
      console.error(`❌ Failed to clear DLQ for ${eventName}:`, error);
      throw error;
    }
  }
}
