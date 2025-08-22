export type EventName = string;

export type EventPayload = unknown;

export type EventMeta = {
  id: string; // uuid
  occurredAt: string; // ISO date
  source: string; // module/service name
  correlationId?: string;
  causationId?: string;
  version?: number;
};

export type EventEnvelope<T = EventPayload> = {
  name: EventName;
  payload: T;
  meta: EventMeta;
};

export type EventHandler<T = EventPayload> = (evt: EventEnvelope<T>) => Promise<void> | void;

export type Middleware = (evt: EventEnvelope, next: () => Promise<void>) => Promise<void>;

export type RetryOptions = {
  attempts: number; // total attempts including the first run
  backoffMs: (attempt: number) => number; // exponential or fixed backoff
  deadLetter?: (evt: EventEnvelope, err: unknown) => Promise<void> | void;
};

export type SubscribeOptions = {
  group?: string; // consumer group name (logical grouping)
  retry?: RetryOptions;
  concurrency?: number; // max parallel handlers per event name
};

export type PublishOptions = {
  delayMs?: number; // schedule after delay
  broadcast?: boolean; // legacy flag for broadcast
  durability?: 'ephemeral' | 'persistent'; // route to redis-broadcast or redis-streams
  correlationId?: string; // for tracing related events
  causationId?: string; // for event causation tracking
};

export type BusMode = 'redis-broadcast' | 'redis-streams' | 'hybrid';

export interface EventBusConfig {
  mode?: BusMode;
  serviceName?: string;
}

export function createUuid(): string {
  // lightweight uuid v4 (not cryptographically strong but fine for app-level IDs)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function nowIso(): string {
  return new Date().toISOString();
}
