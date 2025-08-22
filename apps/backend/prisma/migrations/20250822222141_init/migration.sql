-- CreateEnum
CREATE TYPE "public"."UserType" AS ENUM ('individual', 'corporate');

-- CreateEnum
CREATE TYPE "public"."AuthProvider" AS ENUM ('phone_otp', 'apple', 'google', 'facebook', 'auth0_database');

-- CreateEnum
CREATE TYPE "public"."AuditLogType" AS ENUM ('s', 'slo', 'f', 'fp', 'fc', 'fce', 'fco', 'fcp', 'fcpn', 'fcpr', 'fcpro', 'fepotpft', 'seacft', 'sepft', 'scp', 'scpn', 'pwd_leak', 'api_limit', 'limit_wc', 'limit_ui', 'limit_mu', 'w', 'du', 'fu', 'pla', 'cls', 'cs', 'sce', 'ss', 'fs', 'fsa', 'admin_update_launch', 'sapi', 'fapi', 'mgmt_api_read', 'mgmt_api_write');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "user_type" "public"."UserType" NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255),
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "company_name" VARCHAR(255),
    "tax_number" VARCHAR(50),
    "nip" VARCHAR(20),
    "address" VARCHAR(500),
    "city" VARCHAR(100),
    "postal_code" VARCHAR(20),
    "country" VARCHAR(100) DEFAULT 'Poland',
    "is_company_verified" BOOLEAN DEFAULT false,
    "company_status" VARCHAR(50),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."auth_providers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "auth0_user_id" VARCHAR(100) NOT NULL,
    "provider" "public"."AuthProvider" NOT NULL,
    "provider_data" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_token" VARCHAR(500) NOT NULL,
    "refresh_token" VARCHAR(500),
    "device_id" VARCHAR(255),
    "user_agent" TEXT,
    "ip_address" VARCHAR(45),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."otp_codes" (
    "id" TEXT NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "purpose" VARCHAR(50) NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "attempts" VARCHAR(10) NOT NULL DEFAULT '0',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used_at" TIMESTAMP(3),

    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" TEXT NOT NULL,
    "log_id" VARCHAR(100) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "public"."AuditLogType" NOT NULL,
    "description" TEXT NOT NULL,
    "connection" VARCHAR(100),
    "connection_id" VARCHAR(100),
    "client_id" VARCHAR(100),
    "client_name" VARCHAR(255),
    "ip" VARCHAR(45) NOT NULL,
    "client_ip" VARCHAR(45),
    "user_agent" TEXT,
    "hostname" VARCHAR(255),
    "security_context" JSONB,
    "user_id" VARCHAR(100),
    "user_name" VARCHAR(255),
    "audience" VARCHAR(255),
    "scope" TEXT,
    "location_info" JSONB,
    "is_suspicious" VARCHAR(10) NOT NULL DEFAULT 'false',
    "risk_score" VARCHAR(10) NOT NULL DEFAULT '0',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ip_analysis" (
    "id" TEXT NOT NULL,
    "ip" VARCHAR(45) NOT NULL,
    "total_requests" VARCHAR(20) NOT NULL DEFAULT '0',
    "failed_attempts" VARCHAR(20) NOT NULL DEFAULT '0',
    "successful_logins" VARCHAR(20) NOT NULL DEFAULT '0',
    "risk_level" VARCHAR(20) NOT NULL DEFAULT 'low',
    "is_blocked" VARCHAR(10) NOT NULL DEFAULT 'false',
    "first_seen" TIMESTAMP(3) NOT NULL,
    "last_seen" TIMESTAMP(3) NOT NULL,
    "last_activity" TIMESTAMP(3) NOT NULL,
    "last_country" VARCHAR(100),
    "last_city" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ip_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_behavior_analysis" (
    "id" TEXT NOT NULL,
    "user_id" VARCHAR(100) NOT NULL,
    "total_logins" VARCHAR(20) NOT NULL DEFAULT '0',
    "failed_login_attempts" VARCHAR(20) NOT NULL DEFAULT '0',
    "unique_devices" VARCHAR(10) NOT NULL DEFAULT '0',
    "unique_ips" VARCHAR(10) NOT NULL DEFAULT '0',
    "first_login" TIMESTAMP(3),
    "last_login" TIMESTAMP(3),
    "avg_session_duration" VARCHAR(20) NOT NULL DEFAULT '0',
    "suspicious_activity_count" VARCHAR(10) NOT NULL DEFAULT '0',
    "risk_score" VARCHAR(10) NOT NULL DEFAULT '0',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_behavior_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_nip_key" ON "public"."users"("nip");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "public"."users"("phone");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_type_idx" ON "public"."users"("user_type");

-- CreateIndex
CREATE INDEX "users_nip_idx" ON "public"."users"("nip");

-- CreateIndex
CREATE INDEX "users_phone_usertype_idx" ON "public"."users"("phone", "user_type");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_usertype_unique" ON "public"."users"("phone", "user_type");

-- CreateIndex
CREATE UNIQUE INDEX "auth_providers_auth0_user_id_key" ON "public"."auth_providers"("auth0_user_id");

-- CreateIndex
CREATE INDEX "auth_providers_auth0_user_idx" ON "public"."auth_providers"("auth0_user_id");

-- CreateIndex
CREATE INDEX "auth_providers_user_provider_idx" ON "public"."auth_providers"("user_id", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_session_token_key" ON "public"."user_sessions"("session_token");

-- CreateIndex
CREATE INDEX "user_sessions_token_idx" ON "public"."user_sessions"("session_token");

-- CreateIndex
CREATE INDEX "user_sessions_user_id_idx" ON "public"."user_sessions"("user_id");

-- CreateIndex
CREATE INDEX "user_sessions_expires_idx" ON "public"."user_sessions"("expires_at");

-- CreateIndex
CREATE INDEX "otp_codes_phone_idx" ON "public"."otp_codes"("phone");

-- CreateIndex
CREATE INDEX "otp_codes_code_idx" ON "public"."otp_codes"("code");

-- CreateIndex
CREATE INDEX "otp_codes_expires_idx" ON "public"."otp_codes"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "audit_logs_log_id_key" ON "public"."audit_logs"("log_id");

-- CreateIndex
CREATE INDEX "audit_logs_date_idx" ON "public"."audit_logs"("date");

-- CreateIndex
CREATE INDEX "audit_logs_type_idx" ON "public"."audit_logs"("type");

-- CreateIndex
CREATE INDEX "audit_logs_ip_idx" ON "public"."audit_logs"("ip");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "public"."audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_client_id_idx" ON "public"."audit_logs"("client_id");

-- CreateIndex
CREATE INDEX "audit_logs_log_id_idx" ON "public"."audit_logs"("log_id");

-- CreateIndex
CREATE INDEX "audit_logs_date_type_idx" ON "public"."audit_logs"("date", "type");

-- CreateIndex
CREATE INDEX "audit_logs_user_date_idx" ON "public"."audit_logs"("user_id", "date");

-- CreateIndex
CREATE INDEX "audit_logs_ip_date_idx" ON "public"."audit_logs"("ip", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ip_analysis_ip_key" ON "public"."ip_analysis"("ip");

-- CreateIndex
CREATE INDEX "ip_analysis_ip_idx" ON "public"."ip_analysis"("ip");

-- CreateIndex
CREATE INDEX "ip_analysis_risk_level_idx" ON "public"."ip_analysis"("risk_level");

-- CreateIndex
CREATE INDEX "ip_analysis_last_seen_idx" ON "public"."ip_analysis"("last_seen");

-- CreateIndex
CREATE UNIQUE INDEX "user_behavior_analysis_user_id_key" ON "public"."user_behavior_analysis"("user_id");

-- CreateIndex
CREATE INDEX "user_behavior_user_id_idx" ON "public"."user_behavior_analysis"("user_id");

-- CreateIndex
CREATE INDEX "user_behavior_last_login_idx" ON "public"."user_behavior_analysis"("last_login");

-- CreateIndex
CREATE INDEX "user_behavior_risk_score_idx" ON "public"."user_behavior_analysis"("risk_score");

-- AddForeignKey
ALTER TABLE "public"."auth_providers" ADD CONSTRAINT "auth_providers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
