import {
    pgTable,
    text,
    timestamp,
    uuid,
    decimal,
    pgEnum,
} from "drizzle-orm/pg-core";
import { CAMPAIGN_STATUS } from "~/features/campaigns/constants";
import { profiles } from "~/features/users/schema";


export const campaignStatusEnum = pgEnum("campaign_status", [
    CAMPAIGN_STATUS.DRAFT,
    CAMPAIGN_STATUS.PUBLISHED,
    CAMPAIGN_STATUS.CLOSED,
    CAMPAIGN_STATUS.CANCELLED,
    CAMPAIGN_STATUS.COMPLETED,
]);

export const campaigns = pgTable("campaigns", {
    campaign_id: uuid("campaign_id").primaryKey().defaultRandom(),
    advertiser_id: uuid("advertiser_id")
        .notNull()
        .references(() => profiles.profile_id),
    title: text("title").notNull(),
    description: text("description").notNull(),
    budget: decimal("budget", { precision: 10, scale: 2 }).notNull(),
    status: campaignStatusEnum("campaign_status").default(CAMPAIGN_STATUS.DRAFT),
    target_market: text("target_market").notNull(), // KR, JP, BOTH
    requirements: text("requirements").notNull(),
    period_start: text("period_start").notNull(),
    period_end: text("period_end").notNull(),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow(),
}); 