import type { EventHandler, EventName, SubscribeOptions, EventEnvelope } from '../types';
import { Semaphore } from '../semaphore';

export class EventSubscriber {
  private handlers: Map<EventName, Array<{ handler: EventHandler; options: SubscribeOptions }>> = new Map();
  private semaphores: Map<string, Semaphore> = new Map();

  subscribe<T = unknown>(name: EventName, handler: EventHandler<T>, options?: SubscribeOptions): void {
    const list = this.handlers.get(name) ?? [];
    list.push({ handler: handler as EventHandler, options: options ?? {} });
    this.handlers.set(name, list);

    // Prepare semaphore key per event+group for concurrency control
    const group = options?.group ?? 'default';
    const key = `${name}::${group}`;
    if (!this.semaphores.has(key)) {
      this.semaphores.set(key, new Semaphore(options?.concurrency ?? 1));
    }
  }

  getHandlers(name: EventName): Array<{ handler: EventHandler; options: SubscribeOptions }> {
    return this.handlers.get(name) ?? [];
  }

  getHandlersByGroup(name: EventName, group: string): Array<{ handler: EventHandler; options: SubscribeOptions }> {
    const list = this.handlers.get(name) ?? [];
    return list.filter(x => (x.options.group ?? 'default') === group);
  }

  getAllEventNames(): EventName[] {
    return Array.from(this.handlers.keys());
  }

  getAllGroups(): Map<EventName, string[]> {
    const result = new Map<EventName, string[]>();
    for (const [name, handlers] of this.handlers.entries()) {
      const groups = new Set(handlers.map(h => h.options.group ?? 'default'));
      result.set(name, Array.from(groups));
    }
    return result;
  }

  getSemaphore(eventName: EventName, group: string): Semaphore | undefined {
    const key = `${eventName}::${group}`;
    return this.semaphores.get(key);
  }

  getOrCreateSemaphore(eventName: EventName, group: string, concurrency: number): Semaphore {
    const key = `${eventName}::${group}`;
    let semaphore = this.semaphores.get(key);
    if (!semaphore) {
      semaphore = new Semaphore(concurrency);
      this.semaphores.set(key, semaphore);
    }
    return semaphore;
  }

  getHandlerStats(): { eventName: string; handlerCount: number; groups: string[] }[] {
    const stats: { eventName: string; handlerCount: number; groups: string[] }[] = [];
    for (const [name, handlers] of this.handlers.entries()) {
      const groups = new Set(handlers.map(h => h.options.group ?? 'default'));
      stats.push({
        eventName: name,
        handlerCount: handlers.length,
        groups: Array.from(groups)
      });
    }
    return stats;
  }
}
