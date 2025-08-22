import { prisma } from '../../db/connection';
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
    const otp = await prisma.otpCode.findFirst({
      where: {
        phone,
        code,
        purpose,
        isUsed: false
      }
    });

    if (!otp || new Date() > otp.expiresAt) {
      throw new Error('Invalid or expired OTP');
    }

    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { isUsed: true, usedAt: new Date() }
    });

    await publishPersistent('auth.otp.verified', { phone });
    return true;
  }
}

export const otpService = new OTPService();
