import { Link, redirect, Form } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Card, CardContent } from "~/common/components/ui/card";
import { getServerClient } from "~/server";
import { ApplicationStatistics } from "../../components/application-statistics";
import { CampaignDetailView } from "../../components/campaign-detail-view";
import { CampaignStatusView } from "../../components/campaign-status-view";
import { CAMPAIGN_STATUS } from "../../constants";
import type { Route } from "./+types/detail-page";
import { sendCampaignCreatedAlert, sendSystemAlert } from "~/features/alerts/utils/alert-utils";

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

export const action = async ({ request, params }: Route.ActionArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/auth/login");
    }

    const formData = await request.formData();
    const action = formData.get("action") as string;
    const campaignId = params.campaignId;

    // 캠페인 소유자 확인
    const { data: campaign } = await supabase
        .from("campaigns")
        .select("advertiser_id, campaign_status, title")
        .eq("campaign_id", campaignId)
        .single();

    if (!campaign || campaign.advertiser_id !== user.id) {
        return { error: "권한이 없습니다." };
    }

    let newStatus;
    switch (action) {
        case "publish":
            newStatus = "PUBLISHED";
            break;
        case "close":
            newStatus = "CLOSED";
            break;
        case "complete":
            newStatus = "COMPLETED";
            break;
        case "cancel":
            newStatus = "CANCELLED";
            break;
        default:
            return { error: "유효하지 않은 작업입니다." };
    }

    const { error } = await supabase
        .from("campaigns")
        .update({ campaign_status: newStatus as keyof typeof CAMPAIGN_STATUS })
        .eq("campaign_id", campaignId);

    if (error) {
        return { error: "상태 변경 중 오류가 발생했습니다." };
    }

    // 상태 변경에 따른 알림 처리
    if (newStatus === "PUBLISHED") {
        // 캠페인이 공개되면 모든 인플루언서에게 알림
        const { data: influencers } = await supabase
            .from("profiles")
            .select("profile_id")
            .eq("role", "INFLUENCER");

        if (influencers && influencers.length > 0) {
            const recipientIds = influencers.map(inf => inf.profile_id);
            await sendCampaignCreatedAlert({
                request,
                campaignId,
                campaignTitle: campaign.title,
                recipientIds
            });
        }
    } else if (newStatus === "CLOSED" || newStatus === "CANCELLED") {
        // 캠페인이 마감되거나 취소되면 지원자들에게 알림
        const { data: applications } = await supabase
            .from("applications")
            .select("influencer_id")
            .eq("campaign_id", campaignId)
            .in("application_status", ["PENDING", "ACCEPTED"]);

        if (applications && applications.length > 0) {
            const recipientIds = applications.map(app => app.influencer_id);
            const title = newStatus === "CLOSED" ? "캠페인이 마감되었습니다" : "캠페인이 취소되었습니다";
            const content = `"${campaign.title}" 캠페인이 ${newStatus === "CLOSED" ? "마감" : "취소"}되었습니다.`;

            await sendSystemAlert({
                request,
                title,
                content,
                recipientIds,
                link: `/campaigns/${campaignId}`,
                isImportant: false
            });
        }
    }

    return redirect(`/campaigns/advertiser/${campaignId}`);
};

export const meta: Route.MetaFunction = () => {
    return [
        { title: "캠페인 관리 | Inf" },
        { name: "description", content: "캠페인을 관리하세요" },
    ];
};

export default function DetailPage({ loaderData, actionData }: Route.ComponentProps) {
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

    const renderStatusActions = () => {
        if (!isOwner) return null;

        return (
            <Card className="mt-4">
                <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4">캠페인 상태 관리</h3>
                    <div className="flex flex-wrap gap-2">
                        {campaign.campaign_status === CAMPAIGN_STATUS.DRAFT && (
                            <Form method="post">
                                <input type="hidden" name="action" value="publish" />
                                <Button type="submit" variant="default">공개하기</Button>
                            </Form>
                        )}

                        {campaign.campaign_status === CAMPAIGN_STATUS.PUBLISHED && (
                            <Form method="post" className="inline">
                                <input type="hidden" name="action" value="close" />
                                <Button type="submit" variant="outline">마감하기</Button>
                            </Form>
                        )}

                        {campaign.campaign_status === CAMPAIGN_STATUS.CLOSED && (
                            <Form method="post" className="inline">
                                <input type="hidden" name="action" value="complete" />
                                <Button type="submit" variant="default">완료하기</Button>
                            </Form>
                        )}

                        {(campaign.campaign_status === CAMPAIGN_STATUS.DRAFT ||
                            campaign.campaign_status === CAMPAIGN_STATUS.PUBLISHED ||
                            campaign.campaign_status === CAMPAIGN_STATUS.CLOSED) && (
                                <Form method="post" className="inline">
                                    <input type="hidden" name="action" value="cancel" />
                                    <Button type="submit" variant="destructive">취소하기</Button>
                                </Form>
                            )}
                    </div>

                    {actionData?.error && (
                        <p className="text-destructive mt-2 text-sm">{actionData.error}</p>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            <CampaignDetailView
                campaign={{
                    ...campaign,
                    campaign_status: campaign.campaign_status as any
                }}
                renderActions={renderActions}
            />

            {isOwner && (
                <>
                    <CampaignStatusView status={campaign.campaign_status} />
                    {renderStatusActions()}
                    <ApplicationStatistics
                        applications={campaign.applications.map(app => ({
                            ...app,
                            application_status: app.application_status as any
                        }))}
                    />
                </>
            )}
        </div>
    );
} 