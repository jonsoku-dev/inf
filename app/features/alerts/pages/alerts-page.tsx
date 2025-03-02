/**
 * @description 사용자 알림 목록 페이지
 * @route /my/alerts
 */

import { redirect } from "react-router";
import { PageHeader } from "~/common/components/page-header";
import { getServerClient } from "~/server";
import { AlertList } from "../components/alert-list";
import { ALERT_STATUS } from "../constants";
import type { Route } from "./+types/alerts-page";

export const loader = async ({ request }: Route.LoaderArgs) => {
    const { supabase, headers } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/auth/login", { headers });
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("profile_id", user.id)
        .single();

    if (!profile) {
        return redirect("/onboarding", { headers });
    }

    const { data: userAlerts } = await supabase
        .from("alerts")
        .select("*")
        .eq("recipient_id", profile.profile_id)
        .order("created_at", { ascending: false });

    return {
        alerts: userAlerts || [],
        profile,
    };
};

export const action = async ({ request }: Route.ActionArgs) => {
    const { supabase, headers } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/auth/login", { headers });
    }

    const formData = await request.formData();
    const intent = formData.get("intent") as string;

    if (intent === "mark-read") {
        const alertId = formData.get("alertId") as string;

        await supabase
            .from("alerts")
            .update({
                alert_status: ALERT_STATUS.READ,
                read_at: new Date().toISOString()
            })
            .eq("alert_id", alertId);
    }
    else if (intent === "mark-all-read") {
        const { data: profile } = await supabase
            .from("profiles")
            .select("profile_id")
            .eq("user_id", user.id)
            .single();

        if (profile) {
            await supabase
                .from("alerts")
                .update({
                    alert_status: ALERT_STATUS.READ,
                    read_at: new Date().toISOString()
                })
                .eq("recipient_id", profile.profile_id)
                .eq("alert_status", ALERT_STATUS.UNREAD);
        }
    }
    else if (intent === "archive") {
        const alertId = formData.get("alertId") as string;

        await supabase
            .from("alerts")
            .update({ alert_status: ALERT_STATUS.ARCHIVED })
            .eq("alert_id", alertId);
    }

    return {};
};

export const meta: Route.MetaFunction = () => {
    return [
        { title: "알림 | Inf" },
        { name: "description", content: "알림 목록을 확인하세요" },
    ];
};

export default function AlertsPage({ loaderData, actionData }: Route.ComponentProps) {
    const { alerts: userAlerts } = loaderData;

    return (
        <div className="container py-6 space-y-6">
            <PageHeader
                title="알림"
                description="중요한 알림과 업데이트를 확인하세요"
            />

            <AlertList alerts={userAlerts} />
        </div>
    );
} 