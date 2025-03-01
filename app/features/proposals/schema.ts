import {
    pgTable,
    text,
    timestamp,
    uuid,
    integer,
    boolean,
    pgEnum,
} from "drizzle-orm/pg-core";
import { profiles } from "~/features/users/schema";
import {
    PROPOSAL_STATUS,
    TARGET_MARKET,
    CONTENT_TYPE,
    PROPOSAL_APPLICATION_STATUS,
    ADVERTISER_PROPOSAL_STATUS,
} from "./constants";

export const proposalStatusEnum = pgEnum("proposal_status", [
    PROPOSAL_STATUS.DRAFT,
    PROPOSAL_STATUS.PUBLISHED,
    PROPOSAL_STATUS.CLOSED,
    PROPOSAL_STATUS.REJECTED,
]);

export const targetMarketEnum = pgEnum("target_market", [
    TARGET_MARKET.KR,
    TARGET_MARKET.JP,
    TARGET_MARKET.BOTH,
]);

export const contentTypeEnum = pgEnum("content_type", [
    CONTENT_TYPE.INSTAGRAM_POST,
    CONTENT_TYPE.INSTAGRAM_REEL,
    CONTENT_TYPE.INSTAGRAM_STORY,
    CONTENT_TYPE.YOUTUBE_SHORT,
    CONTENT_TYPE.YOUTUBE_VIDEO,
    CONTENT_TYPE.TIKTOK_VIDEO,
    CONTENT_TYPE.BLOG_POST,
]);

export const proposalApplicationStatusEnum = pgEnum("proposal_application_status", [
    PROPOSAL_APPLICATION_STATUS.PENDING,
    PROPOSAL_APPLICATION_STATUS.ACCEPTED,
    PROPOSAL_APPLICATION_STATUS.REJECTED,
    PROPOSAL_APPLICATION_STATUS.COMPLETED,
    PROPOSAL_APPLICATION_STATUS.CANCELLED,
]);

export const advertiserProposalStatusEnum = pgEnum("advertiser_proposal_status", [
    ADVERTISER_PROPOSAL_STATUS.DRAFT,
    ADVERTISER_PROPOSAL_STATUS.SENT,
    ADVERTISER_PROPOSAL_STATUS.ACCEPTED,
    ADVERTISER_PROPOSAL_STATUS.REJECTED,
    ADVERTISER_PROPOSAL_STATUS.COMPLETED,
    ADVERTISER_PROPOSAL_STATUS.CANCELLED,
]);

export const influencerProposals = pgTable("influencer_proposals", {
    proposal_id: uuid("proposal_id").primaryKey().defaultRandom(),
    influencer_id: uuid("influencer_id")
        .notNull()
        .references(() => profiles.profile_id),
    title: text("title").notNull(),
    description: text("description").notNull(),
    desired_budget: integer("desired_budget").notNull(),
    target_market: targetMarketEnum("target_market").notNull(),
    content_type: contentTypeEnum("content_type").notNull(),
    expected_deliverables: text("expected_deliverables").array().notNull(),
    available_period_start: timestamp("available_period_start").notNull(),
    available_period_end: timestamp("available_period_end").notNull(),
    categories: text("categories").array().notNull(),
    keywords: text("keywords").array().notNull(),
    portfolio_samples: text("portfolio_samples").array(),
    is_negotiable: boolean("is_negotiable").default(true),
    preferred_industry: text("preferred_industry").array(),
    proposal_status: proposalStatusEnum("proposal_status").default(PROPOSAL_STATUS.DRAFT),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const proposalApplications = pgTable("proposal_applications", {
    application_id: uuid("application_id").primaryKey().defaultRandom(),
    proposal_id: uuid("proposal_id")
        .notNull()
        .references(() => influencerProposals.proposal_id),
    advertiser_id: uuid("advertiser_id")
        .notNull()
        .references(() => profiles.profile_id),
    message: text("message").notNull(),
    proposal_application_status: proposalApplicationStatusEnum("proposal_application_status").default(PROPOSAL_APPLICATION_STATUS.PENDING),
    applied_at: timestamp("applied_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const advertiserProposals = pgTable("advertiser_proposals", {
    proposal_id: uuid("proposal_id").primaryKey().defaultRandom(),
    advertiser_id: uuid("advertiser_id")
        .notNull()
        .references(() => profiles.profile_id),
    influencer_id: uuid("influencer_id")
        .notNull()
        .references(() => profiles.profile_id),
    title: text("title").notNull(),
    description: text("description").notNull(),
    budget: integer("budget").notNull(),
    target_market: targetMarketEnum("target_market").notNull(),
    content_type: contentTypeEnum("content_type").notNull(),
    requirements: text("requirements").array().notNull(),
    campaign_start_date: timestamp("campaign_start_date").notNull(),
    campaign_end_date: timestamp("campaign_end_date").notNull(),
    categories: text("categories").array().notNull(),
    keywords: text("keywords").array(),
    reference_urls: text("reference_urls").array(),
    is_negotiable: boolean("is_negotiable").default(true),
    proposal_status: advertiserProposalStatusEnum("proposal_status").default(ADVERTISER_PROPOSAL_STATUS.DRAFT),
    message: text("message"),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const advertiserProposalResponses = pgTable("advertiser_proposal_responses", {
    response_id: uuid("response_id").primaryKey().defaultRandom(),
    proposal_id: uuid("proposal_id")
        .notNull()
        .references(() => advertiserProposals.proposal_id),
    influencer_id: uuid("influencer_id")
        .notNull()
        .references(() => profiles.profile_id),
    message: text("message").notNull(),
    response_status: proposalApplicationStatusEnum("response_status").default(PROPOSAL_APPLICATION_STATUS.PENDING),
    responded_at: timestamp("responded_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow(),
}); 