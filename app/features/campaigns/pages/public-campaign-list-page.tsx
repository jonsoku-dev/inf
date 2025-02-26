import { getServerClient } from "~/server";
import { PublicCampaignCard } from "../components/public-campaign-card";
import { CAMPAIGN_STATUS } from "../constants";
import type { Route } from "./+types/public-campaign-list-page";

export const loader = async ({ request }: Route.LoaderArgs) => {
    const supabase = getServerClient(request)
    // 현재 로그인한 사용자 정보 가져오기
    const { data: { session } } = await supabase.auth.getSession();

    // 사용자 역할 조회 (로그인한 경우)
    let userRole = null;
    let userId = null;

    if (session) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("profile_id", session.user.id)
            .single();

        userRole = profile?.role;
        userId = session.user.id;
    }

    // 공개된 캠페인 조회
    const { data: campaigns, error } = await supabase
        .from("campaigns")
        .select(`
            *,
            advertiser:profiles!advertiser_id (
                name,
                username,
                role
            )
        `)
        .eq("campaign_status", CAMPAIGN_STATUS.PUBLISHED)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("캠페인 조회 중 오류가 발생했습니다:", error);
        throw new Error("캠페인 조회 중 오류가 발생했습니다");
    }

    return {
        campaigns,
        currentUserRole: userRole,
        currentUserId: userId,
    };
};

export const meta: Route.MetaFunction = () => {
    return [
        { title: "캠페인 목록 | Inf" },
        { name: "description", content: "진행중인 캠페인을 확인하세요" },
    ];
};

export default function PublicCampaignListPage({ loaderData }: Route.ComponentProps) {
    const { campaigns, currentUserRole, currentUserId } = loaderData;

    return (
        <div className="container py-10 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">캠페인 목록</h1>
                <p className="text-muted-foreground text-sm">진행중인 캠페인을 확인하세요</p>
            </div>
            {campaigns.length === 0 ? (
                <div className="text-center text-muted-foreground py-10">
                    현재 진행중인 캠페인이 없습니다
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {campaigns.map((campaign) => (
                        <PublicCampaignCard
                            key={campaign.campaign_id}
                            {...campaign}
                            advertiser={campaign.advertiser}
                            currentUserRole={currentUserRole}
                            currentUserId={currentUserId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
} 