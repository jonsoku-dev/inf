import { pgTable, uuid, text, jsonb, timestamp, integer, pgEnum, decimal, boolean } from "drizzle-orm/pg-core";
import { profiles } from "~/features/users/schema";
import { GENDER, SNS_TYPE, INFLUENCER_CATEGORY } from "./constants";

export const genderEnum = pgEnum("gender", [
    GENDER.MALE,
    GENDER.FEMALE,
    GENDER.OTHER,
]);

export const snsTypeEnum = pgEnum("sns_type", [
    SNS_TYPE.INSTAGRAM,
    SNS_TYPE.YOUTUBE,
    SNS_TYPE.TIKTOK,
    SNS_TYPE.BLOG,
]);

export const influencerCategoryEnum = pgEnum("influencer_category", [
    INFLUENCER_CATEGORY.FASHION,
    INFLUENCER_CATEGORY.BEAUTY,
    INFLUENCER_CATEGORY.FOOD,
    INFLUENCER_CATEGORY.TRAVEL,
    INFLUENCER_CATEGORY.TECH,
    INFLUENCER_CATEGORY.GAME,
    INFLUENCER_CATEGORY.ENTERTAINMENT,
    INFLUENCER_CATEGORY.LIFESTYLE,
    INFLUENCER_CATEGORY.PARENTING,
    INFLUENCER_CATEGORY.PETS,
    INFLUENCER_CATEGORY.OTHER,
]);

export const influencerProfiles = pgTable("influencer_profiles", {
    profile_id: uuid("profile_id")
        .primaryKey()
        .references(() => profiles.profile_id),
    categories: influencerCategoryEnum("categories").array().notNull(),
    instagram_handle: text("instagram_handle"),
    youtube_handle: text("youtube_handle"),
    tiktok_handle: text("tiktok_handle"),
    blog_url: text("blog_url"),
    followers_count: jsonb("followers_count")
        .notNull()
        .$type<Partial<Record<keyof typeof SNS_TYPE, number>>>(),
    gender: genderEnum("gender"),
    birth_year: integer("birth_year"),
    location: text("location"),
    introduction: text("introduction"),
    portfolio_urls: text("portfolio_urls").array(),
    is_public: boolean("is_public").default(true).notNull(),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow(),
});

// 인플루언서 프로필 검증 이력
export const influencerVerifications = pgTable("influencer_verifications", {
    verification_id: uuid("verification_id").primaryKey().defaultRandom(),
    profile_id: uuid("profile_id")
        .notNull()
        .references(() => influencerProfiles.profile_id),
    platform: snsTypeEnum("platform").notNull(),
    verified_at: timestamp("verified_at").notNull().defaultNow(),
    followers_count: integer("followers_count").notNull(),
    engagement_rate: decimal("engagement_rate", { precision: 5, scale: 2 }),
    is_valid: boolean("is_valid").notNull().default(true),
    next_verification_due: timestamp("next_verification_due").notNull(),
});

// 인플루언서 통계
export const influencerStats = pgTable("influencer_stats", {
    stat_id: uuid("stat_id").primaryKey().defaultRandom(),
    profile_id: uuid("profile_id")
        .notNull()
        .references(() => influencerProfiles.profile_id),
    platform: snsTypeEnum("platform").notNull(),
    recorded_at: timestamp("recorded_at").notNull().defaultNow(),
    followers_count: integer("followers_count").notNull(),
    engagement_rate: decimal("engagement_rate", { precision: 5, scale: 2 }),
    avg_likes: integer("avg_likes"),
    avg_comments: integer("avg_comments"),
    avg_views: integer("avg_views"),
});