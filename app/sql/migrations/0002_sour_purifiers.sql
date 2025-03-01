CREATE TABLE "advertiser_proposal_responses" (
	"response_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_id" uuid NOT NULL,
	"influencer_id" uuid NOT NULL,
	"message" text NOT NULL,
	"response_status" "proposal_application_status" DEFAULT 'PENDING',
	"responded_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "advertiser_proposal_responses" ADD CONSTRAINT "advertiser_proposal_responses_proposal_id_advertiser_proposals_proposal_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."advertiser_proposals"("proposal_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advertiser_proposal_responses" ADD CONSTRAINT "advertiser_proposal_responses_influencer_id_profiles_profile_id_fk" FOREIGN KEY ("influencer_id") REFERENCES "public"."profiles"("profile_id") ON DELETE no action ON UPDATE no action;