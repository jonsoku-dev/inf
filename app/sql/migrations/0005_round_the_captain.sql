CREATE TABLE "campaign_admin_comments" (
	"comment_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"admin_id" uuid NOT NULL,
	"comment" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "campaign_admin_comments" ADD CONSTRAINT "campaign_admin_comments_campaign_id_campaigns_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("campaign_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_admin_comments" ADD CONSTRAINT "campaign_admin_comments_admin_id_profiles_profile_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."profiles"("profile_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public"."notifications" ALTER COLUMN "notification_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."notification_type";--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('ANNOUNCEMENT', 'SYSTEM', 'CAMPAIGN', 'PROPOSAL');--> statement-breakpoint
ALTER TABLE "public"."notifications" ALTER COLUMN "notification_type" SET DATA TYPE "public"."notification_type" USING "notification_type"::"public"."notification_type";