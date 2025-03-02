import { Plus } from "lucide-react";
import { useState } from "react";
import { Link, redirect } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/common/components/ui/tabs";
import { getServerClient } from "~/server";
import { getNotifications } from "../../api";
import { NotificationList } from "../../components/notification-list";
import type { Route } from "./+types/notifications-admin-page";
import type { NotificationType, NotificationTarget } from "../../types";

export const loader = async ({ request }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/auth/login");
    }

    // 관리자 권한 확인
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("profile_id", user.id)
        .single();

    if (profile?.role !== "ADMIN") {
        return redirect("/notifications");
    }

    const notifications = await getNotifications(request);

    // 관리자 정보 추가
    const adminIds = [...new Set(notifications.map(n => n.admin_id))];
    const { data: admins } = await supabase
        .from("profiles")
        .select("profile_id, name")
        .in("profile_id", adminIds);

    const adminMap = new Map(admins?.map(admin => [admin.profile_id, admin.name]) || []);

    const notificationsWithAdminName = notifications.map(notification => {
        return {
            ...notification,
            notification_type: notification.notification_type as NotificationType,
            target_audience: notification.target_audience as NotificationTarget,
            is_important: notification.is_important ?? false,
            is_published: notification.is_published ?? false,
            publish_date: new Date(notification.publish_date),
            expiry_date: notification.expiry_date ? new Date(notification.expiry_date) : undefined,
            admin_name: adminMap.get(notification.admin_id) || "알 수 없음"
        };
    });

    return {
        notifications: notificationsWithAdminName
    };
};

export function meta({ data }: Route.MetaArgs) {
    return [
        { title: "공지사항 관리 - 인플루언서 마케팅 플랫폼" },
        { name: "description", content: "공지사항을 관리하세요." },
    ];
}

export default function NotificationsAdminPage({ loaderData }: Route.ComponentProps) {
    const [activeTab, setActiveTab] = useState("all");
    const { notifications } = loaderData;

    const filteredNotifications = notifications.filter(notification => {
        if (activeTab === "all") return true;
        if (activeTab === "published") return notification.is_published;
        if (activeTab === "draft") return !notification.is_published;
        if (activeTab === "important") return notification.is_important;
        return true;
    });

    return (
        <div className="container py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">공지사항 관리</h1>
                <Button asChild>
                    <Link to="/admin/notifications/new">
                        <Plus className="mr-2 h-4 w-4" /> 새 공지사항
                    </Link>
                </Button>
            </div>

            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                    <TabsTrigger value="all">전체</TabsTrigger>
                    <TabsTrigger value="published">게시됨</TabsTrigger>
                    <TabsTrigger value="draft">임시저장</TabsTrigger>
                    <TabsTrigger value="important">중요</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab}>
                    <NotificationList notifications={filteredNotifications} />
                </TabsContent>
            </Tabs>
        </div>
    );
} 