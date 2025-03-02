/**
 * @description 알림 설정 페이지
 * @route /my/alerts/settings
 */

import { data, redirect, useNavigation } from "react-router";
import { toast } from "sonner";
import { PageHeader } from "~/common/components/page-header";
import { getServerClient } from "~/server";
import { AlertSettingsForm } from "../components/alert-settings-form";
import type { Route } from "./+types/alert-settings-page";

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

    const { data: settings } = await supabase
        .from("alert_settings")
        .select("*")
        .eq("profile_id", profile.profile_id)
        .single();

    // 설정이 없으면 기본값 생성
    if (!settings) {
        const defaultSettings = {
            profile_id: profile.profile_id,
            email_notifications: true,
            push_notifications: true,
            line_notifications: true,
            campaign_alerts: true,
            application_alerts: true,
            proposal_alerts: true,
            system_alerts: true,
        };

        const { data: newSettings } = await supabase
            .from("alert_settings")
            .insert(defaultSettings)
            .select()
            .single();

        return {
            settings: newSettings || defaultSettings,
            profile,
        };
    }

    return {
        settings,
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

    const { data: profile } = await supabase
        .from("profiles")
        .select("profile_id")
        .eq("user_id", user.id)
        .single();

    if (!profile) {
        return data({ error: "프로필을 찾을 수 없습니다." }, { status: 400 });
    }

    const settings = {
        profile_id: profile.profile_id,
        email_notifications: formData.get("email_notifications") === "on",
        push_notifications: formData.get("push_notifications") === "on",
        line_notifications: formData.get("line_notifications") === "on",
        campaign_alerts: formData.get("campaign_alerts") === "on",
        application_alerts: formData.get("application_alerts") === "on",
        proposal_alerts: formData.get("proposal_alerts") === "on",
        system_alerts: formData.get("system_alerts") === "on",
        updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
        .from("alert_settings")
        .update(settings)
        .eq("profile_id", profile.profile_id);

    if (error) {
        return data({ error: "설정을 저장하는 중 오류가 발생했습니다." }, { status: 500 });
    }

    return { success: true };
};

export const meta: Route.MetaFunction = () => {
    return [
        { title: "알림 설정 | Inf" },
        { name: "description", content: "알림 설정을 관리하세요" },
    ];
};

export default function AlertSettingsPage({ loaderData, actionData }: Route.ComponentProps) {
    const { settings } = loaderData;
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    // 성공 메시지 표시
    if (actionData?.success) {
        toast("설정이 저장되었습니다");
    }

    return (
        <div className="container py-6 space-y-6">
            <PageHeader
                title="알림 설정"
                description="알림 수신 방법과 유형을 관리하세요"
            />

            <AlertSettingsForm settings={settings} isSubmitting={isSubmitting} />
        </div>
    );
} 