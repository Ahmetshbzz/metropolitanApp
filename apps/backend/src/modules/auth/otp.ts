import { and, eq } from 'drizzle-orm';
import { db } from '../../db/connection';
import { otpCodes } from '../../db/schema/users';
import { publishPersistent } from '../../event-bus';
import { auth0Service } from '../../services/auth0';

export class OTPService {
  async send(phone: string, purpose: 'registration' | 'login'): Promise<void> {
    // Let Auth0 generate and send OTP - we don't generate our own
    await auth0Service.sendPhoneOTP(phone);
    await publishPersistent('auth.otp.sent', { phone, purpose });

    // OTP sent via Auth0
  }

  async verify(phone: string, code: string, purpose: 'registration' | 'login'): Promise<boolean> {
    const [otp] = await db.select()
      .from(otpCodes)
      .where(and(
        eq(otpCodes.phone, phone),
        eq(otpCodes.code, code),
        eq(otpCodes.purpose, purpose),
        eq(otpCodes.isUsed, false)
      ))
      .limit(1);

    if (!otp || new Date() > otp.expiresAt) {
      throw new Error('Invalid or expired OTP');
    }

    await db.update(otpCodes)
      .set({ isUsed: true, usedAt: new Date() })
      .where(eq(otpCodes.id, otp.id));

    await publishPersistent('auth.otp.verified', { phone });
    return true;
  }
}

export const otpService = new OTPService();
