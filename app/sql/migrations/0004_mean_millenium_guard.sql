CREATE TYPE "public"."notification_target" AS ENUM('ALL', 'ADVERTISERS', 'INFLUENCERS');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('ANNOUNCEMENT', 'SYSTEM', 'CAMPAIGN', 'proposal');--> statement-breakpoint
CREATE TABLE "notification_reads" (
	"read_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notification_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"read_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_profiles_profile_id_fk";
--> statement-breakpoint
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_campaign_id_campaigns_campaign_id_fk";
--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "admin_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "title" text NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "content" text NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "notification_type" "notification_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "target_audience" "notification_target" NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "is_important" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "is_published" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "publish_date" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "expiry_date" timestamp;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "notification_reads" ADD CONSTRAINT "notification_reads_notification_id_notifications_notification_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("notification_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_reads" ADD CONSTRAINT "notification_reads_user_id_profiles_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_admin_id_profiles_profile_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."profiles"("profile_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "campaign_id";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "message";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "sent_at";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "read_at";