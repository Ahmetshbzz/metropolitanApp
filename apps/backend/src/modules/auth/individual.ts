import { eq } from 'drizzle-orm';
import { db } from '../../db/connection';
import { authProviders, users } from '../../db/schema/users';
import { publishPersistent } from '../../event-bus';
import { auth0Service } from '../../services/auth0';
import { otpService } from './otp';
import { sessionService } from './session';
import type { AuthProvider, User } from './types';

export class IndividualAuthService {
  async findByPhone(phone: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    return user || null;
  }

  async registerWithPhone(phone: string, firstName: string, lastName: string, email: string): Promise<{ userId: string; requiresOTP: boolean }> {
    // Validate required fields
    if (!firstName || !lastName || !email) {
      throw new Error('firstName, lastName, and email are required for individual registration');
    }

    // Check existing phone
    const existingPhone = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    if (existingPhone.length > 0) {
      throw new Error('Phone number already registered');
    }

    // Check existing email
    const existingEmail = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingEmail.length > 0) {
      throw new Error('Email already registered');
    }

    // Create local user (Auth0 only used for SMS OTP)
    const [newUser] = await db.insert(users).values({
      userType: 'individual',
      phone,
      email,
      firstName,
      lastName,
      isPhoneVerified: false,
    }).returning();

    // No Auth0 user creation needed - only SMS OTP

    await otpService.send(phone, 'registration');

    await publishPersistent('auth.user.registered', {
      userId: newUser.id,
      userType: 'individual',
      phone,
      provider: 'phone_otp'
    });

    return { userId: newUser.id, requiresOTP: true };
  }

  async registerWithSocial(provider: AuthProvider, socialToken: string, email?: string): Promise<{ user: User; sessionToken: string }> {
    // Exchange social token
    const auth0User = await auth0Service.exchangeSocialToken(provider, socialToken);

    // Create local user
    const [newUser] = await db.insert(users).values({
      userType: 'individual',
      phone: '', // Social login'de phone yok
      email: email || auth0User.email,
      firstName: auth0User.given_name,
      lastName: auth0User.family_name,
      isPhoneVerified: false,
      isEmailVerified: true, // Social login verified
    }).returning();

    await db.insert(authProviders).values({
      userId: newUser.id,
      auth0UserId: auth0User.sub,
      provider,
      providerData: JSON.stringify({ token: socialToken }),
    });

    const sessionToken = await sessionService.create(newUser.id);

    await publishPersistent('auth.user.registered', {
      userId: newUser.id,
      userType: 'individual',
      phone: '',
      provider
    });

    return {
      user: {
        ...newUser,
        auth0UserId: auth0User.sub,
        userType: newUser.userType as any,
        email: newUser.email || undefined,
        firstName: newUser.firstName || undefined,
        lastName: newUser.lastName || undefined,
        companyName: newUser.companyName || undefined,
        taxNumber: newUser.taxNumber || undefined,
      },
      sessionToken
    };
  }

  async loginWithPhone(phone: string, otp: string): Promise<{ user: User; sessionToken: string }> {
    // Use Auth0 OTP verification instead of local OTP
    await auth0Service.verifyPhoneOTP(phone, otp);

    const [user] = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    if (!user || user.userType !== 'individual') {
      throw new Error('Individual user not found');
    }

    await db.update(users)
      .set({ lastLoginAt: new Date(), isPhoneVerified: true })
      .where(eq(users.id, user.id));

    const sessionToken = await sessionService.create(user.id);

    await publishPersistent('auth.user.login', {
      userId: user.id,
      sessionId: sessionToken,
      userType: 'individual',
      loginMethod: 'phone_otp'
    });

    return {
      user: {
        ...user,
        auth0UserId: '',
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

export const individualAuth = new IndividualAuthService();
