export enum UserType {
  INDIVIDUAL = 'individual',
  CORPORATE = 'corporate'
}

export enum AuthProvider {
  PHONE_OTP = 'phone_otp',
  APPLE = 'apple',
  GOOGLE = 'google',
  FACEBOOK = 'facebook'
}

export interface RegisterCorporateRequest {
  phone: string;
  email: string;
  firstName: string;
  lastName: string;
  nip: string; // Polish tax ID - required
  companyName?: string; // Will be fetched from GUS
  taxNumber?: string; // Legacy field
}

export interface RegisterIndividualRequest {
  phone: string; // Required
  email: string; // Required
  firstName: string; // Required
  lastName: string; // Required
  provider: AuthProvider;
  socialToken?: string; // Apple/Google/Facebook token
}

export interface LoginRequest {
  phone: string;
  otp?: string;
  userType: UserType;
}

export interface User {
  id: string;
  userType: UserType;
  phone: string;
  email?: string;
  firstName?: string;
  lastName?: string;

  // Corporate specific
  companyName?: string;
  taxNumber?: string;
  nip?: string; // Polish tax ID

  // Address (from GUS for corporate, manual for individual)
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;

  // Corporate validation
  isCompanyVerified?: boolean;
  companyStatus?: string; // active, inactive

  // Status
  isActive: boolean;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  auth0UserId: string;
}

// Event payloads for event bus
export interface AuthEventPayloads {
  'auth.user.registered': {
    userId: string;
    userType: UserType;
    phone: string;
    provider: AuthProvider;
  };
  'auth.user.login': {
    userId: string;
    sessionId: string;
    userType: UserType;
    loginMethod: AuthProvider;
  };
  'auth.user.logout': {
    userId: string;
    sessionId: string;
  };
  'auth.otp.sent': {
    phone: string;
    purpose: 'registration' | 'login';
  };
  'auth.otp.verified': {
    phone: string;
    userId?: string;
  };
}
