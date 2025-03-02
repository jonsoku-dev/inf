import type { Database } from "database-generated.types";

// 기본 타입 정의
export type NotificationBase = Database["public"]["Tables"]["notifications"]["Row"];
export type NotificationRead = Database["public"]["Tables"]["notification_reads"]["Row"];

// 데이터베이스 Enum 타입
export type NotificationType = Database["public"]["Enums"]["notification_type"];
export type NotificationTarget = Database["public"]["Enums"]["notification_target"];

// 확장된 Notification 타입 (프론트엔드에서 사용)
export interface Notification extends Omit<NotificationBase, 'notification_type' | 'target_audience' | 'expiry_date' | 'publish_date'> {
    notification_type: NotificationType;
    target_audience: NotificationTarget;
    publish_date: Date;
    expiry_date?: Date | null;
    admin_name?: string;
    is_read?: boolean;
}
