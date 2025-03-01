ALTER TABLE "campaigns" ALTER COLUMN "campaign_status" SET DEFAULT 'DRAFT';--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "campaign_type" SET DEFAULT 'INSTAGRAM';--> statement-breakpoint
ALTER TABLE "proposal_applications" ALTER COLUMN "proposal_application_status" SET DEFAULT 'PENDING';--> statement-breakpoint
ALTER TABLE "influencer_proposals" ALTER COLUMN "proposal_status" SET DEFAULT 'DRAFT';--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "role" SET DEFAULT 'ADVERTISER';--> statement-breakpoint
ALTER TABLE "public"."campaigns" ALTER COLUMN "campaign_status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."campaign_status";--> statement-breakpoint
CREATE TYPE "public"."campaign_status" AS ENUM('DRAFT', 'PUBLISHED', 'CLOSED', 'CANCELLED', 'COMPLETED');--> statement-breakpoint
ALTER TABLE "public"."campaigns" ALTER COLUMN "campaign_status" SET DATA TYPE "public"."campaign_status" USING "campaign_status"::"public"."campaign_status";--> statement-breakpoint
ALTER TABLE "public"."campaigns" ALTER COLUMN "campaign_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."campaign_type";--> statement-breakpoint
CREATE TYPE "public"."campaign_type" AS ENUM('INSTAGRAM', 'YOUTUBE', 'TIKTOK', 'BLOG');--> statement-breakpoint
ALTER TABLE "public"."campaigns" ALTER COLUMN "campaign_type" SET DATA TYPE "public"."campaign_type" USING "campaign_type"::"public"."campaign_type";--> statement-breakpoint
ALTER TABLE "public"."influencer_proposals" ALTER COLUMN "content_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."content_type";--> statement-breakpoint
CREATE TYPE "public"."content_type" AS ENUM('INSTAGRAM_POST', 'INSTAGRAM_REEL', 'INSTAGRAM_STORY', 'YOUTUBE_SHORT', 'YOUTUBE_VIDEO', 'TIKTOK_VIDEO', 'BLOG_POST');--> statement-breakpoint
ALTER TABLE "public"."influencer_proposals" ALTER COLUMN "content_type" SET DATA TYPE "public"."content_type" USING "content_type"::"public"."content_type";--> statement-breakpoint
ALTER TABLE "public"."proposal_applications" ALTER COLUMN "proposal_application_status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."proposal_application_status";--> statement-breakpoint
CREATE TYPE "public"."proposal_application_status" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
ALTER TABLE "public"."proposal_applications" ALTER COLUMN "proposal_application_status" SET DATA TYPE "public"."proposal_application_status" USING "proposal_application_status"::"public"."proposal_application_status";--> statement-breakpoint
ALTER TABLE "public"."influencer_proposals" ALTER COLUMN "proposal_status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."proposal_status";--> statement-breakpoint
CREATE TYPE "public"."proposal_status" AS ENUM('DRAFT', 'PUBLISHED', 'CLOSED', 'REJECTED');--> statement-breakpoint
ALTER TABLE "public"."influencer_proposals" ALTER COLUMN "proposal_status" SET DATA TYPE "public"."proposal_status" USING "proposal_status"::"public"."proposal_status";--> statement-breakpoint
ALTER TABLE "public"."profiles" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."role";--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('ADVERTISER', 'INFLUENCER', 'ADMIN');--> statement-breakpoint
ALTER TABLE "public"."profiles" ALTER COLUMN "role" SET DATA TYPE "public"."role" USING "role"::"public"."role";