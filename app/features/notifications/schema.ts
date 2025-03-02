import {
    pgTable,
    text,
    timestamp,
    uuid,
    boolean,
    pgEnum,
} from "drizzle-orm/pg-core";
import { profiles } from "~/features/users/schema";
import { NOTIFICATION_TYPE, NOTIFICATION_TARGET } from "./constants";
import { z } from "zod";

export const notificationTypeEnum = pgEnum("notification_type", [
    NOTIFICATION_TYPE.ANNOUNCEMENT,
    NOTIFICATION_TYPE.SYSTEM,
    NOTIFICATION_TYPE.CAMPAIGN,
    NOTIFICATION_TYPE.PROPOSAL,
]);

export const notificationTargetEnum = pgEnum("notification_target", [
    NOTIFICATION_TARGET.ALL,
    NOTIFICATION_TARGET.ADVERTISERS,
    NOTIFICATION_TARGET.INFLUENCERS,
]);

export const notifications = pgTable("notifications", {
    notification_id: uuid("notification_id").primaryKey().defaultRandom(),
    admin_id: uuid("admin_id")
        .notNull()
        .references(() => profiles.profile_id),
    title: text("title").notNull(),
    content: text("content").notNull(),
    notification_type: notificationTypeEnum("notification_type").notNull(),
    target_audience: notificationTargetEnum("target_audience").notNull(),
    is_important: boolean("is_important").default(false),
    is_published: boolean("is_published").default(false),
    publish_date: timestamp("publish_date").notNull(),
    expiry_date: timestamp("expiry_date"),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const notificationReads = pgTable("notification_reads", {
    read_id: uuid("read_id").primaryKey().defaultRandom(),
    notification_id: uuid("notification_id")
        .notNull()
        .references(() => notifications.notification_id, { onDelete: "cascade" }),
    user_id: uuid("user_id")
        .notNull()
        .references(() => profiles.profile_id, { onDelete: "cascade" }),
    read_at: timestamp("read_at").notNull().defaultNow(),
});

export const notificationSchema = z.object({
    title: z.string().min(1, "제목을 입력해주세요"),
    content: z.string().min(1, "내용을 입력해주세요"),
    notification_type: z.enum(Object.keys(NOTIFICATION_TYPE) as [string, ...string[]]),
    target_audience: z.enum(Object.keys(NOTIFICATION_TARGET) as [string, ...string[]]),
    is_important: z.boolean().default(false),
    is_published: z.boolean().default(false),
    publish_date: z.string().min(1, "게시일을 선택해주세요"),
    expiry_date: z.string().optional(),
});

export type NotificationFormData = z.infer<typeof notificationSchema>; 