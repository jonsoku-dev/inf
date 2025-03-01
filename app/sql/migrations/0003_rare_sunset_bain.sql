ALTER TABLE "profiles" DROP CONSTRAINT "profiles_auth_id_auth.users_id_fk";
--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "profile_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "username" text NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_profile_id_users_id_fk" FOREIGN KEY ("profile_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "auth_id";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "password";