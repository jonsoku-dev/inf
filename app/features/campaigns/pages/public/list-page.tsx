import { getServerClient } from "~/server";
import { PublicCampaignCard } from "../../components/public-campaign-card";
import { CAMPAIGN_STATUS } from "../../constants";
import type { Route } from "./+types/list-page";
import { data } from "react-router";
import type { Campaign } from "../../types";

export const loader = async ({ request }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);

    try {
        const { data: campaigns, error } = await supabase
            .from("campaigns")
            .select(`
                *,
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

        return {
            campaigns: campaigns as Campaign[],
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
    const { campaigns, error } = loaderData;

    if (error) {
        return (
            <div className="text-center text-red-500 py-8">
                {error}
            </div>
        );
    }

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