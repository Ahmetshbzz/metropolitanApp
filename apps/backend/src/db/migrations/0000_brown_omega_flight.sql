CREATE TYPE "public"."audit_log_type" AS ENUM('s', 'slo', 'f', 'fp', 'fc', 'fce', 'fco', 'fcp', 'fcpn', 'fcpr', 'fcpro', 'fepotpft', 'seacft', 'sepft', 'scp', 'scpn', 'pwd_leak', 'api_limit', 'limit_wc', 'limit_ui', 'limit_mu', 'w', 'du', 'fu', 'pla', 'cls', 'cs', 'sce', 'ss', 'fs', 'fsa', 'admin_update_launch', 'sapi', 'fapi', 'mgmt_api_read', 'mgmt_api_write');--> statement-breakpoint
CREATE TYPE "public"."auth_provider" AS ENUM('phone_otp', 'apple', 'google', 'facebook', 'auth0_database');--> statement-breakpoint
CREATE TYPE "public"."user_type" AS ENUM('individual', 'corporate');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"log_id" varchar(100) NOT NULL,
	"date" timestamp NOT NULL,
	"type" "audit_log_type" NOT NULL,
	"description" text NOT NULL,
	"connection" varchar(100),
	"connection_id" varchar(100),
	"client_id" varchar(100),
	"client_name" varchar(255),
	"ip" varchar(45) NOT NULL,
	"client_ip" varchar(45),
	"user_agent" text,
	"hostname" varchar(255),
	"security_context" json,
	"user_id" varchar(100),
	"user_name" varchar(255),
	"audience" varchar(255),
	"scope" text,
	"location_info" json,
	"is_suspicious" varchar(10) DEFAULT 'false',
	"risk_score" varchar(10) DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp,
	CONSTRAINT "audit_logs_log_id_unique" UNIQUE("log_id")
);
--> statement-breakpoint
CREATE TABLE "ip_analysis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip" varchar(45) NOT NULL,
	"total_requests" varchar(20) DEFAULT '0',
	"failed_attempts" varchar(20) DEFAULT '0',
	"successful_logins" varchar(20) DEFAULT '0',
	"risk_level" varchar(20) DEFAULT 'low',
	"is_blocked" varchar(10) DEFAULT 'false',
	"first_seen" timestamp NOT NULL,
	"last_seen" timestamp NOT NULL,
	"last_activity" timestamp NOT NULL,
	"last_country" varchar(100),
	"last_city" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ip_analysis_ip_unique" UNIQUE("ip")
);
--> statement-breakpoint
CREATE TABLE "user_behavior_analysis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(100) NOT NULL,
	"total_logins" varchar(20) DEFAULT '0',
	"failed_login_attempts" varchar(20) DEFAULT '0',
	"unique_devices" varchar(10) DEFAULT '0',
	"unique_ips" varchar(10) DEFAULT '0',
	"first_login" timestamp,
	"last_login" timestamp,
	"avg_session_duration" varchar(20) DEFAULT '0',
	"suspicious_activity_count" varchar(10) DEFAULT '0',
	"risk_score" varchar(10) DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_behavior_analysis_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"auth0_user_id" varchar(100) NOT NULL,
	"provider" "auth_provider" NOT NULL,
	"provider_data" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "auth_providers_auth0_user_id_unique" UNIQUE("auth0_user_id")
);
--> statement-breakpoint
CREATE TABLE "otp_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" varchar(20) NOT NULL,
	"code" varchar(10) NOT NULL,
	"purpose" varchar(50) NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"attempts" varchar(10) DEFAULT '0' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"used_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_token" varchar(500) NOT NULL,
	"refresh_token" varchar(500),
	"device_id" varchar(255),
	"user_agent" text,
	"ip_address" varchar(45),
	"expires_at" timestamp NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_used_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_type" "user_type" NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(255),
	"first_name" varchar(100),
	"last_name" varchar(100),
	"company_name" varchar(255),
	"tax_number" varchar(50),
	"nip" varchar(20),
	"address" varchar(500),
	"city" varchar(100),
	"postal_code" varchar(20),
	"country" varchar(100) DEFAULT 'Poland',
	"is_company_verified" boolean DEFAULT false,
	"company_status" varchar(50),
	"is_active" boolean DEFAULT true NOT NULL,
	"is_phone_verified" boolean DEFAULT false NOT NULL,
	"is_email_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_login_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_usertype_unique" UNIQUE("phone","user_type"),
	CONSTRAINT "users_nip_unique" UNIQUE("nip")
);
--> statement-breakpoint
ALTER TABLE "auth_providers" ADD CONSTRAINT "auth_providers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_date_idx" ON "audit_logs" USING btree ("date");--> statement-breakpoint
CREATE INDEX "audit_logs_type_idx" ON "audit_logs" USING btree ("type");--> statement-breakpoint
CREATE INDEX "audit_logs_ip_idx" ON "audit_logs" USING btree ("ip");--> statement-breakpoint
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_client_id_idx" ON "audit_logs" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "audit_logs_log_id_idx" ON "audit_logs" USING btree ("log_id");--> statement-breakpoint
CREATE INDEX "audit_logs_date_type_idx" ON "audit_logs" USING btree ("date","type");--> statement-breakpoint
CREATE INDEX "audit_logs_user_date_idx" ON "audit_logs" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "audit_logs_ip_date_idx" ON "audit_logs" USING btree ("ip","date");--> statement-breakpoint
CREATE INDEX "ip_analysis_ip_idx" ON "ip_analysis" USING btree ("ip");--> statement-breakpoint
CREATE INDEX "ip_analysis_risk_level_idx" ON "ip_analysis" USING btree ("risk_level");--> statement-breakpoint
CREATE INDEX "ip_analysis_last_seen_idx" ON "ip_analysis" USING btree ("last_seen");--> statement-breakpoint
CREATE INDEX "user_behavior_user_id_idx" ON "user_behavior_analysis" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_behavior_last_login_idx" ON "user_behavior_analysis" USING btree ("last_login");--> statement-breakpoint
CREATE INDEX "user_behavior_risk_score_idx" ON "user_behavior_analysis" USING btree ("risk_score");--> statement-breakpoint
CREATE INDEX "auth_providers_auth0_user_idx" ON "auth_providers" USING btree ("auth0_user_id");--> statement-breakpoint
CREATE INDEX "auth_providers_user_provider_idx" ON "auth_providers" USING btree ("user_id","provider");--> statement-breakpoint
CREATE INDEX "otp_codes_phone_idx" ON "otp_codes" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "otp_codes_code_idx" ON "otp_codes" USING btree ("code");--> statement-breakpoint
CREATE INDEX "otp_codes_expires_idx" ON "otp_codes" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "user_sessions_token_idx" ON "user_sessions" USING btree ("session_token");--> statement-breakpoint
CREATE INDEX "user_sessions_user_id_idx" ON "user_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_sessions_expires_idx" ON "user_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "users_phone_idx" ON "users" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_type_idx" ON "users" USING btree ("user_type");--> statement-breakpoint
CREATE INDEX "users_nip_idx" ON "users" USING btree ("nip");--> statement-breakpoint
CREATE INDEX "users_phone_usertype_idx" ON "users" USING btree ("phone","user_type");