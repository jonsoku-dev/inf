CREATE TYPE "public"."campaign_status" AS ENUM('draft', 'published', 'closed', 'completed');--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "status" SET DATA TYPE campaign_status;--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "status" SET DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "message" text NOT NULL;