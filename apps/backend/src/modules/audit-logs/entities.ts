import { eq, desc, and, gte, lte, inArray, sql } from 'drizzle-orm';
import { db } from '../../db/connection';
import { 
  auditLogs, 
  type AuditLog,
  type NewAuditLog
} from '../../db/schema/audit-logs';
import type { AuditLogFilters } from './types';

export class AuditLogEntity {
  static async create(data: NewAuditLog): Promise<AuditLog> {
    const [log] = await db.insert(auditLogs).values(data).returning();
    return log;
  }

  static async findById(id: string): Promise<AuditLog | undefined> {
    const [log] = await db.select().from(auditLogs).where(eq(auditLogs.id, id));
    return log;
  }

  static async findByLogId(logId: string): Promise<AuditLog | undefined> {
    const [log] = await db.select().from(auditLogs).where(eq(auditLogs.logId, logId));
    return log;
  }

  static async findWithFilters(filters: AuditLogFilters): Promise<{ logs: AuditLog[]; total: number }> {
    const conditions = [];
    
    if (filters.startDate) {
      conditions.push(gte(auditLogs.date, filters.startDate));
    }
    
    if (filters.endDate) {
      conditions.push(lte(auditLogs.date, filters.endDate));
    }
    
    if (filters.logTypes?.length) {
      conditions.push(inArray(auditLogs.type, filters.logTypes));
    }
    
    if (filters.userId) {
      conditions.push(eq(auditLogs.userId, filters.userId));
    }
    
    if (filters.ip) {
      conditions.push(eq(auditLogs.ip, filters.ip));
    }
    
    if (filters.clientId) {
      conditions.push(eq(auditLogs.clientId, filters.clientId));
    }
    
    if (filters.isSuspicious !== undefined) {
      conditions.push(eq(auditLogs.isSuspicious, filters.isSuspicious.toString()));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(auditLogs)
      .where(whereClause);

    // Get paginated results
    let query = db.select().from(auditLogs).where(whereClause).orderBy(desc(auditLogs.date));
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    const logs = await query;
    
    return { logs, total: count };
  }

  static async findRecentByUserId(userId: string, limit = 10): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy(desc(auditLogs.date))
      .limit(limit);
  }

  static async findRecentByIp(ip: string, limit = 10): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.ip, ip))
      .orderBy(desc(auditLogs.date))
      .limit(limit);
  }

  static async updateRiskScore(id: string, riskScore: number, isSuspicious: boolean): Promise<void> {
    await db
      .update(auditLogs)
      .set({ 
        riskScore: riskScore.toString(),
        isSuspicious: isSuspicious.toString(),
        processedAt: new Date()
      })
      .where(eq(auditLogs.id, id));
  }
}