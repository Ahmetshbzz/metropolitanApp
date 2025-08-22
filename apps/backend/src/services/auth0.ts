import { AuthenticationApi, ManagementApi } from 'auth0';

// Auth0 Management API client for user operations
export class Auth0Service {
  private management: ManagementApi;
  private authentication: AuthenticationApi;

  constructor() {
    // Validate required environment variables
    this.validateEnvVars();

    this.management = new ManagementApi({
      domain: process.env.AUTH0_DOMAIN!,
      clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID!,
      clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET!,
    });

    this.authentication = new AuthenticationApi({
      domain: process.env.AUTH0_DOMAIN!,
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
    });
  }

  private validateEnvVars(): void {
    const required = [
      'AUTH0_DOMAIN',
      'AUTH0_CLIENT_ID',
      'AUTH0_CLIENT_SECRET',
      'AUTH0_MANAGEMENT_CLIENT_ID',
      'AUTH0_MANAGEMENT_CLIENT_SECRET'
    ];

    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(`Missing Auth0 environment variables: ${missing.join(', ')}`);
    }
  }

  // Corporate user: Phone + OTP ile kayıt
  async createCorporateUser(phone: string, companyName: string, taxNumber?: string) {
    try {
      const auth0User = await this.management.users.create({
        connection: 'Username-Password-Authentication', // Auth0 database
        phone_number: phone,
        name: companyName,
        user_metadata: {
          user_type: 'corporate',
          company_name: companyName,
          tax_number: taxNumber,
        },
        app_metadata: {
          user_type: 'corporate',
        },
        phone_verified: false, // OTP ile doğrulanacak
      });

      return auth0User.data;
    } catch (error) {
      console.error('❌ Auth0 corporate user creation failed:', error);
      throw new Error(`Failed to create corporate user: ${error}`);
    }
  }

  // Individual user: Social login veya Phone + OTP
  async createIndividualUser(data: {
    phone?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    provider: 'phone_otp' | 'apple' | 'google' | 'facebook';
  }) {
    try {
      const userData: any = {
        connection: data.provider === 'phone_otp'
          ? 'Username-Password-Authentication'
          : data.provider,
        user_metadata: {
          user_type: 'individual',
        },
        app_metadata: {
          user_type: 'individual',
        },
      };

      if (data.phone) userData.phone_number = data.phone;
      if (data.email) userData.email = data.email;
      if (data.firstName && data.lastName) {
        userData.name = `${data.firstName} ${data.lastName}`;
        userData.given_name = data.firstName;
        userData.family_name = data.lastName;
      }

      const auth0User = await this.management.users.create(userData);
      return auth0User.data;
    } catch (error) {
      console.error('❌ Auth0 individual user creation failed:', error);
      throw new Error(`Failed to create individual user: ${error}`);
    }
  }

  // Phone ile OTP gönder
  async sendPhoneOTP(phone: string): Promise<void> {
    try {
      // Auth0'ın Passwordless API'sini kullan
      await this.authentication.passwordless.sendSMS({
        phone_number: phone,
        client_id: process.env.AUTH0_CLIENT_ID!,
      });

      console.log(`📱 OTP sent to ${phone}`);
    } catch (error) {
      console.error('❌ Failed to send OTP:', error);
      throw new Error(`Failed to send OTP to ${phone}: ${error}`);
    }
  }

  // OTP verify et
  async verifyPhoneOTP(phone: string, code: string): Promise<any> {
    try {
      const result = await this.authentication.passwordless.signIn({
        phone_number: phone,
        otp: code,
        client_id: process.env.AUTH0_CLIENT_ID!,
      });

      return result.data;
    } catch (error) {
      console.error('❌ OTP verification failed:', error);
      throw new Error(`OTP verification failed: ${error}`);
    }
  }

  // Auth0 user'ı ID ile getir
  async getUserById(auth0UserId: string): Promise<any> {
    try {
      const user = await this.management.users.get({ id: auth0UserId });
      return user.data;
    } catch (error) {
      console.error('❌ Failed to get Auth0 user:', error);
      throw new Error(`Failed to get user ${auth0UserId}: ${error}`);
    }
  }

  // Phone number ile user bul
  async getUserByPhone(phone: string): Promise<any> {
    try {
      const users = await this.management.users.getAll({
        q: `phone_number:"${phone}"`,
        search_engine: 'v3'
      });

      return users.data.length > 0 ? users.data[0] : null;
    } catch (error) {
      console.error('❌ Failed to search user by phone:', error);
      throw new Error(`Failed to find user by phone: ${error}`);
    }
  }

  // Social login için token exchange
  async exchangeSocialToken(provider: string, accessToken: string): Promise<any> {
    try {
      // Social provider token'ını Auth0 token'a çevir
      const result = await this.authentication.oauth.socialAccessToken({
        provider,
        access_token: accessToken,
        client_id: process.env.AUTH0_CLIENT_ID!,
        client_secret: process.env.AUTH0_CLIENT_SECRET!,
      });

      return result.data;
    } catch (error) {
      console.error('❌ Social token exchange failed:', error);
      throw new Error(`Social login failed for ${provider}: ${error}`);
    }
  }
}

export const auth0Service = new Auth0Service();
