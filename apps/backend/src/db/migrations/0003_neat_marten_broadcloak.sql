ALTER TABLE "users" DROP CONSTRAINT "users_phone_unique";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_phone_usertype_unique" UNIQUE("phone","user_type");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_nip_unique" UNIQUE("nip");