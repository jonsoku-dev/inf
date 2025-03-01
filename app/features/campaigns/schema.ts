import {
    boolean,
    decimal,
    integer,
    jsonb,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";
import { APPLICATION_STATUS, CAMPAIGN_STATUS, CAMPAIGN_TYPE } from "./constants";
import { profiles } from "~/features/users/schema";


export const campaignStatusEnum = pgEnum("campaign_status", [
    CAMPAIGN_STATUS.DRAFT,
    CAMPAIGN_STATUS.PUBLISHED,
    CAMPAIGN_STATUS.CLOSED,
    CAMPAIGN_STATUS.CANCELLED,
    CAMPAIGN_STATUS.COMPLETED,
]);

export const campaignTypeEnum = pgEnum("campaign_type", [
    CAMPAIGN_TYPE.INSTAGRAM,
    CAMPAIGN_TYPE.YOUTUBE,
    CAMPAIGN_TYPE.TIKTOK,
    CAMPAIGN_TYPE.BLOG,
]);

export const campaigns = pgTable("campaigns", {
    campaign_id: uuid("campaign_id").primaryKey().defaultRandom(),
    advertiser_id: uuid("advertiser_id")
        .notNull()
        .references(() => profiles.profile_id),
    title: text("title").notNull(),
    description: text("description").notNull(),
    budget: integer("budget").notNull(),
    campaign_type: campaignTypeEnum("campaign_type").notNull(),
    requirements: text("requirements").array(),
    start_date: timestamp("start_date").notNull(),
    end_date: timestamp("end_date").notNull(),
    campaign_status: campaignStatusEnum("campaign_status")
        .default(CAMPAIGN_STATUS.DRAFT)
        .notNull(),
    is_negotiable: boolean("is_negotiable").default(true),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow(),
    target_market: text("target_market").notNull(), // KR, JP, BOTH
    categories: jsonb("categories").notNull().$type<string[]>(),
    min_followers: integer("min_followers"),
    max_applications: integer("max_applications"),
    current_applications: integer("current_applications").default(0),
    is_urgent: boolean("is_urgent").default(false),
    preferred_gender: text("preferred_gender"),
    preferred_age_range: jsonb("preferred_age_range").$type<[number, number]>(),
    location_requirements: text("location_requirements"),
    keywords: jsonb("keywords").notNull().$type<string[]>(),
});

// 캠페인 신청
export const applicationStatusEnum = pgEnum("application_status", [
    APPLICATION_STATUS.PENDING,
    APPLICATION_STATUS.ACCEPTED,
    APPLICATION_STATUS.REJECTED,
    APPLICATION_STATUS.COMPLETED,
    APPLICATION_STATUS.CANCELLED,
]);

export const applications = pgTable("applications", {
    application_id: uuid("application_id").primaryKey().defaultRandom(),
    campaign_id: uuid("campaign_id")
        .notNull()
        .references(() => campaigns.campaign_id),
    influencer_id: uuid("influencer_id")
        .notNull()
        .references(() => profiles.profile_id),
    application_status: applicationStatusEnum()
        .notNull()
        .default(APPLICATION_STATUS.PENDING),
    message: text("message").notNull(),
    applied_at: timestamp("applied_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow(),
}); 