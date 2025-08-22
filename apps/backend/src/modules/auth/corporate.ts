import { eq } from 'drizzle-orm';
import { db } from '../../db/connection';
import { authProviders, users } from '../../db/schema/users';
import { publishPersistent } from '../../event-bus';
import { auth0Service } from '../../services/auth0';
import { otpService } from './otp';
import { sessionService } from './session';
import type { RegisterCorporateRequest, User } from './types';

export class CorporateAuthService {
  async findByPhone(phone: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    return user || null;
  }

  async register(data: RegisterCorporateRequest): Promise<{ userId: string; requiresOTP: boolean }> {
    // Check existing user
    const existing = await db.select().from(users).where(eq(users.phone, data.phone)).limit(1);
    if (existing.length > 0) {
      throw new Error('Phone number already registered');
    }

    // Create Auth0 user
    const auth0User = await auth0Service.createCorporateUser(data.phone, data.companyName, data.taxNumber);

    // Create local user
    const [newUser] = await db.insert(users).values({
      userType: 'corporate',
      phone: data.phone,
      companyName: data.companyName,
      taxNumber: data.taxNumber,
      isPhoneVerified: false,
    }).returning();

    // Link Auth0
    await db.insert(authProviders).values({
      userId: newUser.id,
      auth0UserId: auth0User.user_id!,
      provider: 'phone_otp',
    });

    // Send OTP
    await otpService.send(data.phone, 'registration');

    // Event
    await publishPersistent('auth.user.registered', {
      userId: newUser.id,
      userType: 'corporate',
      phone: data.phone,
      provider: 'phone_otp'
    });

    return { userId: newUser.id, requiresOTP: true };
  }

  async login(phone: string, otp: string): Promise<{ user: User; sessionToken: string }> {
    // Use Auth0 OTP verification instead of local OTP
    await auth0Service.verifyPhoneOTP(phone, otp);

    const [user] = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    if (!user || user.userType !== 'corporate') {
      throw new Error('Corporate user not found');
    }

    // Update login time
    await db.update(users)
      .set({ lastLoginAt: new Date(), isPhoneVerified: true })
      .where(eq(users.id, user.id));

    const sessionToken = await sessionService.create(user.id);

    await publishPersistent('auth.user.login', {
      userId: user.id,
      sessionId: sessionToken,
      userType: 'corporate',
      loginMethod: 'phone_otp'
    });

    return {
      user: {
        ...user,
        auth0UserId: '', // Will be fetched separately if needed
        userType: user.userType as any,
        email: user.email || undefined,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        companyName: user.companyName || undefined,
        taxNumber: user.taxNumber || undefined,
      },
      sessionToken
    };
  }
}

export const corporateAuth = new CorporateAuthService();
