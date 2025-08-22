import { eq, sql } from 'drizzle-orm';
import { db } from '../../db/connection';
import { 
  ipAnalysis, 
  userBehaviorAnalysis,
  type IpAnalysis,
  type NewIpAnalysis,
  type UserBehaviorAnalysis,
  type NewUserBehaviorAnalysis
} from '../../db/schema/audit-logs';
import { RiskLevel } from './types';

export class IpAnalysisEntity {
  static async findByIp(ip: string): Promise<IpAnalysis | undefined> {
    const [analysis] = await db.select().from(ipAnalysis).where(eq(ipAnalysis.ip, ip));
    return analysis;
  }

  static async create(data: NewIpAnalysis): Promise<IpAnalysis> {
    const [analysis] = await db.insert(ipAnalysis).values(data).returning();
    return analysis;
  }

  static async updateOrCreate(ip: string, updateData: Partial<NewIpAnalysis>): Promise<IpAnalysis> {
    const existing = await this.findByIp(ip);
    
    if (existing) {
      const [updated] = await db
        .update(ipAnalysis)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(ipAnalysis.ip, ip))
        .returning();
      return updated;
    } else {
      return await this.create({
        ip,
        firstSeen: new Date(),
        lastSeen: new Date(),
        lastActivity: new Date(),
        ...updateData
      } as NewIpAnalysis);
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

    await db
      .update(ipAnalysis)
      .set({
        totalRequests: sql`${ipAnalysis.totalRequests}::int + 1`,
        failedAttempts: failed ? sql`${ipAnalysis.failedAttempts}::int + 1` : ipAnalysis.failedAttempts,
        successfulLogins: success ? sql`${ipAnalysis.successfulLogins}::int + 1` : ipAnalysis.successfulLogins,
        lastSeen: new Date(),
        lastActivity: new Date(),
        updatedAt: new Date()
      })
      .where(eq(ipAnalysis.ip, ip));
  }

  static async updateRiskLevel(ip: string, riskLevel: RiskLevel): Promise<void> {
    await db
      .update(ipAnalysis)
      .set({ 
        riskLevel,
        updatedAt: new Date() 
      })
      .where(eq(ipAnalysis.ip, ip));
  }

  static async blockIp(ip: string): Promise<void> {
    await db
      .update(ipAnalysis)
      .set({ 
        isBlocked: 'true',
        updatedAt: new Date() 
      })
      .where(eq(ipAnalysis.ip, ip));
  }

  static async findHighRiskIps(limit = 50): Promise<IpAnalysis[]> {
    return await db
      .select()
      .from(ipAnalysis)
      .where(eq(ipAnalysis.riskLevel, 'HIGH'))
      .limit(limit);
  }

  static async getIpSummary(ip: string): Promise<IpAnalysisSummary> {
    const analysis = await db.select().from(ipAnalysis)
      .where(eq(ipAnalysis.ip, ip))
      .limit(1);
    
    if (analysis.length === 0) {
      return {
        ip,
        totalRequests: 0,
        failedAttempts: 0,
        successfulLogins: 0,
        riskLevel: 'LOW',
        isBlocked: false,
        firstSeen: null,
        lastSeen: null
      };
    }

    const record = analysis[0];
    return {
      ip: record.ip,
      totalRequests: parseInt(record.totalRequests ?? '0'),
      failedAttempts: parseInt(record.failedAttempts ?? '0'), 
      successfulLogins: parseInt(record.successfulLogins ?? '0'),
      riskLevel: record.riskLevel ?? 'LOW',
      isBlocked: record.isBlocked === 'true',
      firstSeen: record.firstSeen,
      lastSeen: record.lastSeen
    };
  }
}

export class UserBehaviorEntity {
  static async findByUserId(userId: string): Promise<UserBehaviorAnalysis | undefined> {
    const [analysis] = await db.select().from(userBehaviorAnalysis)
      .where(eq(userBehaviorAnalysis.userId, userId));
    return analysis;
  }

  static async create(data: NewUserBehaviorAnalysis): Promise<UserBehaviorAnalysis> {
    const [analysis] = await db.insert(userBehaviorAnalysis).values(data).returning();
    return analysis;
  }

  static async updateOrCreate(userId: string, updateData: Partial<NewUserBehaviorAnalysis>): Promise<UserBehaviorAnalysis> {
    const existing = await this.findByUserId(userId);
    
    if (existing) {
      const [updated] = await db
        .update(userBehaviorAnalysis)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(userBehaviorAnalysis.userId, userId))
        .returning();
      return updated;
    } else {
      return await this.create({
        userId,
        ...updateData
      } as NewUserBehaviorAnalysis);
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
        firstLogin: failed ? undefined : now,
        lastLogin: failed ? undefined : now
      });
      return;
    }

    const updateData: Partial<NewUserBehaviorAnalysis> = {
      updatedAt: now
    };

    if (failed) {
      updateData.failedLoginAttempts = sql`${userBehaviorAnalysis.failedLoginAttempts}::int + 1`;
    } else {
      updateData.totalLogins = sql`${userBehaviorAnalysis.totalLogins}::int + 1`;
      updateData.lastLogin = now;
      if (!existing.firstLogin) {
        updateData.firstLogin = now;
      }
    }

    await db
      .update(userBehaviorAnalysis)
      .set(updateData)
      .where(eq(userBehaviorAnalysis.userId, userId));
  }

  static async updateRiskScore(userId: string, riskScore: number): Promise<void> {
    await db
      .update(userBehaviorAnalysis)
      .set({ 
        riskScore: riskScore.toString(),
        updatedAt: new Date() 
      })
      .where(eq(userBehaviorAnalysis.userId, userId));
  }
}