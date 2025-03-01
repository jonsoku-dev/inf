CREATE TYPE "public"."advertiser_proposal_status" AS ENUM('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "advertiser_proposals" (
	"proposal_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"advertiser_id" uuid NOT NULL,
	"influencer_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"budget" integer NOT NULL,
	"target_market" "target_market" NOT NULL,
	"content_type" "content_type" NOT NULL,
	"requirements" text[] NOT NULL,
	"campaign_start_date" timestamp NOT NULL,
	"campaign_end_date" timestamp NOT NULL,
	"categories" text[] NOT NULL,
	"keywords" text[],
	"reference_urls" text[],
	"is_negotiable" boolean DEFAULT true,
	"proposal_status" "advertiser_proposal_status" DEFAULT 'DRAFT',
	"message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "advertiser_proposals" ADD CONSTRAINT "advertiser_proposals_advertiser_id_profiles_profile_id_fk" FOREIGN KEY ("advertiser_id") REFERENCES "public"."profiles"("profile_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advertiser_proposals" ADD CONSTRAINT "advertiser_proposals_influencer_id_profiles_profile_id_fk" FOREIGN KEY ("influencer_id") REFERENCES "public"."profiles"("profile_id") ON DELETE no action ON UPDATE no action;