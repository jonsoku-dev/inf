CREATE TYPE "public"."application_status" AS ENUM('pending', 'accepted', 'rejected', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."campaign_status" AS ENUM('DRAFT', 'PUBLISHED', 'CLOSED', 'CANCELLED', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."campaign_type" AS ENUM('INSTAGRAM', 'YOUTUBE', 'TIKTOK', 'BLOG');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('MALE', 'FEMALE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."influencer_category" AS ENUM('FASHION', 'BEAUTY', 'FOOD', 'TRAVEL', 'TECH', 'GAME', 'ENTERTAINMENT', 'LIFESTYLE', 'PARENTING', 'PETS', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."sns_type" AS ENUM('INSTAGRAM', 'YOUTUBE', 'TIKTOK', 'BLOG');--> statement-breakpoint
CREATE TYPE "public"."content_type" AS ENUM('INSTAGRAM_POST', 'INSTAGRAM_REEL', 'INSTAGRAM_STORY', 'YOUTUBE_SHORT', 'YOUTUBE_VIDEO', 'TIKTOK_VIDEO', 'BLOG_POST');--> statement-breakpoint
CREATE TYPE "public"."proposal_application_status" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."proposal_status" AS ENUM('DRAFT', 'PUBLISHED', 'CLOSED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."target_market" AS ENUM('KR', 'JP', 'BOTH');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('ADVERTISER', 'INFLUENCER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "applications" (
	"application_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"influencer_id" uuid NOT NULL,
	"application_status" "application_status" DEFAULT 'pending' NOT NULL,
	"message" text NOT NULL,
	"applied_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth.users" (
	"id" uuid PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"campaign_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"advertiser_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"budget" numeric(10, 2) NOT NULL,
	"campaign_status" "campaign_status" DEFAULT 'DRAFT',
	"target_market" text NOT NULL,
	"requirements" text NOT NULL,
	"period_start" text NOT NULL,
	"period_end" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"campaign_type" "campaign_type" DEFAULT 'INSTAGRAM',
	"categories" jsonb NOT NULL,
	"min_followers" integer,
	"max_applications" integer,
	"current_applications" integer DEFAULT 0,
	"is_urgent" boolean DEFAULT false,
	"preferred_gender" text,
	"preferred_age_range" jsonb,
	"location_requirements" text,
	"keywords" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "influencer_profiles" (
	"profile_id" uuid PRIMARY KEY NOT NULL,
	"categories" "influencer_category"[] NOT NULL,
	"instagram_handle" text,
	"youtube_handle" text,
	"tiktok_handle" text,
	"blog_url" text,
	"followers_count" jsonb NOT NULL,
	"gender" "gender",
	"birth_year" integer,
	"location" text,
	"introduction" text,
	"portfolio_urls" text[],
	"is_public" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "influencer_stats" (
	"stat_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"platform" "sns_type" NOT NULL,
	"recorded_at" timestamp DEFAULT now() NOT NULL,
	"followers_count" integer NOT NULL,
	"engagement_rate" numeric(5, 2),
	"avg_likes" integer,
	"avg_comments" integer,
	"avg_views" integer
);
--> statement-breakpoint
CREATE TABLE "influencer_verifications" (
	"verification_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"platform" "sns_type" NOT NULL,
	"verified_at" timestamp DEFAULT now() NOT NULL,
	"followers_count" integer NOT NULL,
	"engagement_rate" numeric(5, 2),
	"is_valid" boolean DEFAULT true NOT NULL,
	"next_verification_due" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"notification_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"campaign_id" uuid,
	"message" text NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"read_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "proposal_applications" (
	"application_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_id" uuid NOT NULL,
	"advertiser_id" uuid NOT NULL,
	"message" text NOT NULL,
	"proposal_application_status" "proposal_application_status" DEFAULT 'PENDING',
	"applied_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "influencer_proposals" (
	"proposal_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"influencer_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"desired_budget" integer NOT NULL,
	"target_market" "target_market" NOT NULL,
	"content_type" "content_type" NOT NULL,
	"expected_deliverables" text[] NOT NULL,
	"available_period_start" timestamp NOT NULL,
	"available_period_end" timestamp NOT NULL,
	"categories" text[] NOT NULL,
	"keywords" text[] NOT NULL,
	"portfolio_samples" text[],
	"is_negotiable" boolean DEFAULT true,
	"preferred_industry" text[],
	"proposal_status" "proposal_status" DEFAULT 'DRAFT',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"profile_id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"username" text NOT NULL,
	"role" "role" DEFAULT 'ADVERTISER',
	"line_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_campaign_id_campaigns_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("campaign_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_influencer_id_profiles_profile_id_fk" FOREIGN KEY ("influencer_id") REFERENCES "public"."profiles"("profile_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_advertiser_id_profiles_profile_id_fk" FOREIGN KEY ("advertiser_id") REFERENCES "public"."profiles"("profile_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "influencer_profiles" ADD CONSTRAINT "influencer_profiles_profile_id_profiles_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("profile_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "influencer_stats" ADD CONSTRAINT "influencer_stats_profile_id_influencer_profiles_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."influencer_profiles"("profile_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "influencer_verifications" ADD CONSTRAINT "influencer_verifications_profile_id_influencer_profiles_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."influencer_profiles"("profile_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_profiles_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("profile_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_campaign_id_campaigns_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("campaign_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_applications" ADD CONSTRAINT "proposal_applications_proposal_id_influencer_proposals_proposal_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."influencer_proposals"("proposal_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_applications" ADD CONSTRAINT "proposal_applications_advertiser_id_profiles_profile_id_fk" FOREIGN KEY ("advertiser_id") REFERENCES "public"."profiles"("profile_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "influencer_proposals" ADD CONSTRAINT "influencer_proposals_influencer_id_profiles_profile_id_fk" FOREIGN KEY ("influencer_id") REFERENCES "public"."profiles"("profile_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_profile_id_users_id_fk" FOREIGN KEY ("profile_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;