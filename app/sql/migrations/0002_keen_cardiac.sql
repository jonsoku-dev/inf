ALTER TABLE "profiles" DROP CONSTRAINT "profiles_profile_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "profile_id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "auth_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_auth_id_auth.users_id_fk" FOREIGN KEY ("auth_id") REFERENCES "public"."auth.users"("id") ON DELETE no action ON UPDATE no action;