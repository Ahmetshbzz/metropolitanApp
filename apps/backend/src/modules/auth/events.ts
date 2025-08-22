import { eventBus } from '../../event-bus';
import type { AuthEventPayloads } from './types';

export function registerAuthEventHandlers() {
  // User registered handler
  eventBus.subscribe<AuthEventPayloads['auth.user.registered']>('auth.user.registered', async ({ payload, meta }) => {
    console.log(`✅ User registered: ${payload.userType} - ${payload.phone}`, {
      userId: payload.userId,
      provider: payload.provider,
      source: meta.source
    });

    // Burada welcome email, analytics tracking vs. tetiklenebilir
  }, {
    group: 'auth-handlers',
    concurrency: 2
  });

  // User login handler
  eventBus.subscribe<AuthEventPayloads['auth.user.login']>('auth.user.login', async ({ payload, meta }) => {
    console.log(`🔐 User login: ${payload.userType}`, {
      userId: payload.userId,
      method: payload.loginMethod,
      source: meta.source
    });

    // Login analytics, security alerts vs.
  }, {
    group: 'auth-handlers',
    concurrency: 3
  });

  // OTP sent handler
  eventBus.subscribe<AuthEventPayloads['auth.otp.sent']>('auth.otp.sent', async ({ payload }) => {
    console.log(`📱 OTP sent: ${payload.phone} for ${payload.purpose}`);

    // OTP analytics, rate limiting check vs.
  }, {
    group: 'auth-handlers',
    concurrency: 5
  });

  console.log('🔐 Auth event handlers registered');
}
