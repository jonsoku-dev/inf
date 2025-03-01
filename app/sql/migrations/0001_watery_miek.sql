ALTER TABLE "applications" ALTER COLUMN "application_status" SET DEFAULT 'PENDING';--> statement-breakpoint
ALTER TABLE "public"."applications" ALTER COLUMN "application_status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."application_status";--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
ALTER TABLE "public"."applications" ALTER COLUMN "application_status" SET DATA TYPE "public"."application_status" USING "application_status"::"public"."application_status";