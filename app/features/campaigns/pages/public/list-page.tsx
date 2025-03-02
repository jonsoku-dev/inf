import { getServerClient } from "~/server";
import { PublicCampaignCard } from "../../components/public-campaign-card";
import { CAMPAIGN_STATUS } from "../../constants";
import type { Route } from "./+types/list-page";
import { data } from "react-router";
import type { Campaign } from "../../types";
import { DateTime } from "luxon";

export const loader = async ({ request }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id;

    try {
        const { data: campaigns, error } = await supabase
            .from("campaigns")
            .select(`
                campaign_id,
                title,
                description,
                budget,
                campaign_type,
                target_market,
                start_date,
                end_date,
                campaign_status,
                is_negotiable,
                is_urgent,
                min_followers,
                created_at,
                updated_at,
                advertiser_id,
                categories,
                keywords,
                advertiser:profiles!advertiser_id (
                    name,
                    username
                )
            `)
            .eq("campaign_status", CAMPAIGN_STATUS.PUBLISHED)
            .order("created_at", { ascending: false });

        if (error) {
            throw error;
        }

        // 날짜 형식 변환 및 필요한 데이터만 포함
        const formattedCampaigns = campaigns.map(campaign => {
            // 날짜 형식 변환
            const startDate = campaign.start_date
                ? DateTime.fromISO(campaign.start_date).toFormat('yyyy년 MM월 dd일')
                : null;
            const endDate = campaign.end_date
                ? DateTime.fromISO(campaign.end_date).toFormat('yyyy년 MM월 dd일')
                : null;

            // 현재 사용자가 캠페인 소유자인지 확인
            const isOwner = currentUserId === campaign.advertiser_id;

            return {
                ...campaign,
                formatted_start_date: startDate,
                formatted_end_date: endDate,
                is_owner: isOwner,
                // 민감한 정보 제거
                advertiser: {
                    name: campaign.advertiser.name,
                    username: campaign.advertiser.username
                }
            };
        });

        return {
            campaigns: formattedCampaigns as Campaign[],
        };
    } catch (error) {
        console.error("Error fetching campaigns:", error);
        return data(
            {
                campaigns: [],
                error: "캠페인 조회 중 오류가 발생했습니다"
            },
            {
                status: 500
            }
        );
    }
};

export const meta: Route.MetaFunction = () => {
    return [
        { title: "캠페인 목록 | Inf" },
        { name: "description", content: "진행 중인 캠페인 목록을 확인하세요" },
    ];
};

export default function ListPage({ loaderData }: Route.ComponentProps) {
    const { campaigns } = loaderData;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">캠페인 목록</h1>
                <p className="text-muted-foreground text-sm">진행 중인 캠페인 목록을 확인하세요</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {campaigns.map((campaign) => (
                    <PublicCampaignCard
                        key={campaign.campaign_id}
                        {...campaign}
                        advertiser={campaign.advertiser}
                        isOwner={campaign.is_owner}
                    />
                ))}
            </div>
            {campaigns.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                    진행 중인 캠페인이 없습니다
                </div>
            )}
        </div>
    );
} 