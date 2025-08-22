import { EventEnvelope, Middleware } from './types';

export const loggerMiddleware: Middleware = async (evt: EventEnvelope, next) => {
  const start = Date.now();
  try {
    await next();
  } finally {
    const ms = Date.now() - start;
    const label = `${evt.name}`;
    console.log(`📨 event handled`, { label, ms, id: evt.meta.id, source: evt.meta.source });
  }
};

export const errorBoundaryMiddleware: Middleware = async (evt, next) => {
  try {
    await next();
  } catch (err) {
    const errorDetails = {
      eventName: evt.name,
      eventId: evt.meta.id,
      source: evt.meta.source,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    };
    console.error('❌ Event handler error:', errorDetails);
    throw err; // Let retry mechanism handle this
  }
};

export const composeMiddlewares = (middlewares: Middleware[]) => {
  return async (evt: EventEnvelope, terminal: () => Promise<void>) => {
    let index = -1;
    const dispatch = async (i: number): Promise<void> => {
      if (i <= index) throw new Error('next() called multiple times');
      index = i;
      const fn = middlewares[i] ?? terminal;
      return fn(evt, () => dispatch(i + 1));
    };
    return dispatch(0);
  };
};
