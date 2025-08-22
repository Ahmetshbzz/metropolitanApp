import { eventBus } from '../../event-bus';
import { AuditLogService } from './services';
import type { AuthEventPayloads } from '../auth/types';
import type { AuditEventPayloads } from './types';

export function registerAuditLogEventHandlers(): void {
  // Listen to auth events to create audit logs
  eventBus.subscribe<AuthEventPayloads['auth.user.registered']>('auth.user.registered', async ({ payload }) => {
    // Create audit log for user registration
    void AuditLogService.createFromAuth0Log({
      date: new Date().toISOString(),
      type: 'scp', // Successful signup
      description: 'User registration completed successfully',
      ip: '0.0.0.0', // Will be updated with actual IP from request context
      user_id: payload.userId,
      user_name: payload.phone,
      log_id: `reg_${Date.now()}_${payload.userId}`,
      connection: payload.provider === 'phone_otp' ? 'sms' : payload.provider,
      client_id: process.env.AUTH0_CLIENT_ID ?? 'unknown'
    });
  }, {
    group: 'audit-handlers',
    concurrency: 3
  });

  eventBus.subscribe<AuthEventPayloads['auth.user.login']>('auth.user.login', async ({ payload }) => {
    // Create audit log for successful login
    void AuditLogService.createFromAuth0Log({
      date: new Date().toISOString(),
      type: 's', // Successful login
      description: 'User login successful',
      ip: '0.0.0.0', // Will be updated with actual IP from request context
      user_id: payload.userId,
      log_id: `login_${Date.now()}_${payload.sessionId}`,
      connection: payload.loginMethod === 'phone_otp' ? 'sms' : payload.loginMethod,
      client_id: process.env.AUTH0_CLIENT_ID ?? 'unknown'
    });
  }, {
    group: 'audit-handlers',
    concurrency: 3
  });

  eventBus.subscribe<AuthEventPayloads['auth.otp.sent']>('auth.otp.sent', async ({ payload }) => {
    // Create audit log for OTP sent
    void AuditLogService.createFromAuth0Log({
      date: new Date().toISOString(),
      type: 'sepft', // Send phone factor
      description: `OTP sent for ${payload.purpose}`,
      ip: '0.0.0.0', // Will be updated with actual IP from request context
      user_name: payload.phone,
      log_id: `otp_${Date.now()}_${payload.phone.replace(/\D/g, '')}`,
      connection: 'sms',
      client_id: process.env.AUTH0_CLIENT_ID ?? 'unknown'
    });
  }, {
    group: 'audit-handlers',
    concurrency: 5
  });

  // Handle audit-specific events
  eventBus.subscribe<AuditEventPayloads['audit.log.created']>('audit.log.created', async ({ payload }) => {
    // Log audit event creation (for monitoring)
    // console.log(`📋 Audit log created: ${payload.type} for ${payload.userId ?? 'anonymous'} from ${payload.ip}`);
    
    // Could trigger additional analysis or notifications here
    if (payload.riskScore >= 80) {
      console.warn(`⚠️ High risk audit event detected: ${payload.logId} (Score: ${payload.riskScore})`);
    }
  }, {
    group: 'audit-analysis',
    concurrency: 2
  });

  eventBus.subscribe<AuditEventPayloads['audit.ip.risk.elevated']>('audit.ip.risk.elevated', async ({ payload }) => {
    console.warn(`🚨 IP risk elevated: ${payload.ip} from ${payload.previousLevel} to ${payload.currentLevel}`);
    
    // Could trigger automated blocking or alerts here
    if (payload.currentLevel === 'critical') {
      // Auto-block critical IPs
      // await IpBlockingService.blockIp(payload.ip, 'Automated: Critical risk level');
    }
  }, {
    group: 'audit-security',
    concurrency: 1
  });

  eventBus.subscribe<AuditEventPayloads['audit.user.suspicious.activity']>('audit.user.suspicious.activity', async ({ payload }) => {
    console.warn(`👤 Suspicious user activity: ${payload.userId} - ${payload.activityType} (Score: ${payload.riskScore})`);
    
    // Could trigger user account security measures
    if (payload.riskScore >= 90) {
      // Force password reset, lock account, etc.
      // await UserSecurityService.enforceSecurityMeasures(payload.userId);
    }
  }, {
    group: 'audit-security',
    concurrency: 2
  });

  eventBus.subscribe<AuditEventPayloads['audit.log.analysis.completed']>('audit.log.analysis.completed', async ({ payload: _payload }) => {
    // Log analysis completion for monitoring
    // console.log(`🔍 Log analysis completed: ${payload.logId} - Risk: ${payload.analysisResult.riskLevel}`);
    
    // Could trigger downstream analytics or reporting
  }, {
    group: 'audit-analysis',
    concurrency: 3
  });

  // console.log('📋 Audit log event handlers registered');
}

// Helper function to create audit log from failed login attempt
export async function createFailedLoginAuditLog(data: {
  ip: string;
  userAgent?: string;
  phone?: string;
  userId?: string;
  reason: string;
}): Promise<void> {
  void AuditLogService.createFromAuth0Log({
    date: new Date().toISOString(),
    type: 'fp', // Failed login (wrong password)
    description: `Login failed: ${data.reason}`,
    ip: data.ip,
    user_agent: data.userAgent,
    user_id: data.userId,
    user_name: data.phone,
    log_id: `failed_login_${Date.now()}_${data.ip}`,
    connection: 'sms',
    client_id: process.env.AUTH0_CLIENT_ID ?? 'unknown'
  });
}

// Helper function to create audit log from failed OTP verification
export async function createFailedOtpAuditLog(data: {
  ip: string;
  userAgent?: string;
  phone: string;
  reason: string;
}): Promise<void> {
  void AuditLogService.createFromAuth0Log({
    date: new Date().toISOString(),
    type: 'fepotpft', // Failed phone OTP verification
    description: `OTP verification failed: ${data.reason}`,
    ip: data.ip,
    user_agent: data.userAgent,
    user_name: data.phone,
    log_id: `failed_otp_${Date.now()}_${data.phone.replace(/\D/g, '')}`,
    connection: 'sms',
    client_id: process.env.AUTH0_CLIENT_ID ?? 'unknown'
  });
}

// Helper function to create audit log from rate limit exceeded
export async function createRateLimitAuditLog(data: {
  ip: string;
  userAgent?: string;
  endpoint: string;
  userId?: string;
}): Promise<void> {
  void AuditLogService.createFromAuth0Log({
    date: new Date().toISOString(),
    type: 'limit_wc', // Rate limit exceeded
    description: `Rate limit exceeded for endpoint: ${data.endpoint}`,
    ip: data.ip,
    user_agent: data.userAgent,
    user_id: data.userId,
    log_id: `rate_limit_${Date.now()}_${data.ip}`,
    client_id: process.env.AUTH0_CLIENT_ID ?? 'unknown'
  });
}