import { getServerClient } from "~/server";
import { ALERT_TYPE } from "../constants";
import type { Alert } from "../types";

interface CreateAlertParams {
    recipientId: string;
    senderId?: string;
    alertType: keyof typeof ALERT_TYPE;
    title: string;
    content: string;
    link?: string;
    metadata?: Record<string, any>;
    isImportant?: boolean;
}

export class AlertService {
    /**
     * 새 알림을 생성합니다
     */
    static async createAlert(params: CreateAlertParams, request: Request) {
        const { supabase } = getServerClient(request);

        const alertData = {
            recipient_id: params.recipientId,
            sender_id: params.senderId,
            alert_type: params.alertType,
            title: params.title,
            content: params.content,
            link: params.link,
            metadata: params.metadata ? JSON.stringify(params.metadata) : null,
            is_important: params.isImportant || false,
        };

        const { data, error } = await supabase
            .from("alerts")
            .insert(alertData)
            .select()
            .single();

        if (error) {
            console.error("알림 생성 중 오류 발생:", error);
            throw new Error("알림을 생성할 수 없습니다");
        }

        return data as Alert;
    }

    /**
     * 사용자의 읽지 않은 알림 수를 가져옵니다
     */
    static async getUnreadCount(profileId: string, request: Request): Promise<number> {
        const { supabase } = getServerClient(request);

        const { count, error } = await supabase
            .from("alerts")
            .select("*", { count: "exact", head: true })
            .eq("recipient_id", profileId)
            .eq("alert_status", "UNREAD");

        if (error) {
            console.error("읽지 않은 알림 수 조회 중 오류 발생:", error);
            return 0;
        }

        return count || 0;
    }

    /**
     * 알림을 읽음 상태로 표시합니다
     */
    static async markAsRead(alertId: string, request: Request) {
        const { supabase } = getServerClient(request);

        const { error } = await supabase
            .from("alerts")
            .update({
                alert_status: "READ",
                read_at: new Date().toISOString()
            })
            .eq("alert_id", alertId);

        if (error) {
            console.error("알림 읽음 표시 중 오류 발생:", error);
            throw new Error("알림 상태를 업데이트할 수 없습니다");
        }

        return true;
    }

    /**
     * 사용자의 모든 읽지 않은 알림을 읽음 상태로 표시합니다
     */
    static async markAllAsRead(profileId: string, request: Request) {
        const { supabase } = getServerClient(request);

        const { error } = await supabase
            .from("alerts")
            .update({
                alert_status: "READ",
                read_at: new Date().toISOString()
            })
            .eq("recipient_id", profileId)
            .eq("alert_status", "UNREAD");

        if (error) {
            console.error("모든 알림 읽음 표시 중 오류 발생:", error);
            throw new Error("알림 상태를 업데이트할 수 없습니다");
        }

        return true;
    }

    /**
     * 알림을 보관 상태로 표시합니다
     */
    static async archiveAlert(alertId: string, request: Request) {
        const { supabase } = getServerClient(request);

        const { error } = await supabase
            .from("alerts")
            .update({ alert_status: "ARCHIVED" })
            .eq("alert_id", alertId);

        if (error) {
            console.error("알림 보관 중 오류 발생:", error);
            throw new Error("알림을 보관할 수 없습니다");
        }

        return true;
    }

    /**
     * 사용자의 알림 설정을 가져옵니다
     */
    static async getAlertSettings(profileId: string, request: Request) {
        const { supabase } = getServerClient(request);

        const { data, error } = await supabase
            .from("alert_settings")
            .select("*")
            .eq("profile_id", profileId)
            .single();

        if (error) {
            console.error("알림 설정 조회 중 오류 발생:", error);
            return null;
        }

        return data;
    }
} 