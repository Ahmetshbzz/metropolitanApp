import type { EventEnvelope, EventName } from '../types';

export type EventSchema<T = unknown> = {
  name: EventName;
  validate: (payload: unknown) => payload is T;
  description?: string;
};

export class EventValidator {
  private schemas: Map<EventName, EventSchema> = new Map();

  registerSchema<T>(schema: EventSchema<T>): void {
    if (this.schemas.has(schema.name)) {
      console.warn(`⚠️  Schema for event '${schema.name}' is being overwritten`);
    }
    this.schemas.set(schema.name, schema);
    // Schema registered successfully
  }

  validateEvent<T>(envelope: EventEnvelope<T>): boolean {
    // Basic envelope validation
    if (!envelope.name || typeof envelope.name !== 'string') {
      throw new Error('Event envelope must have a valid name');
    }

    if (!envelope.meta?.id || !envelope.meta.occurredAt || !envelope.meta.source) {
      throw new Error('Event envelope must have complete metadata');
    }

    // Validate payload against registered schema if available
    const schema = this.schemas.get(envelope.name);
    if (schema) {
      if (!schema.validate(envelope.payload)) {
        throw new Error(`Event payload validation failed for '${envelope.name}'`);
      }
    }

    return true;
  }

  getRegisteredSchemas(): EventName[] {
    return Array.from(this.schemas.keys());
  }

  getSchema(eventName: EventName): EventSchema | undefined {
    return this.schemas.get(eventName);
  }

  validatePayload<T>(eventName: EventName, payload: unknown): payload is T {
    const schema = this.schemas.get(eventName);
    if (!schema) {
      console.warn(`⚠️  No schema registered for event '${eventName}', skipping validation`);
      return true;
    }
    return schema.validate(payload);
  }
}

// Common event schemas for the app
export const createUserRegisteredSchema = (): EventSchema<{ userId: string }> => ({
  name: 'auth.user.registered',
  description: 'Fired when a new user registers',
  validate: (payload): payload is { userId: string } => {
    return typeof payload === 'object' &&
           payload !== null &&
           'userId' in payload &&
           typeof (payload as Record<string, unknown>).userId === 'string' &&
           (payload as Record<string, unknown>).userId.length > 0;
  }
});

export const createCacheInvalidateSchema = (): EventSchema<{ key: string; pattern?: string }> => ({
  name: 'cache.invalidate',
  description: 'Fired when cache needs to be invalidated',
  validate: (payload): payload is { key: string; pattern?: string } => {
    return typeof payload === 'object' &&
           payload !== null &&
           'key' in payload &&
           typeof (payload as Record<string, unknown>).key === 'string' &&
           (payload as Record<string, unknown>).key.length > 0;
  }
});
