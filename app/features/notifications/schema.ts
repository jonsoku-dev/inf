import {
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";
import { profiles } from "~/features/users/schema";
import { campaigns } from "~/features/campaigns/schema";

export const notifications = pgTable("notifications", {
    notification_id: uuid("notification_id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
        .notNull()
        .references(() => profiles.profile_id),
    campaign_id: uuid("campaign_id")
        .references(() => campaigns.campaign_id),
    message: text("message").notNull(),
    sent_at: timestamp("sent_at").notNull().defaultNow(),
    read_at: timestamp("read_at"),
}); 