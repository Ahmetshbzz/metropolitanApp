import { 
  pgTable, 
  uuid, 
  timestamp, 
  varchar, 
  text, 
  json, 
  index, 
  pgEnum 
} from 'drizzle-orm/pg-core';

// Auth0 log types enum (based on Auth0 documentation)
export const auditLogTypeEnum = pgEnum('audit_log_type', [
  // Authentication events
  's', 'slo', 'f', 'fp', 'fc', 'fce', 'fco', 'fcp', 'fcpn', 'fcpr', 'fcpro',
  // OTP events  
  'fepotpft', 'seacft', 'sepft', 'scp', 'scpn', 'pwd_leak',
  // API events
  'api_limit', 'limit_wc', 'limit_ui', 'limit_mu',
  // Admin events
  'w', 'du', 'fu', 'pla', 'cls', 'cs', 'sce', 'ss', 'fs', 'fsa', 'admin_update_launch',
  // Management API
  'sapi', 'fapi', 'mgmt_api_read', 'mgmt_api_write'
]);

// Security context structure
interface SecurityContext {
  ja3?: string;
  ja4?: string;
}

// Location info structure
interface LocationInfo {
  country_code?: string;
  country_name?: string;
  city_name?: string;
  latitude?: number;
  longitude?: number;
}

// Main audit logs table
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Auth0 log data
  logId: varchar('log_id', { length: 100 }).unique().notNull(),
  date: timestamp('date').notNull(),
  type: auditLogTypeEnum('type').notNull(),
  description: text('description').notNull(),
  
  // Connection info
  connection: varchar('connection', { length: 100 }),
  connectionId: varchar('connection_id', { length: 100 }),
  
  // Client info
  clientId: varchar('client_id', { length: 100 }),
  clientName: varchar('client_name', { length: 255 }),
  
  // Network info
  ip: varchar('ip', { length: 45 }).notNull(), // IPv6 support
  clientIp: varchar('client_ip', { length: 45 }),
  userAgent: text('user_agent'),
  hostname: varchar('hostname', { length: 255 }),
  
  // Security context (JA3/JA4 fingerprints)
  securityContext: json('security_context').$type<SecurityContext>(),
  
  // User info
  userId: varchar('user_id', { length: 100 }),
  userName: varchar('user_name', { length: 255 }),
  
  // OAuth/API info
  audience: varchar('audience', { length: 255 }),
  scope: text('scope'),
  
  // Location data
  locationInfo: json('location_info').$type<LocationInfo>(),
  
  // Analysis flags
  isSuspicious: varchar('is_suspicious', { length: 10 }).default('false'),
  riskScore: varchar('risk_score', { length: 10 }).default('0'),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  processedAt: timestamp('processed_at')
}, (table) => ({
  // Performance indexes
  dateIdx: index('audit_logs_date_idx').on(table.date),
  typeIdx: index('audit_logs_type_idx').on(table.type),
  ipIdx: index('audit_logs_ip_idx').on(table.ip),
  userIdIdx: index('audit_logs_user_id_idx').on(table.userId),
  clientIdIdx: index('audit_logs_client_id_idx').on(table.clientId),
  logIdIdx: index('audit_logs_log_id_idx').on(table.logId),
  
  // Composite indexes for queries
  dateTypeIdx: index('audit_logs_date_type_idx').on(table.date, table.type),
  userDateIdx: index('audit_logs_user_date_idx').on(table.userId, table.date),
  ipDateIdx: index('audit_logs_ip_date_idx').on(table.ip, table.date)
}));

// IP analysis summary table for tracking suspicious patterns
export const ipAnalysis = pgTable('ip_analysis', {
  id: uuid('id').defaultRandom().primaryKey(),
  ip: varchar('ip', { length: 45 }).unique().notNull(),
  
  // Counters
  totalRequests: varchar('total_requests', { length: 20 }).default('0'),
  failedAttempts: varchar('failed_attempts', { length: 20 }).default('0'),
  successfulLogins: varchar('successful_logins', { length: 20 }).default('0'),
  
  // Risk assessment
  riskLevel: varchar('risk_level', { length: 20 }).default('low'), // low, medium, high, critical
  isBlocked: varchar('is_blocked', { length: 10 }).default('false'),
  
  // Time tracking
  firstSeen: timestamp('first_seen').notNull(),
  lastSeen: timestamp('last_seen').notNull(),
  lastActivity: timestamp('last_activity').notNull(),
  
  // Location data (from last seen)
  lastCountry: varchar('last_country', { length: 100 }),
  lastCity: varchar('last_city', { length: 100 }),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  ipIdx: index('ip_analysis_ip_idx').on(table.ip),
  riskLevelIdx: index('ip_analysis_risk_level_idx').on(table.riskLevel),
  lastSeenIdx: index('ip_analysis_last_seen_idx').on(table.lastSeen)
}));

// User behavior analysis table
export const userBehaviorAnalysis = pgTable('user_behavior_analysis', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 100 }).unique().notNull(),
  
  // Login patterns
  totalLogins: varchar('total_logins', { length: 20 }).default('0'),
  failedLoginAttempts: varchar('failed_login_attempts', { length: 20 }).default('0'),
  
  // Device patterns
  uniqueDevices: varchar('unique_devices', { length: 10 }).default('0'),
  uniqueIps: varchar('unique_ips', { length: 10 }).default('0'),
  
  // Time patterns
  firstLogin: timestamp('first_login'),
  lastLogin: timestamp('last_login'),
  avgSessionDuration: varchar('avg_session_duration', { length: 20 }).default('0'),
  
  // Risk indicators
  suspiciousActivityCount: varchar('suspicious_activity_count', { length: 10 }).default('0'),
  riskScore: varchar('risk_score', { length: 10 }).default('0'),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  userIdIdx: index('user_behavior_user_id_idx').on(table.userId),
  lastLoginIdx: index('user_behavior_last_login_idx').on(table.lastLogin),
  riskScoreIdx: index('user_behavior_risk_score_idx').on(table.riskScore)
}));

// Type exports
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
export type IpAnalysis = typeof ipAnalysis.$inferSelect;
export type NewIpAnalysis = typeof ipAnalysis.$inferInsert;
export type UserBehaviorAnalysis = typeof userBehaviorAnalysis.$inferSelect;
export type NewUserBehaviorAnalysis = typeof userBehaviorAnalysis.$inferInsert;