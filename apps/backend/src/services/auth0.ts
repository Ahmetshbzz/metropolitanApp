interface Auth0TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface Auth0User {
  user_id: string;
  email: string;
  name: string;
  given_name?: string;
  family_name?: string;
  user_metadata: Record<string, unknown>;
  app_metadata: Record<string, unknown>;
}

interface IndividualUserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface Auth0VerificationResult {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface SocialUserData {
  sub: string;
  email: string;
  given_name: string;
  family_name: string;
}

export class Auth0Service {
  private domain = process.env.AUTH0_DOMAIN;
  private clientId = process.env.AUTH0_CLIENT_ID;
  private clientSecret = process.env.AUTH0_CLIENT_SECRET;
  private managementClientId = process.env.AUTH0_MANAGEMENT_CLIENT_ID;
  private managementClientSecret = process.env.AUTH0_MANAGEMENT_CLIENT_SECRET;
  private audience = process.env.AUTH0_AUDIENCE;

  private async getManagementToken(): Promise<string> {
    const response = await fetch(`https://${this.domain}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: this.managementClientId,
        client_secret: this.managementClientSecret,
        audience: `https://${this.domain}/api/v2/`,
        grant_type: 'client_credentials'
      })
    });

    if (!response.ok) {
      throw new Error(`Auth0 Management API token failed: ${response.statusText}`);
    }

    const data = await response.json() as Auth0TokenResponse;
    return data.access_token;
  }

  async createCorporateUser(phone: string, companyName: string, taxNumber?: string): Promise<Auth0User> {
    const token = await this.getManagementToken();

    const response = await fetch(`https://${this.domain}/api/v2/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        connection: 'Username-Password-Authentication',
        email: `${phone.replace('+', '')}@corporate.temp`, // Temporary email
        name: companyName,
        user_metadata: {
          user_type: 'corporate',
          company_name: companyName,
          tax_number: taxNumber,
          phone // Phone in metadata
        },
        app_metadata: {
          user_type: 'corporate'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Auth0 user creation failed: ${response.statusText}`);
    }

    // Corporate user created successfully
    return await response.json() as Auth0User;
  }

  async createIndividualUser(data: IndividualUserData): Promise<Auth0User> {
    const token = await this.getManagementToken();

    const response = await fetch(`https://${this.domain}/api/v2/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        connection: 'Username-Password-Authentication',
        email: data.email,
        name: `${data.firstName} ${data.lastName}`,
        given_name: data.firstName,
        family_name: data.lastName,
        user_metadata: {
          user_type: 'individual',
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone // Phone in metadata instead of root
        },
        app_metadata: {
          user_type: 'individual'
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Auth0 individual user creation error:', error);
      throw new Error(`Auth0 user creation failed: ${response.statusText} - ${error}`);
    }

    // Individual user created successfully
    return await response.json() as Auth0User;
  }

  async sendPhoneOTP(phone: string): Promise<void> {
    const mobileClientId = process.env.AUTH0_MOBILE_CLIENT_ID;

    const response = await fetch(`https://${this.domain}/passwordless/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: mobileClientId, // Mobile Native App client ID
        phone_number: phone,
        connection: 'sms'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Auth0 SMS OTP failed: ${response.statusText} - ${error}`);
    }

    // OTP sent successfully
  }

  async verifyPhoneOTP(phone: string, otp: string): Promise<Auth0VerificationResult> {
    const mobileClientId = process.env.AUTH0_MOBILE_CLIENT_ID;

    const response = await fetch(`https://${this.domain}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'http://auth0.com/oauth/grant-type/passwordless/otp',
        client_id: mobileClientId, // Mobile Native App client ID
        username: phone,
        otp,
        realm: 'sms',
        audience: this.audience,
        scope: 'openid profile phone'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Auth0 OTP verification failed: ${response.statusText} - ${error}`);
    }

    return await response.json() as Auth0VerificationResult;
  }

  async exchangeSocialToken(_provider: string, _token: string): Promise<SocialUserData> {
    // Social token exchange logic would be implemented here
    return {
      sub: `auth0_social_${Date.now()}`,
      email: 'user@example.com',
      given_name: 'John',
      family_name: 'Doe'
    };
  }
}

export const auth0Service = new Auth0Service();
