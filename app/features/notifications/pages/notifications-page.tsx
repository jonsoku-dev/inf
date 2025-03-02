import { useState } from "react";
import { redirect } from "react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/common/components/ui/tabs";
import { getServerClient } from "~/server";
import { getNotifications, markNotificationAsRead } from "../api";
import { NotificationList } from "../components/notification-list";
import type { Route } from "./+types/notifications-page";
import type { Notification, NotificationType, NotificationTarget } from "../types";

export const loader = async ({ request }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/auth/login");
    }

    const notifications = await getNotifications(request);

    // 사용자가 읽은 공지사항 정보 가져오기
    const { data: readNotifications } = await supabase
        .from("notification_reads")
        .select("notification_id")
        .eq("user_id", user.id);

    const readNotificationIds = new Set(readNotifications?.map(n => n.notification_id) || []);

    // 사용자 역할에 맞는 공지사항만 필터링
    const { data: userProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("profile_id", user.id)
        .single();

    const userRole = userProfile?.role;

    const filteredNotifications = notifications
        .filter(notification =>
            notification.is_published &&
            (notification.target_audience === "ALL" ||
                (userRole === "ADVERTISER" && notification.target_audience === "ADVERTISERS") ||
                (userRole === "INFLUENCER" && notification.target_audience === "INFLUENCERS"))
        )
        .map(notification => ({
            ...notification,
            notification_type: notification.notification_type as NotificationType,
            target_audience: notification.target_audience as NotificationTarget,
            is_important: notification.is_important ?? false,
            is_published: notification.is_published ?? false,
            publish_date: new Date(notification.publish_date),
            expiry_date: notification.expiry_date ? new Date(notification.expiry_date) : undefined,
            is_read: readNotificationIds.has(notification.notification_id)
        }));

    return {
        notifications: filteredNotifications,
        userId: user.id
    };
};

export const action = async ({ request }: Route.ActionArgs) => {
    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "mark-as-read") {
        const notificationId = formData.get("notificationId") as string;
        const userId = formData.get("userId") as string;

        if (notificationId && userId) {
            await markNotificationAsRead(request, notificationId, userId);
        }
    }

    return null;
};

export function meta({ data }: Route.MetaArgs) {
    return [
        { title: "공지사항 - 인플루언서 마케팅 플랫폼" },
        { name: "description", content: "공지사항 및 알림을 확인하세요." },
    ];
}

export default function NotificationsPage({ loaderData }: Route.ComponentProps) {
    const [activeTab, setActiveTab] = useState("all");
    const { notifications, userId } = loaderData;

    const filteredNotifications: Notification[] = notifications.filter(notification => {
        if (activeTab === "all") return true;
        if (activeTab === "important") return notification.is_important;
        if (activeTab === "unread") return !notification.is_read;
        return true;
    });

    return (
        <div className="container py-8">
            <h1 className="text-2xl font-bold mb-6">공지사항</h1>

            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                    <TabsTrigger value="all">전체</TabsTrigger>
                    <TabsTrigger value="important">중요</TabsTrigger>
                    <TabsTrigger value="unread">읽지 않음</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab}>
                    <NotificationList notifications={filteredNotifications} />
                </TabsContent>
            </Tabs>
        </div>
    );
} 