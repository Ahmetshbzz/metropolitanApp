import type { EventSchema } from '../core/validator';

// System schemas
export const coreSchemas: EventSchema[] = [
  {
    name: 'system.started',
    description: 'System startup event',
    validate: (payload): payload is { timestamp: string; version?: string } => {
      return typeof payload === 'object' &&
             payload !== null &&
             'timestamp' in payload &&
             typeof (payload as Record<string, unknown>).timestamp === 'string';
    }
  },
  {
    name: 'system.health.check',
    description: 'Health check event',
    validate: (payload): payload is { status: string; details?: unknown } => {
      return typeof payload === 'object' &&
             payload !== null &&
             'status' in payload &&
             typeof (payload as Record<string, unknown>).status === 'string';
    }
  }
];

// Auth module schemas
export const authSchemas: EventSchema[] = [
  {
    name: 'auth.user.registered',
    description: 'User registration completed',
    validate: (payload): payload is { userId: string; userType: string; phone: string; provider: string } => {
      return typeof payload === 'object' &&
             payload !== null &&
             'userId' in payload &&
             'userType' in payload &&
             'phone' in payload &&
             'provider' in payload;
    }
  },
  {
    name: 'auth.user.login',
    description: 'User login completed',
    validate: (payload): payload is { userId: string; sessionId: string; userType: string; loginMethod: string } => {
      return typeof payload === 'object' &&
             payload !== null &&
             'userId' in payload &&
             'sessionId' in payload &&
             'userType' in payload &&
             'loginMethod' in payload;
    }
  },
  {
    name: 'auth.otp.sent',
    description: 'OTP code sent to phone',
    validate: (payload): payload is { phone: string; purpose: string } => {
      return typeof payload === 'object' &&
             payload !== null &&
             'phone' in payload &&
             'purpose' in payload;
    }
  }
];

// All schemas combined
export const allSchemas: EventSchema[] = [
  ...coreSchemas,
  ...authSchemas,
];
