import { prisma } from '../../db/connection';
import type { User, UserType } from './types';

export class SessionService {
  async create(userId: string): Promise<string> {
    const sessionToken = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await prisma.userSession.create({
      data: {
        userId,
        sessionToken,
        expiresAt,
      }
    });

    return sessionToken;
  }

  async validate(sessionToken: string): Promise<User | null> {
    const session = await prisma.userSession.findFirst({
      where: {
        sessionToken,
        isActive: true
      },
      include: {
        user: true
      }
    });

    if (!session || new Date() > session.expiresAt) {
      return null;
    }

    // Update last used
    await prisma.userSession.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date() }
    });

    return {
      id: session.user.id,
      userType: session.user.userType as UserType,
      phone: session.user.phone,
      email: session.user.email ?? undefined,
      firstName: session.user.firstName ?? undefined,
      lastName: session.user.lastName ?? undefined,
      companyName: session.user.companyName ?? undefined,
      taxNumber: session.user.taxNumber ?? undefined,
      isActive: session.user.isActive,
      isPhoneVerified: session.user.isPhoneVerified,
      isEmailVerified: session.user.isEmailVerified,
      auth0UserId: ''
    };
  }

  async revoke(sessionToken: string): Promise<void> {
    await prisma.userSession.updateMany({
      where: { sessionToken },
      data: { isActive: false }
    });
  }
}

export const sessionService = new SessionService();
