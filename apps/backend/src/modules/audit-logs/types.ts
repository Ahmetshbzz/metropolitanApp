// Auth0 log data structure (based on actual Auth0 logs)
export interface Auth0LogData {
  date: string;
  type: string;
  description: string;
  connection?: string;
  connection_id?: string;
  client_id?: string;
  client_name?: string;
  ip: string;
  client_ip?: string;
  user_agent?: string;
  security_context?: {
    ja3?: string;
    ja4?: string;
  };
  hostname?: string;
  user_id?: string;
  user_name?: string;
  audience?: string;
  scope?: string;
  location_info?: {
    country_code?: string;
    country_name?: string;
    city_name?: string;
    latitude?: number;
    longitude?: number;
  };
  log_id: string;
}

// Risk levels for IP and user analysis
export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Log analysis result
export interface LogAnalysisResult {
  riskScore: number;
  riskLevel: RiskLevel;
  isSuspicious: boolean;
  flags: string[];
  recommendations: string[];
}

// IP analysis summary
export interface IpAnalysisSummary {
  ip: string;
  totalRequests: number;
  failedAttempts: number;
  successfulLogins: number;
  riskLevel: RiskLevel;
  isBlocked: boolean;
  locations: string[];
  timeRange: {
    firstSeen: Date;
    lastSeen: Date;
  };
}

// User behavior summary
export interface UserBehaviorSummary {
  userId: string;
  totalLogins: number;
  failedAttempts: number;
  uniqueDevices: number;
  uniqueIps: number;
  riskScore: number;
  suspiciousActivities: number;
  loginPatterns: {
    firstLogin?: Date;
    lastLogin?: Date;
    avgSessionDuration: number;
  };
}

// Query filters for audit logs
export interface AuditLogFilters {
  startDate?: Date;
  endDate?: Date;
  logTypes?: string[];
  userId?: string;
  ip?: string;
  clientId?: string;
  riskLevel?: RiskLevel;
  isSuspicious?: boolean;
  limit?: number;
  offset?: number;
}

// Event payloads for audit logs module
export interface AuditEventPayloads {
  'audit.log.created': {
    logId: string;
    type: string;
    userId?: string;
    ip: string;
    riskScore: number;
  };
  'audit.log.analysis.completed': {
    logId: string;
    analysisResult: LogAnalysisResult;
  };
  'audit.ip.risk.elevated': {
    ip: string;
    previousLevel: RiskLevel;
    currentLevel: RiskLevel;
    triggerEvent: string;
  };
  'audit.user.suspicious.activity': {
    userId: string;
    activityType: string;
    riskScore: number;
    details: string;
  };
}

// Service response types
export interface CreateAuditLogResponse {
  success: boolean;
  logId: string;
  analysisResult?: LogAnalysisResult;
}

export interface GetAuditLogsResponse {
  logs: Array<{
    id: string;
    logId: string;
    date: Date;
    type: string;
    description: string;
    ip: string;
    userId?: string;
    riskScore: number;
    isSuspicious: boolean;
  }>;
  total: number;
  hasMore: boolean;
}