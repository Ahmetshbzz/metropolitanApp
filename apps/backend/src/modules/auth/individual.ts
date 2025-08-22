import { prisma } from '../../db/connection';
import { publishPersistent } from '../../event-bus';
import { auth0Service } from '../../services/auth0';
import { otpService } from './otp';
import { sessionService } from './session';
import type { AuthProvider, User, UserType } from './types';

export class IndividualAuthService {
  async findByPhone(phone: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: {
        phone,
        userType: 'individual'
      }
    });
    return user as User | null;
  }

  async registerWithPhone(phone: string, firstName: string, lastName: string, email: string): Promise<{ userId: string; requiresOTP: boolean }> {
    // Validate required fields
    if (!firstName || !lastName || !email) {
      throw new Error('firstName, lastName, and email are required for individual registration');
    }

    // Check existing phone for INDIVIDUAL users only
    const existingIndividualPhone = await prisma.user.findFirst({
      where: {
        phone,
        userType: 'individual'
      }
    });
    if (existingIndividualPhone) {
      throw new Error('Individual phone number already registered');
    }

    // Check existing email
    const existingEmail = await prisma.user.findFirst({
      where: {
        email
      }
    });
    if (existingEmail) {
      throw new Error('Email already registered');
    }

    // Create local user (Auth0 only used for SMS OTP)
    const newUser = await prisma.user.create({
      data: {
        userType: 'individual',
        phone,
        email,
        firstName,
        lastName,
        isPhoneVerified: false,
      }
    });

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
    const newUser = await prisma.user.create({
      data: {
        userType: 'individual',
        phone: '', // Social login'de phone yok
        email: email ?? auth0User.email,
        firstName: auth0User.given_name,
        lastName: auth0User.family_name,
        isPhoneVerified: false,
        isEmailVerified: true, // Social login verified
      }
    });

    await prisma.authProviderRecord.create({
      data: {
        userId: newUser.id,
        auth0UserId: auth0User.sub,
        provider,
        providerData: JSON.stringify({ token: socialToken }),
      }
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
        userType: newUser.userType as UserType,
        email: newUser.email ?? undefined,
        firstName: newUser.firstName ?? undefined,
        lastName: newUser.lastName ?? undefined,
        companyName: newUser.companyName ?? undefined,
        taxNumber: newUser.taxNumber ?? undefined,
      },
      sessionToken
    };
  }

  async loginWithPhone(phone: string, otp: string): Promise<{ user: User; sessionToken: string }> {
    // First check if individual user exists locally
    const user = await prisma.user.findFirst({
      where: {
        phone,
        userType: 'individual'
      }
    });
    
    if (!user) {
      throw new Error('Individual user not found - please register first');
    }

    // Only then verify OTP with Auth0
    await auth0Service.verifyPhoneOTP(phone, otp);

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), isPhoneVerified: true }
    });

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
        userType: user.userType as UserType,
        email: user.email ?? undefined,
        firstName: user.firstName ?? undefined,
        lastName: user.lastName ?? undefined,
        companyName: user.companyName ?? undefined,
        taxNumber: user.taxNumber ?? undefined,
      },
      sessionToken
    };
  }
}

export const individualAuth = new IndividualAuthService();
