import { prisma } from '../../db/connection';
import type { IpAnalysis, UserBehaviorAnalysis } from '../../generated/prisma';
import { RiskLevel, type IpAnalysisSummary } from './types';

export class IpAnalysisEntity {
  static async findByIp(ip: string): Promise<IpAnalysis | null> {
    const analysis = await prisma.ipAnalysis.findUnique({
      where: { ip }
    });
    return analysis;
  }

  static async create(data: Omit<IpAnalysis, 'id' | 'createdAt' | 'updatedAt'>): Promise<IpAnalysis> {
    const analysis = await prisma.ipAnalysis.create({
      data
    });
    return analysis;
  }

  static async updateOrCreate(ip: string, updateData: Partial<Omit<IpAnalysis, 'id' | 'ip' | 'createdAt' | 'updatedAt'>>): Promise<IpAnalysis> {
    const existing = await this.findByIp(ip);
    
    if (existing) {
      const updated = await prisma.ipAnalysis.update({
        where: { ip },
        data: { ...updateData, updatedAt: new Date() }
      });
      return updated;
    } else {
      return await this.create({
        ip,
        firstSeen: new Date(),
        lastSeen: new Date(),
        lastActivity: new Date(),
        ...updateData
      } as Omit<IpAnalysis, 'id' | 'createdAt' | 'updatedAt'>);
    }
  }

  static async incrementCounters(ip: string, failed = false, success = false): Promise<void> {
    const existing = await this.findByIp(ip);
    
    if (!existing) {
      await this.create({
        ip,
        totalRequests: '1',
        failedAttempts: failed ? '1' : '0',
        successfulLogins: success ? '1' : '0',
        firstSeen: new Date(),
        lastSeen: new Date(),
        lastActivity: new Date()
      });
      return;
    }

    // Use raw query for atomic incrementing
    await prisma.$executeRaw`
      UPDATE ip_analysis 
      SET 
        total_requests = (total_requests::int + 1)::text,
        failed_attempts = CASE WHEN ${failed} THEN (failed_attempts::int + 1)::text ELSE failed_attempts END,
        successful_logins = CASE WHEN ${success} THEN (successful_logins::int + 1)::text ELSE successful_logins END,
        last_seen = ${new Date()},
        last_activity = ${new Date()},
        updated_at = ${new Date()}
      WHERE ip = ${ip}
    `;
  }

  static async updateRiskLevel(ip: string, riskLevel: RiskLevel): Promise<void> {
    await prisma.ipAnalysis.update({
      where: { ip },
      data: { 
        riskLevel,
        updatedAt: new Date() 
      }
    });
  }

  static async blockIp(ip: string): Promise<void> {
    await prisma.ipAnalysis.update({
      where: { ip },
      data: { 
        isBlocked: 'true',
        updatedAt: new Date() 
      }
    });
  }

  static async findHighRiskIps(limit = 50): Promise<IpAnalysis[]> {
    return await prisma.ipAnalysis.findMany({
      where: { riskLevel: 'high' },
      take: limit
    });
  }

  static async getIpSummary(ip: string): Promise<IpAnalysisSummary> {
    const analysis = await prisma.ipAnalysis.findUnique({
      where: { ip }
    });
    
    if (!analysis) {
      return {
        ip,
        totalRequests: 0,
        failedAttempts: 0,
        successfulLogins: 0,
        riskLevel: 'low',
        isBlocked: false,
        firstSeen: null,
        lastSeen: null
      };
    }

    return {
      ip: analysis.ip,
      totalRequests: parseInt(analysis.totalRequests ?? '0'),
      failedAttempts: parseInt(analysis.failedAttempts ?? '0'), 
      successfulLogins: parseInt(analysis.successfulLogins ?? '0'),
      riskLevel: analysis.riskLevel ?? 'low',
      isBlocked: analysis.isBlocked === 'true',
      firstSeen: analysis.firstSeen,
      lastSeen: analysis.lastSeen
    };
  }
}

export class UserBehaviorEntity {
  static async findByUserId(userId: string): Promise<UserBehaviorAnalysis | null> {
    const analysis = await prisma.userBehaviorAnalysis.findUnique({
      where: { userId }
    });
    return analysis;
  }

  static async create(data: Omit<UserBehaviorAnalysis, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserBehaviorAnalysis> {
    const analysis = await prisma.userBehaviorAnalysis.create({
      data
    });
    return analysis;
  }

  static async updateOrCreate(userId: string, updateData: Partial<Omit<UserBehaviorAnalysis, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<UserBehaviorAnalysis> {
    const existing = await this.findByUserId(userId);
    
    if (existing) {
      const updated = await prisma.userBehaviorAnalysis.update({
        where: { userId },
        data: { ...updateData, updatedAt: new Date() }
      });
      return updated;
    } else {
      return await this.create({
        userId,
        ...updateData
      } as Omit<UserBehaviorAnalysis, 'id' | 'createdAt' | 'updatedAt'>);
    }
  }

  static async incrementLogin(userId: string, failed = false): Promise<void> {
    const existing = await this.findByUserId(userId);
    const now = new Date();
    
    if (!existing) {
      await this.create({
        userId,
        totalLogins: failed ? '0' : '1',
        failedLoginAttempts: failed ? '1' : '0',
        firstLogin: failed ? null : now,
        lastLogin: failed ? null : now
      });
      return;
    }

    // Use raw query for atomic incrementing
    if (failed) {
      await prisma.$executeRaw`
        UPDATE user_behavior_analysis 
        SET 
          failed_login_attempts = (failed_login_attempts::int + 1)::text,
          updated_at = ${now}
        WHERE user_id = ${userId}
      `;
    } else {
      await prisma.$executeRaw`
        UPDATE user_behavior_analysis 
        SET 
          total_logins = (total_logins::int + 1)::text,
          last_login = ${now},
          first_login = COALESCE(first_login, ${now}),
          updated_at = ${now}
        WHERE user_id = ${userId}
      `;
    }
  }

  static async updateRiskScore(userId: string, riskScore: number): Promise<void> {
    await prisma.userBehaviorAnalysis.update({
      where: { userId },
      data: { 
        riskScore: riskScore.toString(),
        updatedAt: new Date() 
      }
    });
  }
}