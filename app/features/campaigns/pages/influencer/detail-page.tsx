import { redirect } from "react-router";
import { Card, CardContent } from "~/common/components/ui/card";
import { getServerClient } from "~/server";
import { CampaignApplicationStatus } from "../../components/campaign-application-status";
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

    if (profile?.role !== "INFLUENCER") {
        return redirect(`/campaigns/${params.campaignId}`);
    }

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

    const { data: application } = await supabase
        .from("applications")
        .select("*")
        .eq("campaign_id", params.campaignId)
        .eq("influencer_id", user.id)
        .single();

    return {
        campaign,
        currentUserId: user.id,
        hasApplied: !!application,
        application
    };
};

export const meta: Route.MetaFunction = () => {
    return [
        { title: "캠페인 상세 | Inf" },
        { name: "description", content: "캠페인 상세 정보를 확인하세요" },
    ];
};

export default function DetailPage({ loaderData }: Route.ComponentProps) {
    const { campaign, hasApplied, application } = loaderData;

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

    return (
        <div className="container py-10 space-y-6">
            <CampaignDetailView campaign={campaign} />
            <CampaignApplicationStatus
                campaignId={campaign.campaign_id}
                hasApplied={hasApplied}
                application={application}
            />
        </div>
    );
} 