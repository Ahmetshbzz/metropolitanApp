import { corporateAuth } from './corporate';
import { registerAuthEventHandlers } from './events';
import { individualAuth } from './individual';
import { otpService } from './otp';
import { sessionService } from './session';

// Auth module orchestrator
export class AuthModule {
  static async init() {
    registerAuthEventHandlers();
    console.log('🔐 Auth module initialized');
  }

  // Public interface
  static corporate = corporateAuth;
  static individual = individualAuth;
  static otp = otpService;
  static session = sessionService;
}

export * from './types';
export { AuthModule as auth };
