import { redirect } from "react-router";
import { getServerClient } from "~/server";
import { CampaignCard } from "../../components/campaign-card";
import type { Route } from "./+types/list-page";

export const loader = async ({ request }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/auth/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("profile_id", user.id)
        .single();

    if (profile?.role !== "INFLUENCER") {
        return redirect("/campaigns");
    }

    const { data: campaigns } = await supabase
        .from("campaigns")
        .select(`
            *,
            advertiser:profiles!advertiser_id (
                name,
                username
            ),
            applications!inner (
                application_id,
                application_status
            )
        `)
        .eq("applications.influencer_id", user.id)
        .order("created_at", { ascending: false });

    return {
        campaigns: campaigns || [],
        currentUserRole: profile.role,
        currentUserId: user.id,
    };
};

export const meta: Route.MetaFunction = () => {
    return [
        { title: "내 지원 현황 | Inf" },
        { name: "description", content: "지원한 캠페인 목록을 확인하세요" },
    ];
};

export default function ListPage({ loaderData }: Route.ComponentProps) {
    const { campaigns, currentUserRole, currentUserId } = loaderData;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">내 지원 현황</h1>
                <p className="text-muted-foreground text-sm">지원한 캠페인 목록을 확인하세요</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {campaigns.map((campaign) => (
                    <CampaignCard
                        key={campaign.campaign_id}
                        {...campaign}
                        currentUserRole={currentUserRole}
                        currentUserId={currentUserId}
                    />
                ))}
            </div>
            {campaigns.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                    지원한 캠페인이 없습니다
                </div>
            )}
        </div>
    );
} 