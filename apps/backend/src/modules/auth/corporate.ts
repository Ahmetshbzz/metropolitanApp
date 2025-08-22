import { eq } from 'drizzle-orm';
import { db } from '../../db/connection';
import { users } from '../../db/schema/users';
import { publishPersistent } from '../../event-bus';
import { auth0Service } from '../../services/auth0';
import { gusService } from '../../services/gus';
import { otpService } from './otp';
import { sessionService } from './session';
import type { RegisterCorporateRequest, User } from './types';

export class CorporateAuthService {
  async findByPhone(phone: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    return user || null;
  }

  async register(data: RegisterCorporateRequest): Promise<{ userId: string; requiresOTP: boolean }> {
    // Validate required fields
    if (!data.nip || !data.firstName || !data.lastName || !data.email) {
      throw new Error('nip, firstName, lastName, and email are required for corporate registration');
    }

    // Check existing phone
    const existingPhone = await db.select().from(users).where(eq(users.phone, data.phone)).limit(1);
    if (existingPhone.length > 0) {
      throw new Error('Phone number already registered');
    }

    // Check existing email
    const existingEmail = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
    if (existingEmail.length > 0) {
      throw new Error('Email already registered');
    }

    // Validate NIP with GUS API
    console.log(`🏢 Validating NIP: ${data.nip} with GUS API...`);
    const gusValidation = await gusService.validateNIP(data.nip);

    if (!gusValidation.isValid) {
      throw new Error(gusValidation.error || 'Invalid NIP number');
    }

    if (!gusValidation.isActive) {
      throw new Error('Company is not active in GUS registry');
    }

    console.log(`✅ NIP validated: ${gusValidation.company?.name}`);
    const companyData = gusValidation.company!;

    // Create local user with GUS-validated data (Auth0 only for SMS OTP)
    const [newUser] = await db.insert(users).values({
      userType: 'corporate',
      phone: data.phone,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      companyName: companyData.name,
      nip: data.nip,
      taxNumber: data.taxNumber, // Legacy field
      address: companyData.address.street,
      city: companyData.address.city,
      postalCode: companyData.address.postalCode,
      country: companyData.address.country,
      isCompanyVerified: true, // GUS validation passed
      companyStatus: companyData.status,
      isPhoneVerified: false,
    }).returning();

    // No Auth0 user creation needed - only SMS OTP

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
