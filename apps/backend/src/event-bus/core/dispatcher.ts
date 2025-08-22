import { composeMiddlewares } from '../middleware';
import type { EventEnvelope, EventHandler, Middleware, SubscribeOptions } from '../types';
import type { EventSubscriber } from './subscriber';

export class EventDispatcher {
  private middlewares: Middleware[] = [];

  constructor(private subscriber: EventSubscriber) {}

  addMiddleware(middleware: Middleware): void {
    this.middlewares.push(middleware);
  }

  async dispatch(envelope: EventEnvelope, groupFilter?: string): Promise<void> {
    const handlers = this.subscriber.getHandlers(envelope.name);
    const filteredHandlers = groupFilter
      ? handlers.filter(x => (x.options.group ?? 'default') === groupFilter)
      : handlers;

    if (filteredHandlers.length === 0) {
      // console.debug(`📭 No handlers registered for event: ${envelope.name}`);
      return;
    }

    // Process all handlers concurrently
    const processingPromises = filteredHandlers.map(async ({ handler, options }) => {
      const group = options.group ?? 'default';
      const semaphore = this.subscriber.getOrCreateSemaphore(envelope.name, group, options.concurrency ?? 1);

      const release = await semaphore.acquire();
      try {
        await this.runWithMiddlewares(envelope, async () => {
          await this.runWithRetry(envelope, handler, options);
        });
      } catch (error) {
        console.error(`❌ Unhandled error in event dispatcher for ${envelope.name}:`, error);
        throw error;
      } finally {
        release();
      }
    });

    try {
      await Promise.all(processingPromises);
    } catch (error) {
      console.error(`❌ Error processing handlers for event ${envelope.name}:`, error);
      throw error;
    }
  }

  private async runWithMiddlewares(evt: EventEnvelope, terminal: () => Promise<void>): Promise<void> {
    if (this.middlewares.length === 0) {
      await terminal();
      return;
    }

    try {
      const runner = composeMiddlewares(this.middlewares);
      await runner(evt, terminal);
    } catch (error) {
      console.error('❌ Middleware execution error:', error);
      throw error;
    }
  }

  private async runWithRetry(
    evt: EventEnvelope,
    handler: EventHandler,
    options?: SubscribeOptions
  ): Promise<void> {
    const retry = options?.retry;
    const maxAttempts = retry?.attempts ?? 1;
    let attempt = 0;

    while (true) {
      try {
        attempt += 1;
        await handler(evt);

        if (attempt > 1) {
          // console.log(`✅ Event handler succeeded after ${attempt} attempts: ${evt.name}`);
        }
        return;

      } catch (err) {
        const isLastAttempt = attempt >= maxAttempts;

        if (isLastAttempt) {
          await this.handleDeadLetter(evt, err, retry?.deadLetter);
          return;
        }

        // Calculate backoff delay
        const backoffMs = retry?.backoffMs?.(attempt) ?? 0;
        if (backoffMs > 0) {
          console.warn(`⏳ Retrying event handler in ${backoffMs}ms (attempt ${attempt}/${maxAttempts}): ${evt.name}`);
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
        } else {
          console.warn(`🔄 Retrying event handler immediately (attempt ${attempt}/${maxAttempts}): ${evt.name}`);
        }
      }
    }
  }

  private async handleDeadLetter(
    evt: EventEnvelope,
    error: unknown,
    deadLetterHandler?: (evt: EventEnvelope, err: unknown) => Promise<void> | void
  ): Promise<void> {
    console.error(`💀 Event moved to dead letter queue: ${evt.name}`, {
      eventId: evt.meta.id,
      source: evt.meta.source,
      error: error instanceof Error ? error.message : String(error)
    });

    try {
      if (deadLetterHandler) {
        await Promise.resolve(deadLetterHandler(evt, error));
      }
    } catch (dlqError) {
      console.error('❌ Dead letter handler also failed:', dlqError);
    }
  }

  getDispatchStats(): unknown {
    return {
      registeredEvents: this.subscriber.getAllEventNames().length,
      handlerStats: this.subscriber.getHandlerStats(),
      middlewareCount: this.middlewares.length,
    };
  }
}
