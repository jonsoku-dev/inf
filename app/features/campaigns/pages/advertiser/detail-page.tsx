import { Link, redirect } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Card, CardContent } from "~/common/components/ui/card";
import { getServerClient } from "~/server";
import { ApplicationStatistics } from "../../components/application-statistics";
import { CampaignDetailView } from "../../components/campaign-detail-view";
import type { Route } from "./+types/detail-page";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
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

    if (profile?.role !== "ADVERTISER") {
        return redirect(`/campaigns/${params.campaignId}`);
    }

    const { data: campaign } = await supabase
        .from("campaigns")
        .select(`
            *,
            advertiser:profiles!advertiser_id (
                name,
                username
            ),
            applications (
                application_id,
                influencer_id,
                application_status,
                message,
                applied_at,
                updated_at,
                influencer:profiles!influencer_id (
                    name,
                    username
                )
            )
        `)
        .eq("campaign_id", params.campaignId)
        .single();

    if (!campaign || campaign.advertiser_id !== user.id) {
        return redirect("/campaigns");
    }

    return {
        campaign,
        currentUserId: user.id,
    };
};

export const meta: Route.MetaFunction = () => {
    return [
        { title: "캠페인 관리 | Inf" },
        { name: "description", content: "캠페인을 관리하세요" },
    ];
};

export default function DetailPage({ loaderData }: Route.ComponentProps) {
    const { campaign, currentUserId } = loaderData;
    const isOwner = currentUserId === campaign?.advertiser_id;

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
        if (!isOwner) return null;

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
    };

    return (
        <div className="space-y-6">
            <CampaignDetailView
                campaign={campaign}
                renderActions={renderActions}
            />
            {isOwner && (
                <ApplicationStatistics
                    applications={campaign.applications}
                />
            )}
        </div>
    );
} 