import { getServerClient } from "~/server";
import { CampaignCard } from "../components/campaign-card";
import type { Route } from "./+types/campaign-list-page";

export const loader = async ({ request }: Route.LoaderArgs) => {
    const supabase = getServerClient(request)
    // 현재 로그인한 사용자 정보 가져오기
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        throw new Error("인증이 필요합니다");
    }

    // 현재 사용자의 역할 가져오기
    const { data } = await supabase.from("profiles").select("role").eq("profile_id", session.user.id).single();

    // 현재 사용자의 캠페인 조회
    const { data: campaigns, error } = await supabase
        .from("campaigns")
        .select(`
            *,
            profiles(name, username, role)
        `)
        .eq("advertiser_id", session.user.id)
        .order("created_at", { ascending: false })

    if (error) {
        throw new Error("캠페인 조회 중 오류가 발생했습니다");
    }

    return {
        campaigns,
        currentUserRole: data?.role,
        currentUserId: session.user.id,
    };
};

export const action = async ({ request }: Route.ActionArgs) => {
    const supabase = getServerClient(request)
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        return { ok: false, error: "인증이 필요합니다" };
    }

    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "update-status") {
        const campaignId = formData.get("campaignId") as string;
        const status = formData.get("status") as any;

        const { error } = await supabase
            .from("campaigns")
            .update({ campaign_status: status })
            .eq("campaign_id", campaignId)
            // 본인의 캠페인만 수정 가능
            .eq("advertiser_id", session.user.id);

        if (error) {
            return { ok: false, error: "상태 변경 중 오류가 발생했습니다" };
        }

        return { ok: true };
    }

    return { ok: false, error: "잘못된 요청입니다" };
};

export const meta: Route.MetaFunction = () => {
    return [
        { title: "캠페인 관리 | Inf" },
        { name: "description", content: "등록한 캠페인을 관리하세요" },
    ];
};

export default function CampaignListPage({ loaderData }: Route.ComponentProps) {
    const { campaigns, currentUserRole, currentUserId } = loaderData;
    console.log(currentUserRole, currentUserId);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">캠페인 관리</h1>
                <p className="text-muted-foreground text-sm">등록한 캠페인을 관리하세요</p>
            </div>
            {campaigns.length === 0 ? (
                <div className="text-center text-muted-foreground py-10">
                    등록된 캠페인이 없습니다
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {campaigns.map((campaign) => (
                        <CampaignCard
                            key={campaign.campaign_id}
                            {...campaign}
                            currentUserRole={currentUserRole ?? undefined}
                            currentUserId={currentUserId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
} 