import { Form, Link, redirect } from "react-router";
import { z } from "zod";
import { Avatar, AvatarFallback } from "~/common/components/ui/avatar";
import { Badge } from "~/common/components/ui/badge";
import { Button } from "~/common/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Separator } from "~/common/components/ui/separator";
import { Textarea } from "~/common/components/ui/textarea";
import { APPLICATION_STATUS } from "~/features/applications/constants";
import { getServerClient } from "~/server";
import { CAMPAIGN_STATUS, CAMPAIGN_STATUS_LABELS } from "../constants";
import type { Route } from "./+types/public-campaign-detail-page";
const applicationSchema = z.object({
    message: z.string().min(1, "지원 메시지를 입력해주세요"),
});

export const loader = async ({ request, params }: Route.LoaderArgs) => {
    const supabase = getServerClient(request)
    const { data: { session } } = await supabase.auth.getSession();

    let userRole = null;
    let userId = null;
    let hasApplied = false;

    if (session) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("profile_id", session.user.id)
            .single();

        userRole = profile?.role;
        userId = session.user.id;

        // 이미 지원했는지 확인 - PENDING 상태도 지원한 것으로 처리
        const { data: application } = await supabase
            .from("applications")
            .select("application_status")
            .eq("campaign_id", params.campaignId)
            .eq("influencer_id", session.user.id)
            .single();

        // 지원 내역이 있으면 hasApplied true
        hasApplied = !!application;
    }

    // 캠페인 상세 정보 조회 (실제 스키마에 맞게 수정)
    const { data: campaign, error: campaignError } = await supabase
        .from("campaigns")
        .select(`
            campaign_id,
            advertiser_id,
            title,
            description,
            budget,
            campaign_status,
            target_market,
            requirements,
            period_start,
            period_end,
            created_at,
            updated_at,
            advertiser:profiles!advertiser_id (
                profile_id,
                name,
                username,
                created_at
            ),
            applications (
                application_id,
                influencer_id,
                application_status,
                message,
                applied_at,
                updated_at,
                influencer:profiles!influencer_id (
                    profile_id,
                    name,
                    username
                )
            )
        `)
        .eq("campaign_id", params.campaignId)
        .single();

    if (campaignError || !campaign) {
        throw new Error("캠페인을 찾을 수 없습니다");
    }

    return {
        campaign,
        currentUserRole: userRole,
        currentUserId: userId,
        hasApplied,
    };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
    const supabase = getServerClient(request)
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        return { ok: false, error: "로그인이 필요합니다." };
    }

    const formData = await request.formData();
    const result = applicationSchema.safeParse({
        message: formData.get("message"),
    });

    if (!result.success) {
        return {
            ok: false,
            errors: result.error.flatten(),
        };
    }

    // 이미 지원했는지 다시 한번 체크
    const { data: existingApplication } = await supabase
        .from("applications")
        .select("application_id")
        .eq("campaign_id", params.campaignId)
        .eq("influencer_id", session.user.id)
        .single();

    if (existingApplication) {
        return { ok: false, error: "이미 지원한 캠페인입니다." };
    }

    // 지원하기
    const { error } = await supabase
        .from("applications")
        .insert({
            campaign_id: params.campaignId,
            influencer_id: session.user.id,
            application_status: APPLICATION_STATUS.PENDING,
            message: result.data.message,
        });

    if (error) {
        console.error(error);
        return { ok: false, error: "지원 중 오류가 발생했습니다." };
    }

    // 성공 시 리다이렉트
    return redirect(`/campaigns/${params.campaignId}`);
};

export const meta: Route.MetaFunction = () => {
    return [
        { title: "캠페인 상세 | Inf" },
        { name: "description", content: "캠페인 상세 정보를 확인하세요" },
    ];
};

export default function PublicCampaignDetailPage({ loaderData, actionData }: Route.ComponentProps) {
    const { campaign, currentUserRole, currentUserId, hasApplied } = loaderData;
    const isOwner = currentUserId === campaign.advertiser_id;
    const isAdmin = currentUserRole === "admin";
    const isInfluencer = currentUserRole === "influencer";
    const isPublished = campaign.campaign_status === CAMPAIGN_STATUS.PUBLISHED as keyof typeof CAMPAIGN_STATUS;

    console.log({
        campaign,
        currentUserRole,
        currentUserId,
        hasApplied,
        isOwner,
        isAdmin,
        isInfluencer,
        isPublished,
    })

    // 지원 상태에 따른 메시지 결정
    const getApplicationStatusMessage = () => {
        if (!isInfluencer) return null;
        if (!hasApplied) return null;

        const myApplication = campaign.applications.find(
            app => app.influencer_id === currentUserId
        );

        if (!myApplication) return "지원 내역을 찾을 수 없습니다.";

        switch (myApplication.application_status) {
            case APPLICATION_STATUS.PENDING:
                return "검토 중인 지원 내역이 있습니다.";
            case APPLICATION_STATUS.APPROVED:
                return "승인된 지원 내역이 있습니다.";
            case APPLICATION_STATUS.REJECTED:
                return "거절된 지원 내역이 있습니다.";
            case APPLICATION_STATUS.COMPLETED:
                return "완료된 지원 내역이 있습니다.";
            default:
                return "이미 지원한 캠페인입니다.";
        }
    };

    const applicationStatusMessage = getApplicationStatusMessage();

    return (
        <div className="container py-10 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <CardTitle className="text-2xl">{campaign.title}</CardTitle>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Avatar>
                                        <AvatarFallback>{campaign.advertiser.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{campaign.advertiser.name}</p>
                                        <p className="text-sm text-muted-foreground">@{campaign.advertiser.username}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Badge>{CAMPAIGN_STATUS_LABELS[campaign.campaign_status as keyof typeof CAMPAIGN_STATUS_LABELS]}</Badge>
                                    <Badge variant="outline">
                                        {campaign.target_market === "KR" ? "한국" : campaign.target_market === "JP" ? "일본" : "한국/일본"}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* 캠페인 상세 정보 */}
                    <div className="space-y-4">
                        <div className="prose max-w-none">
                            <p>{campaign.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h3 className="font-medium">예산</h3>
                                <p className="text-lg font-semibold">{campaign.budget.toLocaleString()}원</p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-medium">캠페인 기간</h3>
                                <p>{campaign.period_start} ~ {campaign.period_end}</p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-medium">지원 요건</h3>
                                <p>{campaign.requirements}</p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-medium">등록일</h3>
                                <p>{new Date(campaign.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* 광고주 정보 - 실제 존재하는 필드만 표시 */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">광고주 정보</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium">이름</h4>
                                <p className="text-sm">{campaign.advertiser.name}</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-medium">사용자명</h4>
                                <p>@{campaign.advertiser.username}</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-medium">가입일</h4>
                                <p>{new Date(campaign.advertiser.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* 지원자 통계 섹션 */}
                    {(isAdmin || isOwner) && campaign.applications.length > 0 && (
                        <>
                            <Separator />
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">지원 현황</h3>
                                    <Button variant="outline" asChild>
                                        <Link to={`/my/campaigns/${campaign.campaign_id}/applications`}>
                                            전체보기
                                        </Link>
                                    </Button>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-2xl font-bold">{campaign.applications.length}</p>
                                        <p className="text-sm text-muted-foreground">총 지원자</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-2xl font-bold">
                                            {campaign.applications.filter(app =>
                                                app.application_status === APPLICATION_STATUS.APPROVED
                                            ).length}
                                        </p>
                                        <p className="text-sm text-muted-foreground">승인됨</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-2xl font-bold">
                                            {campaign.applications.filter(app =>
                                                app.application_status === APPLICATION_STATUS.PENDING
                                            ).length}
                                        </p>
                                        <p className="text-sm text-muted-foreground">검토중</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>

                {/* 인플루언서 관련 CardFooter */}
                {isInfluencer && (
                    <CardFooter>
                        {isPublished && !hasApplied ? (
                            <Form method="post" className="w-full space-y-4">
                                <div className="space-y-2">
                                    <h3 className="font-medium">지원하기</h3>
                                    <Textarea
                                        name="message"
                                        placeholder="지원 메시지를 입력하세요"
                                        className="min-h-[100px]"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit">지원하기</Button>
                                </div>
                            </Form>
                        ) : (
                            <div className="w-full">
                                <div className="rounded-lg bg-muted p-4">
                                    <p className="text-sm text-muted-foreground">
                                        {applicationStatusMessage}
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardFooter>
                )}
            </Card>
        </div>
    );
} 