import { Link, redirect } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Card, CardContent } from "~/common/components/ui/card";
import { getServerClient } from "~/server";
import { CampaignDetailView } from "../../components/campaign-detail-view";
import type { Route } from "./+types/detail-page";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    const { data: campaign } = await supabase
        .from("campaigns")
        .select(`
            *,
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

    let currentUserRole = null;
    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("profile_id", user.id)
            .single();
        currentUserRole = profile?.role;
    }

    return {
        campaign,
        currentUserRole,
        currentUserId: user?.id,
    };
};

export const meta: Route.MetaFunction = () => {
    return [
        { title: "캠페인 상세 | Inf" },
        { name: "description", content: "캠페인 상세 정보를 확인하세요" },
    ];
};

export default function DetailPage({ loaderData }: Route.ComponentProps) {
    const { campaign, currentUserRole, currentUserId } = loaderData;

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

        if (currentUserRole === "ADVERTISER" && currentUserId === campaign.advertiser_id) {
            return (
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link to={`/campaigns/advertiser/${campaign.campaign_id}/edit`}>수정</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link to={`/campaigns/advertiser/${campaign.campaign_id}/applications`}>지원자 관리</Link>
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