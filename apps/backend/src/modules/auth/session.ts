import { and, eq } from 'drizzle-orm';
import { db } from '../../db/connection';
import { userSessions, users } from '../../db/schema/users';
import type { User } from './types';

export class SessionService {
  async create(userId: string): Promise<string> {
    const sessionToken = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await db.insert(userSessions).values({
      userId,
      sessionToken,
      expiresAt,
    });

    return sessionToken;
  }

  async validate(sessionToken: string): Promise<User | null> {
    const [session] = await db.select()
      .from(userSessions)
      .innerJoin(users, eq(userSessions.userId, users.id))
      .where(and(
        eq(userSessions.sessionToken, sessionToken),
        eq(userSessions.isActive, true)
      ))
      .limit(1);

    if (!session || new Date() > session.user_sessions.expiresAt) {
      return null;
    }

    // Update last used
    await db.update(userSessions)
      .set({ lastUsedAt: new Date() })
      .where(eq(userSessions.sessionToken, sessionToken));

    return {
      id: session.users.id,
      userType: session.users.userType as any,
      phone: session.users.phone,
      email: session.users.email || undefined,
      firstName: session.users.firstName || undefined,
      lastName: session.users.lastName || undefined,
      companyName: session.users.companyName || undefined,
      taxNumber: session.users.taxNumber || undefined,
      isActive: session.users.isActive,
      isPhoneVerified: session.users.isPhoneVerified,
      isEmailVerified: session.users.isEmailVerified,
      auth0UserId: ''
    };
  }

  async revoke(sessionToken: string): Promise<void> {
    await db.update(userSessions)
      .set({ isActive: false })
      .where(eq(userSessions.sessionToken, sessionToken));
  }
}

export const sessionService = new SessionService();
