import { AuditLogEntity } from './entities';
import { IpAnalysisEntity, UserBehaviorEntity } from './entities-analysis';
import { eventBus } from '../../event-bus';
import type { 
  Auth0LogData, 
  LogAnalysisResult, 
  RiskLevel, 
  CreateAuditLogResponse,
  GetAuditLogsResponse,
  AuditLogFilters,
  IpAnalysisSummary,
  UserBehaviorSummary
} from './types';

export class AuditLogService {
  static async createFromAuth0Log(logData: Auth0LogData): Promise<CreateAuditLogResponse> {
    try {
      // Transform Auth0 log to our schema
      const auditLogData = {
        logId: logData.log_id,
        date: new Date(logData.date),
        type: logData.type,
        description: logData.description,
        connection: logData.connection,
        connectionId: logData.connection_id,
        clientId: logData.client_id,
        clientName: logData.client_name,
        ip: logData.ip,
        clientIp: logData.client_ip,
        userAgent: logData.user_agent,
        hostname: logData.hostname,
        securityContext: logData.security_context,
        userId: logData.user_id,
        userName: logData.user_name,
        audience: logData.audience,
        scope: logData.scope,
        locationInfo: logData.location_info
      };

      // Create audit log
      const auditLog = await AuditLogEntity.create(auditLogData);
      
      // Analyze risk
      const analysisResult = await this.analyzeLogRisk(logData);
      
      // Update audit log with risk score
      await AuditLogEntity.updateRiskScore(auditLog.id, analysisResult.riskScore, analysisResult.isSuspicious);
      
      // Update IP and user behavior analytics
      void this.updateAnalytics(logData, analysisResult);
      
      // Publish audit event
      void eventBus.publish('audit.log.created', {
        logId: auditLog.logId,
        type: logData.type,
        userId: logData.user_id,
        ip: logData.ip,
        riskScore: analysisResult.riskScore
      });

      return {
        success: true,
        logId: auditLog.logId,
        analysisResult
      };
    } catch (error) {
      console.error('Failed to create audit log:', error);
      return {
        success: false,
        logId: logData.log_id
      };
    }
  }

  static async getLogs(filters: AuditLogFilters): Promise<GetAuditLogsResponse> {
    const { logs, total } = await AuditLogEntity.findWithFilters(filters);
    const limit = filters.limit ?? 50;
    const offset = filters.offset ?? 0;

    return {
      logs: logs.map(log => ({
        id: log.id,
        logId: log.logId,
        date: log.date,
        type: log.type,
        description: log.description,
        ip: log.ip,
        userId: log.userId ?? undefined,
        riskScore: parseInt(log.riskScore ?? '0'),
        isSuspicious: log.isSuspicious === 'true'
      })),
      total,
      hasMore: offset + limit < total
    };
  }

  static async getUserLogs(userId: string, limit = 50): Promise<GetAuditLogsResponse> {
    return this.getLogs({ userId, limit });
  }

  static async getIpLogs(ip: string, limit = 50): Promise<GetAuditLogsResponse> {
    return this.getLogs({ ip, limit });
  }

  static async getIpStatistics(ip: string): Promise<IpAnalysisSummary> {
    return IpAnalysisEntity.getIpSummary(ip);
  }

  private static async analyzeLogRisk(logData: Auth0LogData): Promise<LogAnalysisResult> {
    let riskScore = 0;
    const flags: string[] = [];
    const recommendations: string[] = [];

    // Analyze log type for risk
    if (logData.type.startsWith('f')) { // Failed events
      riskScore += 30;
      flags.push('failed_authentication');
    }

    // Check for suspicious patterns
    if (logData.type === 'fepotpft') { // Wrong phone or OTP
      riskScore += 20;
      flags.push('invalid_otp');
    }

    // IP-based risk analysis
    const ipHistory = await AuditLogEntity.findRecentByIp(logData.ip, 10);
    const recentFailures = ipHistory.filter(log => log.type.startsWith('f')).length;
    
    if (recentFailures >= 3) {
      riskScore += 40;
      flags.push('multiple_failures_from_ip');
      recommendations.push('Consider IP rate limiting');
    }

    // User-based risk analysis (if user_id exists)
    if (logData.user_id) {
      const userHistory = await AuditLogEntity.findRecentByUserId(logData.user_id, 10);
      const userRecentFailures = userHistory.filter(log => log.type.startsWith('f')).length;
      
      if (userRecentFailures >= 5) {
        riskScore += 35;
        flags.push('multiple_user_failures');
        recommendations.push('User account may be compromised');
      }
    }

    // Determine risk level and suspicious flag
    let riskLevel: string;
    if (riskScore >= 80) {
      riskLevel = 'CRITICAL';
    } else if (riskScore >= 60) {
      riskLevel = 'HIGH';
    } else if (riskScore >= 30) {
      riskLevel = 'MEDIUM';
    } else {
      riskLevel = 'LOW';
    }

    const isSuspicious = riskScore >= 50;

    return {
      riskScore,
      riskLevel,
      isSuspicious,
      flags,
      recommendations
    };
  }

  private static async updateAnalytics(logData: Auth0LogData, analysis: LogAnalysisResult): Promise<void> {
    try {
      // Update IP analysis
      const isFailure = logData.type.startsWith('f');
      const isSuccess = logData.type === 's' || logData.type === 'scp';
      
      await IpAnalysisEntity.incrementCounters(logData.ip, isFailure, isSuccess);
      
      // Update IP risk level if elevated
      const ipAnalysis = await IpAnalysisEntity.findByIp(logData.ip);
      if (ipAnalysis && analysis.riskLevel !== ipAnalysis.riskLevel) {
        await IpAnalysisEntity.updateRiskLevel(logData.ip, analysis.riskLevel);
        
        void eventBus.publish('audit.ip.risk.elevated', {
          ip: logData.ip,
          previousLevel: ipAnalysis.riskLevel as RiskLevel,
          currentLevel: analysis.riskLevel,
          triggerEvent: logData.type
        });
      }

      // Update user behavior analysis
      if (logData.user_id) {
        await UserBehaviorEntity.incrementLogin(logData.user_id, isFailure);
        
        if (analysis.isSuspicious) {
          void eventBus.publish('audit.user.suspicious.activity', {
            userId: logData.user_id,
            activityType: logData.type,
            riskScore: analysis.riskScore,
            details: logData.description
          });
        }
      }
      
      // Publish analysis completion event
      void eventBus.publish('audit.log.analysis.completed', {
        logId: logData.log_id,
        analysisResult: analysis
      });
      
    } catch (error) {
      console.error('Failed to update analytics:', error);
    }
  }
}

export class AuditAnalyticsService {
  static async getIpAnalysis(ip: string): Promise<IpAnalysisSummary | null> {
    const analysis = await IpAnalysisEntity.findByIp(ip);
    if (!analysis) return null;

    return {
      ip: analysis.ip,
      totalRequests: parseInt(analysis.totalRequests ?? '0'),
      failedAttempts: parseInt(analysis.failedAttempts ?? '0'),
      successfulLogins: parseInt(analysis.successfulLogins ?? '0'),
      riskLevel: analysis.riskLevel as RiskLevel,
      isBlocked: analysis.isBlocked === 'true',
      locations: [analysis.lastCountry, analysis.lastCity].filter(Boolean) as string[],
      timeRange: {
        firstSeen: analysis.firstSeen,
        lastSeen: analysis.lastSeen
      }
    };
  }

  static async getUserBehavior(userId: string): Promise<UserBehaviorSummary | null> {
    const behavior = await UserBehaviorEntity.findByUserId(userId);
    if (!behavior) return null;

    return {
      userId: behavior.userId,
      totalLogins: parseInt(behavior.totalLogins ?? '0'),
      failedAttempts: parseInt(behavior.failedLoginAttempts ?? '0'),
      uniqueDevices: parseInt(behavior.uniqueDevices ?? '0'),
      uniqueIps: parseInt(behavior.uniqueIps ?? '0'),
      riskScore: parseInt(behavior.riskScore ?? '0'),
      suspiciousActivities: parseInt(behavior.suspiciousActivityCount ?? '0'),
      loginPatterns: {
        firstLogin: behavior.firstLogin ?? undefined,
        lastLogin: behavior.lastLogin ?? undefined,
        avgSessionDuration: parseInt(behavior.avgSessionDuration ?? '0')
      }
    };
  }

  static async getHighRiskIps(limit = 50): Promise<IpAnalysisSummary[]> {
    const ips = await IpAnalysisEntity.findHighRiskIps(limit);
    return Promise.all(ips.map(async ip => await this.getIpAnalysis(ip.ip))).then(results => 
      results.filter(Boolean) as IpAnalysisSummary[]
    );
  }
}