import {
    pgTable,
    text,
    timestamp,
    uuid,
    pgEnum,
} from "drizzle-orm/pg-core";
import { profiles } from "~/features/users/schema";
import { campaigns } from "~/features/campaigns/schema";
import { APPLICATION_STATUS } from "./constants";

export const applicationStatusEnum = pgEnum("application_status", [
    APPLICATION_STATUS.APPROVED,
    APPLICATION_STATUS.REJECTED,
    APPLICATION_STATUS.COMPLETED,
    APPLICATION_STATUS.PENDING
]);

export const applications = pgTable("applications", {
    application_id: uuid("application_id").primaryKey().defaultRandom(),
    campaign_id: uuid("campaign_id")
        .notNull()
        .references(() => campaigns.campaign_id),
    influencer_id: uuid("influencer_id")
        .notNull()
        .references(() => profiles.profile_id),
    status: applicationStatusEnum("application_status").default(APPLICATION_STATUS.PENDING),
    message: text("message").notNull(),
    applied_at: timestamp("applied_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow(),
}); 