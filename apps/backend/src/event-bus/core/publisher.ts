import { streamKey } from '../streams';
import type { BusMode, EventEnvelope, EventName, PublishOptions } from '../types';
import { createUuid, nowIso } from '../types';

export class EventPublisher {
  constructor(
    private redisPub: any,
    private serviceName: string,
    private getMode: () => BusMode,
    private localDispatch: (envelope: EventEnvelope) => Promise<void>
  ) {}

  async publish<T = unknown>(name: EventName, payload: T, options?: PublishOptions): Promise<void> {
    const envelope: EventEnvelope<T> = {
      name,
      payload,
      meta: {
        id: createUuid(),
        occurredAt: nowIso(),
        source: this.serviceName,
        correlationId: options?.correlationId,
        causationId: options?.causationId,
        version: 1,
      },
    };

    const execute = async () => {
      const mode = this.getMode();
      const durability = options?.durability;

      // Route explicitly by durability when provided
      if (durability === 'persistent') {
        await this.publishPersistent(envelope, mode);
        return;
      }

      if (durability === 'ephemeral') {
        await this.publishEphemeral(envelope, mode, options?.broadcast ?? true);
        return;
      }

      // No explicit durability - default routing by mode
      await this.publishByMode(envelope, mode, options);
    };

    if (options?.delayMs && options.delayMs > 0) {
      setTimeout(() => { void execute(); }, options.delayMs);
    } else {
      await execute();
    }
  }

  private async publishPersistent<T>(envelope: EventEnvelope<T>, mode: BusMode): Promise<void> {
    if (mode === 'redis-streams' || mode === 'hybrid') {
      const key = streamKey(envelope.name);
      await this.redisPub.xAdd(key, '*', { envelope: JSON.stringify(envelope) });
    } else {
      // redis-broadcast mode: fallback to local dispatch + broadcast
      await this.localDispatch(envelope);
      await this.redisPub.publish(`events:${envelope.name}`, JSON.stringify(envelope));
    }
  }

  private async publishEphemeral<T>(envelope: EventEnvelope<T>, mode: BusMode, broadcast: boolean): Promise<void> {
    // Always dispatch locally for ephemeral events
    await this.localDispatch(envelope);

    // Broadcast to other instances if broadcast enabled and not pure streams mode
    if (broadcast && (mode === 'redis-broadcast' || mode === 'hybrid')) {
      await this.redisPub.publish(`events:${envelope.name}`, JSON.stringify(envelope));
    }
  }

  private async publishByMode<T>(envelope: EventEnvelope<T>, mode: BusMode, options?: PublishOptions): Promise<void> {
    switch (mode) {
      case 'redis-streams':
        await this.publishPersistent(envelope, mode);
        break;
      case 'redis-broadcast':
        await this.publishEphemeral(envelope, mode, options?.broadcast ?? true);
        break;
      case 'hybrid':
        // Hybrid default: persistent unless explicitly specified
        await this.publishPersistent(envelope, mode);
        break;
      default:
        throw new Error(`Unsupported bus mode: ${mode}`);
    }
  }
}
