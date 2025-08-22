import { Elysia } from 'elysia';
import { auth } from '../../../../modules/auth';
import { apiResponse } from '../../../middleware/versioning';

export const authRoutes = new Elysia({ prefix: '/auth' })
  // Corporate phone check - kayıtlı mı kontrol et
  .post('/corporate/check-phone', async ({ body }: any) => {
    const { phone } = body;

    if (!phone) {
      return apiResponse({ error: 'Phone number required' }, { status: 400 });
    }

    const existingUser = await auth.corporate.findByPhone(phone);
    
    if (existingUser) {
      // Kayıtlı - OTP gönder ve giriş yap
      await auth.otp.send(phone, 'login');
      return apiResponse({
        exists: true,
        message: 'OTP sent for login',
        userId: existingUser.id
      });
    }

    // Kayıtlı değil - kayıt bilgileri lazım
    return apiResponse({
      exists: false,
      message: 'Registration required - company details needed'
    });
  })

  // Individual phone check - kayıtlı mı kontrol et  
  .post('/individual/check-phone', async ({ body }: any) => {
    const { phone } = body;

    if (!phone) {
      return apiResponse({ error: 'Phone number required' }, { status: 400 });
    }

    const existingUser = await auth.individual.findByPhone(phone);
    
    if (existingUser) {
      // Kayıtlı - OTP gönder ve giriş yap
      await auth.otp.send(phone, 'login');
      return apiResponse({
        exists: true,
        message: 'OTP sent for login', 
        userId: existingUser.id
      });
    }

    // Kayıtlı değil - kayıt bilgileri lazım
    return apiResponse({
      exists: false,
      message: 'Registration required - personal details needed'
    });
  })

  // Corporate registration
  .post('/corporate/register', async ({ body }: any) => {
    const { phone, companyName, taxNumber } = body;

    if (!phone || !companyName) {
      return apiResponse({ error: 'phone and companyName required' }, { status: 400 });
    }

    const result = await auth.corporate.register({ phone, companyName, taxNumber });
    return apiResponse(result);
  })

  // Individual registration (phone)
  .post('/individual/register', async ({ body }: any) => {
    const { phone, firstName, lastName } = body;

    if (!phone) {
      return apiResponse({ error: 'phone required' }, { status: 400 });
    }

    const result = await auth.individual.registerWithPhone(phone, firstName, lastName);
    return apiResponse(result);
  })

  // Send OTP
  .post('/otp/send', async ({ body }: any) => {
    const { phone, purpose } = body;

    if (!phone || !purpose) {
      return apiResponse({ error: 'phone and purpose required' }, { status: 400 });
    }

    // For login purpose, check if user exists
    if (purpose === 'login') {
      const user = await auth.individual.findByPhone(phone) || await auth.corporate.findByPhone(phone);
      if (!user) {
        return apiResponse({ error: 'NOT_FOUND' }, { status: 404 });
      }
    }

    await auth.otp.send(phone, purpose);
    return apiResponse({ message: 'OTP sent successfully' });
  })

  // Login with OTP
  .post('/login', async ({ body }: any) => {
    const { phone, otp, userType } = body;

    if (!phone || !otp || !userType) {
      return apiResponse({ error: 'phone, otp and userType required' }, { status: 400 });
    }

    let result;
    if (userType === 'corporate') {
      result = await auth.corporate.login(phone, otp);
    } else {
      result = await auth.individual.loginWithPhone(phone, otp);
    }

    return apiResponse(result);
  })

  // Logout
  .post('/logout', async ({ headers }: any) => {
    const authHeader = headers.authorization;
    if (!authHeader) {
      return apiResponse({ error: 'Session token required' }, { status: 401 });
    }

    const sessionToken = authHeader.replace('Bearer ', '');
    await auth.session.revoke(sessionToken);

    return apiResponse({ message: 'Logged out successfully' });
  });
