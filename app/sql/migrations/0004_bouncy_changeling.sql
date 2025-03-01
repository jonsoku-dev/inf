CREATE TYPE "public"."campaign_type" AS ENUM('instagram', 'youtube', 'tiktok', 'blog');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TYPE "public"."influencer_category" AS ENUM('fashion', 'beauty', 'food', 'travel', 'tech', 'game', 'entertainment', 'lifestyle', 'parenting', 'pets', 'other');--> statement-breakpoint
CREATE TYPE "public"."sns_type" AS ENUM('INSTAGRAM', 'YOUTUBE', 'TIKTOK', 'BLOG');--> statement-breakpoint
CREATE TYPE "public"."content_type" AS ENUM('instagram_post', 'instagram_reel', 'instagram_story', 'youtube_short', 'youtube_video', 'tiktok_video', 'blog_post');--> statement-breakpoint
CREATE TYPE "public"."proposal_application_status" AS ENUM('pending', 'accepted', 'rejected', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."proposal_status" AS ENUM('draft', 'published', 'closed', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."target_market" AS ENUM('KR', 'JP', 'BOTH');--> statement-breakpoint
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
CREATE TABLE "proposal_applications" (
	"application_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_id" uuid NOT NULL,
	"advertiser_id" uuid NOT NULL,
	"message" text NOT NULL,
	"proposal_application_status" "proposal_application_status" DEFAULT 'pending',
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
	"proposal_status" "proposal_status" DEFAULT 'draft',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "campaign_type" "campaign_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "categories" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "min_followers" integer;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "max_applications" integer;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "current_applications" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "is_urgent" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "preferred_gender" text;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "preferred_age_range" jsonb;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "location_requirements" text;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "keywords" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "influencer_profiles" ADD CONSTRAINT "influencer_profiles_profile_id_profiles_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("profile_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "influencer_stats" ADD CONSTRAINT "influencer_stats_profile_id_influencer_profiles_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."influencer_profiles"("profile_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "influencer_verifications" ADD CONSTRAINT "influencer_verifications_profile_id_influencer_profiles_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."influencer_profiles"("profile_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_applications" ADD CONSTRAINT "proposal_applications_proposal_id_influencer_proposals_proposal_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."influencer_proposals"("proposal_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_applications" ADD CONSTRAINT "proposal_applications_advertiser_id_profiles_profile_id_fk" FOREIGN KEY ("advertiser_id") REFERENCES "public"."profiles"("profile_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "influencer_proposals" ADD CONSTRAINT "influencer_proposals_influencer_id_profiles_profile_id_fk" FOREIGN KEY ("influencer_id") REFERENCES "public"."profiles"("profile_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public"."applications" ALTER COLUMN "application_status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."application_status";--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('pending', 'accepted', 'rejected', 'completed', 'cancelled');--> statement-breakpoint
ALTER TABLE "public"."applications" ALTER COLUMN "application_status" SET DATA TYPE "public"."application_status" USING "application_status"::"public"."application_status";