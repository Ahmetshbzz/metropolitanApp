import { registerAuditLogEventHandlers } from './events';

// Export services for external use
export { AuditLogService, AuditAnalyticsService } from './services';

// Export entities for database operations
export { AuditLogEntity } from './entities';
export { IpAnalysisEntity, UserBehaviorEntity } from './entities-analysis';

// Export types for external use
export type {
  Auth0LogData,
  LogAnalysisResult,
  RiskLevel,
  IpAnalysisSummary,
  UserBehaviorSummary,
  AuditLogFilters,
  CreateAuditLogResponse,
  GetAuditLogsResponse,
  AuditEventPayloads
} from './types';

// Export helper functions for creating audit logs
export {
  createFailedLoginAuditLog,
  createFailedOtpAuditLog,
  createRateLimitAuditLog
} from './events';

// Module initialization function
export function initAuditLogsModule(): void {
  registerAuditLogEventHandlers();
  // console.log('📋 Audit Logs module initialized');
}

// Export database schema for migrations
export * from '../../db/schema/audit-logs';