import { Form, Link } from "react-router";
import { z } from "zod";
import { Badge } from "~/common/components/ui/badge";
import { Button } from "~/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { APPLICATION_STATUS } from "~/features/applications/constants";
import { getServerClient } from "~/server";
import { CAMPAIGN_STATUS_LABELS } from "../constants";
import type { Route } from "./+types/campaign-detail-page";
const applicationSchema = z.object({
    message: z.string().min(1, "지원 메시지를 입력해주세요"),
});

export const loader = async ({ request, params }: Route.LoaderArgs) => {
    const supabase = getServerClient(request)
    // 세션 체크
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        throw new Error("인증이 필요합니다");
    }

    // 사용자 역할 조회
    const { data: userProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("profile_id", session.user.id)
        .single();

    // 캠페인 조회
    const { data: campaign, error: campaignError } = await supabase
        .from("campaigns")
        .select(`
            *,
            advertiser:profiles!advertiser_id (
                name,
                username,
                role
            )
        `)
        .eq("campaign_id", params.campaignId)
        .single();

    if (campaignError || !campaign) {
        throw new Error("캠페인을 찾을 수 없습니다");
    }

    const isOwner = campaign.advertiser_id === session.user.id;
    const isAdmin = userProfile?.role === "admin";

    // 접근 권한 체크 (관리자 또는 소유자만 접근 가능)
    if (!isAdmin && !isOwner) {
        throw new Error("접근 권한이 없습니다");
    }

    // 지원 내역 조회
    const { data: applications } = await supabase
        .from("applications")
        .select(`
            application_id,
            campaign_id,
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
        `)
        .eq("campaign_id", params.campaignId)
        .order("applied_at", { ascending: false });

    return {
        campaign,
        isOwner,
        isAdmin,
        applications: applications || [],
    };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
    const supabase = getServerClient(request)
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        return { ok: false, error: "로그인이 필요합니다." };
    }

    // 사용자 역할 조회
    const { data: userProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("profile_id", session.user.id)
        .single();

    const isAdmin = userProfile?.role === "admin";

    // 캠페인 소유자 확인
    const { data: campaign } = await supabase
        .from("campaigns")
        .select("advertiser_id")
        .eq("campaign_id", params.campaignId)
        .single();

    const isOwner = campaign?.advertiser_id === session.user.id;

    // 권한 체크
    if (!isAdmin && !isOwner) {
        return { ok: false, error: "권한이 없습니다." };
    }

    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "update-status") {
        const applicationId = formData.get("applicationId") as string;
        const status = formData.get("status") as string;

        const { error } = await supabase
            .from("applications")
            .update({ application_status: status as any })
            .eq("application_id", applicationId)
            .eq("campaign_id", params.campaignId);

        if (error) {
            return { ok: false, error: "상태 변경 중 오류가 발생했습니다." };
        }

        return { ok: true };
    }

    return { ok: false, error: "잘못된 요청입니다." };
};

export const meta: Route.MetaFunction = () => {
    return [
        { title: "캠페인 상세 | Inf" },
        { name: "description", content: "캠페인 상세 정보를 확인하세요" },
    ];
};

export default function CampaignDetailPage({ loaderData, actionData }: Route.ComponentProps) {
    const { campaign, isOwner, isAdmin, applications } = loaderData;

    return (
        <div className="container py-10 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">캠페인 상세</h1>
                    <p className="text-muted-foreground text-sm">캠페인 상세 정보를 확인하세요</p>
                </div>
                {isOwner && (
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link to={`/my/campaigns/${campaign.campaign_id}/edit`}>수정</Link>
                        </Button>
                    </div>
                )}
            </div>
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <CardTitle className="text-xl">{campaign.title}</CardTitle>
                        <div className="flex gap-2">
                            <Badge>{CAMPAIGN_STATUS_LABELS[campaign.campaign_status as keyof typeof CAMPAIGN_STATUS_LABELS]}</Badge>
                            <Badge variant="outline">
                                {campaign.target_market === "KR" ? "한국" : campaign.target_market === "JP" ? "일본" : "한국/일본"}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="prose max-w-none">
                        <p>{campaign.description}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h3 className="font-medium">캠페인 정보</h3>
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-sm">예산</span>
                                    <span className="font-medium">{campaign.budget.toLocaleString()}원</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-sm">기간</span>
                                    <span className="text-sm">
                                        {campaign.period_start} ~ {campaign.period_end}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-medium">지원 요건</h3>
                            <p className="text-sm">{campaign.requirements}</p>
                        </div>
                    </div>

                    {/* 지원자 목록 (소유자인 경우) 또는 나의 지원 현황 */}
                    {applications.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="font-medium">{isOwner ? "지원자 목록" : "나의 지원 현황"}</h3>
                            <div className="space-y-2">
                                {applications.map((application) => (
                                    <div
                                        key={application.application_id}
                                        className="flex items-center justify-between p-4 rounded-lg border"
                                    >
                                        <div className="space-y-1">
                                            <div>
                                                <p className="font-medium">{application.influencer?.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {application.influencer?.username}
                                                </p>
                                            </div>
                                            <p className="text-sm">{application.message}</p>
                                            <p className="text-xs text-muted-foreground">
                                                지원일: {new Date(application.applied_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Badge variant={application.application_status === APPLICATION_STATUS.APPROVED ? "success" : "secondary"}>
                                                {application.application_status === APPLICATION_STATUS.APPROVED ? "승인됨" :
                                                    application.application_status === APPLICATION_STATUS.REJECTED ? "거절됨" : "검토중"}
                                            </Badge>
                                            {isOwner && application.application_status === APPLICATION_STATUS.PENDING && (
                                                <Form method="post" className="flex gap-2">
                                                    <input type="hidden" name="intent" value="update-status" />
                                                    <input type="hidden" name="applicationId" value={application.application_id} />
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        name="status"
                                                        value={APPLICATION_STATUS.APPROVED}
                                                        type="submit"
                                                    >
                                                        승인
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        name="status"
                                                        value={APPLICATION_STATUS.REJECTED}
                                                        type="submit"
                                                    >
                                                        거절
                                                    </Button>
                                                </Form>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 