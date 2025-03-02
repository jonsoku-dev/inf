import {
    pgTable,
    text,
    timestamp,
    uuid,
    boolean,
    pgEnum,
} from "drizzle-orm/pg-core";
import { profiles } from "~/features/users/schema";
import { ALERT_TYPE, ALERT_STATUS } from "./constants";

export const alertTypeEnum = pgEnum("alert_type", [
    ALERT_TYPE.CAMPAIGN_CREATED,
    ALERT_TYPE.CAMPAIGN_UPDATED,
    ALERT_TYPE.APPLICATION_RECEIVED,
    ALERT_TYPE.APPLICATION_ACCEPTED,
    ALERT_TYPE.APPLICATION_REJECTED,
    ALERT_TYPE.PROPOSAL_RECEIVED,
    ALERT_TYPE.PROPOSAL_ACCEPTED,
    ALERT_TYPE.PROPOSAL_REJECTED,
    ALERT_TYPE.SYSTEM_NOTIFICATION,
]);

export const alertStatusEnum = pgEnum("alert_status", [
    ALERT_STATUS.UNREAD,
    ALERT_STATUS.READ,
    ALERT_STATUS.ARCHIVED,
]);

export const alerts = pgTable("alerts", {
    alert_id: uuid("alert_id").primaryKey().defaultRandom(),
    recipient_id: uuid("recipient_id")
        .notNull()
        .references(() => profiles.profile_id),
    sender_id: uuid("sender_id")
        .references(() => profiles.profile_id),
    alert_type: alertTypeEnum("alert_type").notNull(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    link: text("link"),
    metadata: text("metadata"),
    alert_status: alertStatusEnum("alert_status").default(ALERT_STATUS.UNREAD).notNull(),
    is_important: boolean("is_important").default(false),
    created_at: timestamp("created_at").notNull().defaultNow(),
    read_at: timestamp("read_at"),
});

// 알림 설정
export const alertSettings = pgTable("alert_settings", {
    setting_id: uuid("setting_id").primaryKey().defaultRandom(),
    profile_id: uuid("profile_id")
        .notNull()
        .references(() => profiles.profile_id),
    email_notifications: boolean("email_notifications").default(true),
    push_notifications: boolean("push_notifications").default(true),
    line_notifications: boolean("line_notifications").default(true),
    campaign_alerts: boolean("campaign_alerts").default(true),
    application_alerts: boolean("application_alerts").default(true),
    proposal_alerts: boolean("proposal_alerts").default(true),
    system_alerts: boolean("system_alerts").default(true),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow(),
}); 