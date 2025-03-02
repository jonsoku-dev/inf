import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useSupabase } from "~/common/hooks/use-supabase";
import type { Alert } from "../types";

export function useAlerts(profileId?: string) {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { supabase } = useSupabase();
    const navigate = useNavigate();

    // 알림 데이터 로드
    useEffect(() => {
        if (!profileId) return;

        const fetchAlerts = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from("alerts")
                    .select("*")
                    .eq("recipient_id", profileId)
                    .order("created_at", { ascending: false });

                if (error) throw new Error(error.message);

                setAlerts(data as Alert[]);

                // 읽지 않은 알림 수 계산
                const unread = data.filter(alert => alert.alert_status === "UNREAD").length;
                setUnreadCount(unread);
            } catch (err) {
                setError(err instanceof Error ? err.message : "알림을 불러오는 중 오류가 발생했습니다");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAlerts();

        // 실시간 알림 구독
        const channel = supabase
            .channel(`alerts:${profileId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "alerts",
                    filter: `recipient_id=eq.${profileId}`,
                },
                (payload) => {
                    const newAlert = payload.new as Alert;
                    setAlerts(prev => [newAlert, ...prev]);
                    setUnreadCount(prev => prev + 1);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [profileId, supabase]);

    // 알림을 읽음으로 표시
    const markAsRead = async (alertId: string) => {
        try {
            const { error } = await supabase
                .from("alerts")
                .update({
                    alert_status: "READ",
                    read_at: new Date().toISOString()
                })
                .eq("alert_id", alertId);

            if (error) throw new Error(error.message);

            // 로컬 상태 업데이트
            setAlerts(prev =>
                prev.map(alert =>
                    alert.alert_id === alertId
                        ? { ...alert, alert_status: "READ", read_at: new Date().toISOString() }
                        : alert
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            setError(err instanceof Error ? err.message : "알림 상태를 업데이트하는 중 오류가 발생했습니다");
        }
    };

    // 모든 알림을 읽음으로 표시
    const markAllAsRead = async () => {
        if (!profileId) return;

        try {
            const { error } = await supabase
                .from("alerts")
                .update({
                    alert_status: "READ",
                    read_at: new Date().toISOString()
                })
                .eq("recipient_id", profileId)
                .eq("alert_status", "UNREAD");

            if (error) throw new Error(error.message);

            // 로컬 상태 업데이트
            setAlerts(prev =>
                prev.map(alert =>
                    alert.alert_status === "UNREAD"
                        ? { ...alert, alert_status: "READ", read_at: new Date().toISOString() }
                        : alert
                )
            );
            setUnreadCount(0);
        } catch (err) {
            setError(err instanceof Error ? err.message : "알림 상태를 업데이트하는 중 오류가 발생했습니다");
        }
    };

    // 알림을 보관함으로 이동
    const archiveAlert = async (alertId: string) => {
        try {
            const { error } = await supabase
                .from("alerts")
                .update({ alert_status: "ARCHIVED" })
                .eq("alert_id", alertId);

            if (error) throw new Error(error.message);

            // 로컬 상태 업데이트
            setAlerts(prev =>
                prev.map(alert =>
                    alert.alert_id === alertId
                        ? { ...alert, alert_status: "ARCHIVED" }
                        : alert
                )
            );

            // 읽지 않은 알림이었다면 카운트 감소
            const alertToArchive = alerts.find(a => a.alert_id === alertId);
            if (alertToArchive && alertToArchive.alert_status === "UNREAD") {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "알림을 보관하는 중 오류가 발생했습니다");
        }
    };

    // 알림 링크로 이동
    const navigateToAlert = (alert: Alert) => {
        if (alert.alert_status === "UNREAD") {
            markAsRead(alert.alert_id);
        }

        if (alert.link) {
            navigate(alert.link);
        }
    };

    return {
        alerts,
        unreadCount,
        isLoading,
        error,
        markAsRead,
        markAllAsRead,
        archiveAlert,
        navigateToAlert
    };
} 