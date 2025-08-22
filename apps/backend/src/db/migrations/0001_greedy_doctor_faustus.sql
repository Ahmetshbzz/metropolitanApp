ALTER TABLE "users" ADD COLUMN "nip" varchar(20);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "address" varchar(500);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "city" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "postal_code" varchar(20);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "country" varchar(100) DEFAULT 'Poland';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_company_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "company_status" varchar(50);