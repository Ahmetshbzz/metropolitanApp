import { prisma } from '../../db/connection';
import type { AuditLog, AuditLogType } from '../../generated/prisma';
import type { AuditLogFilters } from './types';

export class AuditLogEntity {
  static async create(data: Omit<AuditLog, 'id' | 'createdAt' | 'processedAt'>): Promise<AuditLog> {
    const log = await prisma.auditLog.create({
      data
    });
    return log;
  }

  static async findById(id: string): Promise<AuditLog | null> {
    const log = await prisma.auditLog.findUnique({
      where: { id }
    });
    return log;
  }

  static async findByLogId(logId: string): Promise<AuditLog | null> {
    const log = await prisma.auditLog.findUnique({
      where: { logId }
    });
    return log;
  }

  static async findWithFilters(filters: AuditLogFilters): Promise<{ logs: AuditLog[]; total: number }> {
    const whereCondition: any = {};
    
    if (filters.startDate) {
      whereCondition.date = { ...whereCondition.date, gte: filters.startDate };
    }
    
    if (filters.endDate) {
      whereCondition.date = { ...whereCondition.date, lte: filters.endDate };
    }
    
    if (filters.logTypes?.length) {
      whereCondition.type = { in: filters.logTypes };
    }
    
    if (filters.userId) {
      whereCondition.userId = filters.userId;
    }
    
    if (filters.ip) {
      whereCondition.ip = filters.ip;
    }
    
    if (filters.clientId) {
      whereCondition.clientId = filters.clientId;
    }
    
    if (filters.isSuspicious !== undefined) {
      whereCondition.isSuspicious = filters.isSuspicious.toString();
    }

    // Get total count
    const total = await prisma.auditLog.count({
      where: whereCondition
    });

    // Get paginated results
    const logs = await prisma.auditLog.findMany({
      where: whereCondition,
      orderBy: { date: 'desc' },
      take: filters.limit,
      skip: filters.offset
    });
    
    return { logs, total };
  }

  static async findRecentByUserId(userId: string, limit = 10): Promise<AuditLog[]> {
    return await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit
    });
  }

  static async findRecentByIp(ip: string, limit = 10): Promise<AuditLog[]> {
    return await prisma.auditLog.findMany({
      where: { ip },
      orderBy: { date: 'desc' },
      take: limit
    });
  }

  static async updateRiskScore(id: string, riskScore: number, isSuspicious: boolean): Promise<void> {
    await prisma.auditLog.update({
      where: { id },
      data: { 
        riskScore: riskScore.toString(),
        isSuspicious: isSuspicious.toString(),
        processedAt: new Date()
      }
    });
  }
}