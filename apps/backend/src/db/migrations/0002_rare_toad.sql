CREATE INDEX "users_nip_idx" ON "users" USING btree ("nip");--> statement-breakpoint
CREATE INDEX "users_phone_usertype_idx" ON "users" USING btree ("phone","user_type");