import type { EventSchema } from '../core/validator';

// Minimal core schemas - sadece ihtiyaç duyuldukça eklenir
export const coreSchemas: EventSchema[] = [
  {
    name: 'system.started',
    description: 'System startup event',
    validate: (payload): payload is { timestamp: string; version?: string } => {
      return typeof payload === 'object' &&
             payload !== null &&
             'timestamp' in payload &&
             typeof (payload as any).timestamp === 'string';
    }
  },
  {
    name: 'system.health.check',
    description: 'Health check event',
    validate: (payload): payload is { status: string; details?: any } => {
      return typeof payload === 'object' &&
             payload !== null &&
             'status' in payload &&
             typeof (payload as any).status === 'string';
    }
  }
];

// Export minimal schemas - yeni modüller eklendikçe buraya eklenir
export const allSchemas: EventSchema[] = [
  ...coreSchemas,
];
