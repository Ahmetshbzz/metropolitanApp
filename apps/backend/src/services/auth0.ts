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

    const data = await response.json();
    return data.access_token;
  }

  async createCorporateUser(phone: string, companyName: string, taxNumber?: string) {
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
          phone: phone // Phone in metadata
        },
        app_metadata: {
          user_type: 'corporate'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Auth0 user creation failed: ${response.statusText}`);
    }

    console.log(`🏢 Corporate user created: ${companyName} - ${phone}`);
    return await response.json();
  }

  async createIndividualUser(data: any) {
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

    console.log(`👤 Individual user created: ${data.firstName} ${data.lastName} - ${data.phone}`);
    return await response.json();
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

    console.log(`📱 Auth0 OTP sent successfully to: ${phone}`);
  }

  async verifyPhoneOTP(phone: string, otp: string): Promise<any> {
    const mobileClientId = process.env.AUTH0_MOBILE_CLIENT_ID;

    const response = await fetch(`https://${this.domain}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'http://auth0.com/oauth/grant-type/passwordless/otp',
        client_id: mobileClientId, // Mobile Native App client ID
        username: phone,
        otp: otp,
        realm: 'sms',
        audience: this.audience,
        scope: 'openid profile phone'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Auth0 OTP verification failed: ${response.statusText} - ${error}`);
    }

    return await response.json();
  }

  async exchangeSocialToken(provider: string, token: string): Promise<any> {
    // Social token exchange - implement as needed
    console.log(`🔗 Exchanging ${provider} token`);
    return {
      sub: `auth0_social_${Date.now()}`,
      email: 'user@example.com',
      given_name: 'John',
      family_name: 'Doe'
    };
  }
}

export const auth0Service = new Auth0Service();
