import { boolean, index, pgEnum, pgTable, text, timestamp, uuid, varchar, unique } from 'drizzle-orm/pg-core';

// User type enum
export const userTypeEnum = pgEnum('user_type', ['individual', 'corporate']);

// Auth provider enum
export const authProviderEnum = pgEnum('auth_provider', [
  'phone_otp',      // Telefon + OTP
  'apple',          // Apple Sign In
  'google',         // Google OAuth
  'facebook',       // Facebook Login
  'auth0_database'  // Auth0 database user
]);

// Main users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  userType: userTypeEnum('user_type').notNull(),

  // Contact info
  phone: varchar('phone', { length: 20 }).notNull(), // Removed .unique() - using composite
  email: varchar('email', { length: 255 }).unique(),

  // Profile
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),

  // Corporate specific
  companyName: varchar('company_name', { length: 255 }),
  taxNumber: varchar('tax_number', { length: 50 }),
  nip: varchar('nip', { length: 20 }), // Polish tax ID

  // Address (from GUS API for corporate, manual for individual)
  address: varchar('address', { length: 500 }),
  city: varchar('city', { length: 100 }),
  postalCode: varchar('postal_code', { length: 20 }),
  country: varchar('country', { length: 100 }).default('Poland'),

  // Corporate validation
  isCompanyVerified: boolean('is_company_verified').default(false),
  companyStatus: varchar('company_status', { length: 50 }), // active, inactive

  // Status
  isActive: boolean('is_active').default(true).notNull(),
  isPhoneVerified: boolean('is_phone_verified').default(false).notNull(),
  isEmailVerified: boolean('is_email_verified').default(false).notNull(),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at'),
}, (table) => ({
  phoneIdx: index('users_phone_idx').on(table.phone),
  emailIdx: index('users_email_idx').on(table.email),
  userTypeIdx: index('users_type_idx').on(table.userType),
  nipIdx: index('users_nip_idx').on(table.nip), // NIP için index
  // Composite unique constraint: phone + userType (aynı telefon, farklı tip olabilir)
  phoneUserTypeIdx: index('users_phone_usertype_idx').on(table.phone, table.userType),
  // Unique constraints
  phoneUserTypeUnique: unique('users_phone_usertype_unique').on(table.phone, table.userType),
  nipUnique: unique('users_nip_unique').on(table.nip), // NIP must be unique
}));

// Auth providers - Auth0 bağlantısı için
export const authProviders = pgTable('auth_providers', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

  // Auth0 info
  auth0UserId: varchar('auth0_user_id', { length: 100 }).unique().notNull(),
  provider: authProviderEnum('provider').notNull(),

  // Provider specific data
  providerData: text('provider_data'), // JSON data from social providers

  // Status
  isActive: boolean('is_active').default(true).notNull(),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  auth0UserIdx: index('auth_providers_auth0_user_idx').on(table.auth0UserId),
  userProviderIdx: index('auth_providers_user_provider_idx').on(table.userId, table.provider),
}));

// Active sessions tracking
export const userSessions = pgTable('user_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

  // Session info
  sessionToken: varchar('session_token', { length: 500 }).unique().notNull(),
  refreshToken: varchar('refresh_token', { length: 500 }),

  // Device/Client info
  deviceId: varchar('device_id', { length: 255 }),
  userAgent: text('user_agent'),
  ipAddress: varchar('ip_address', { length: 45 }),

  // Expiration
  expiresAt: timestamp('expires_at').notNull(),

  // Status
  isActive: boolean('is_active').default(true).notNull(),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastUsedAt: timestamp('last_used_at').defaultNow().notNull(),
}, (table) => ({
  sessionTokenIdx: index('user_sessions_token_idx').on(table.sessionToken),
  userIdIdx: index('user_sessions_user_id_idx').on(table.userId),
  expiresAtIdx: index('user_sessions_expires_idx').on(table.expiresAt),
}));

// OTP codes for phone verification
export const otpCodes = pgTable('otp_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  phone: varchar('phone', { length: 20 }).notNull(),
  code: varchar('code', { length: 10 }).notNull(),

  // Purpose
  purpose: varchar('purpose', { length: 50 }).notNull(), // 'registration', 'login', 'password_reset'

  // Status
  isUsed: boolean('is_used').default(false).notNull(),
  attempts: varchar('attempts', { length: 10 }).default('0').notNull(),

  // Expiration
  expiresAt: timestamp('expires_at').notNull(),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  usedAt: timestamp('used_at'),
}, (table) => ({
  phoneIdx: index('otp_codes_phone_idx').on(table.phone),
  codeIdx: index('otp_codes_code_idx').on(table.code),
  expiresAtIdx: index('otp_codes_expires_idx').on(table.expiresAt),
}));
