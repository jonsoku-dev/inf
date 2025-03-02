import { Link, redirect } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Card, CardContent } from "~/common/components/ui/card";
import { getServerClient } from "~/server";
import { CampaignDetailView } from "../../components/campaign-detail-view";
import { DateTime } from "luxon";
import type { Route } from "./+types/detail-page";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    const { data: campaign } = await supabase
        .from("campaigns")
        .select(`
            campaign_id,
            title,
            description,
            budget,
            campaign_type,
            target_market,
            requirements,
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
            preferred_gender,
            location_requirements,
            advertiser:profiles!advertiser_id (
                name,
                username
            )
        `)
        .eq("campaign_id", params.campaignId)
        .single();

    if (!campaign) {
        return {
            campaign: null,
        };
    }

    // 날짜 형식 변환
    const formattedCampaign = {
        ...campaign,
        start_date: campaign.start_date
            ? DateTime.fromISO(campaign.start_date).toFormat('yyyy년 MM월 dd일')
            : "",
        end_date: campaign.end_date
            ? DateTime.fromISO(campaign.end_date).toFormat('yyyy년 MM월 dd일')
            : "",
        // 타입 캐스팅을 위한 처리
        campaign_status: campaign.campaign_status as any
    };

    let currentUserRole = null;
    let isOwner = false;

    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("profile_id", user.id)
            .single();

        currentUserRole = profile?.role;
        isOwner = user.id === campaign.advertiser_id;
    }

    return {
        campaign: formattedCampaign,
        currentUserRole,
        currentUserId: user?.id,
        isOwner
    };
};

export const meta: Route.MetaFunction = () => {
    return [
        { title: "캠페인 상세 | Inf" },
        { name: "description", content: "캠페인 상세 정보를 확인하세요" },
    ];
};

export default function DetailPage({ loaderData }: Route.ComponentProps) {
    const { campaign, currentUserRole, isOwner } = loaderData;

    if (!campaign) {
        return (
            <div className="container py-10">
                <Card>
                    <CardContent className="py-10">
                        <div className="text-center text-muted-foreground">
                            캠페인을 찾을 수 없습니다.
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const renderActions = () => {
        if (!currentUserRole) {
            return (
                <Button asChild>
                    <Link to="/auth/login">로그인하고 지원하기</Link>
                </Button>
            );
        }

        if (currentUserRole === "INFLUENCER") {
            return (
                <Button asChild>
                    <Link to={`/campaigns/influencer/${campaign.campaign_id}/apply`}>지원하기</Link>
                </Button>
            );
        }

        if (currentUserRole === "ADVERTISER" && isOwner) {
            return (
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link to={`/campaigns/advertiser/${campaign.campaign_id}`}>광고주 페이지로 이동</Link>
                    </Button>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="container py-10">
            <CampaignDetailView
                campaign={campaign}
                renderActions={renderActions}
            />
        </div>
    );
} 