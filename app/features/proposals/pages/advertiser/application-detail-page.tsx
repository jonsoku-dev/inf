import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { getServerClient } from "~/server";
import { Button } from "~/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import { Separator } from "~/common/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "~/common/components/ui/dialog";
import { Textarea } from "~/common/components/ui/textarea";
import { formatCurrency } from "~/lib/utils";
import {
    PROPOSAL_APPLICATION_STATUS,
    PROPOSAL_APPLICATION_STATUS_LABELS,
    TARGET_MARKET
} from "../../constants";
import type { Route } from "./+types/application-detail-page";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
    const { applicationId } = params;
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

    const { data: application, error } = await supabase
        .from("proposal_applications")
        .select(`
            application_id,
            proposal_application_status,
            applied_at,
            message,
            updated_at,
            proposal:influencer_proposals (
                proposal_id,
                title,
                description,
                desired_budget,
                target_market,
                content_type,
                categories,
                keywords,
                expected_deliverables,
                available_period_start,
                available_period_end,
                is_negotiable,
                portfolio_samples,
                influencer:profiles (
                    profile_id,
                    name,
                    username,
                    influencer_profile:influencer_profiles (
                        instagram_handle,
                        youtube_handle,
                        tiktok_handle,
                        blog_url,
                        followers_count,
                        introduction,
                        portfolio_urls
                    )
                )
            )
        `)
        .eq("application_id", applicationId)
        .eq("advertiser_id", user.id)
        .single();

    if (error) {
        throw new Error("제안 신청을 찾을 수 없습니다");
    }

    return {
        application
    };
};

export async function action({ request, params }: Route.ActionArgs) {
    const { applicationId } = params;
    const formData = await request.formData();
    const status = formData.get("status") as string;
    const message = formData.get("message") as string;

    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

    // 상태 업데이트
    const { error } = await supabase
        .from("proposal_applications")
        .update({
            proposal_application_status: status as keyof typeof PROPOSAL_APPLICATION_STATUS,
            updated_at: new Date().toISOString()
        })
        .eq("application_id", applicationId)
        .eq("advertiser_id", user.id);

    if (error) {
        throw new Error("제안 상태 업데이트에 실패했습니다");
    }

    // 메시지가 있으면 알림 추가
    if (message) {
        const { data: application } = await supabase
            .from("proposal_applications")
            .select("proposal:influencer_proposals (influencer_id)")
            .eq("application_id", applicationId)
            .single();

        if (application) {
            await supabase.from("notifications").insert({
                user_id: application.proposal.influencer_id,
                message: `제안 신청 상태가 ${PROPOSAL_APPLICATION_STATUS_LABELS[status as keyof typeof PROPOSAL_APPLICATION_STATUS_LABELS]}(으)로 변경되었습니다: ${message}`,
                sent_at: new Date().toISOString()
            });
        }
    }

    return { success: true };
}

export default function ApplicationDetailPage({ loaderData }: Route.ComponentProps) {
    const { application } = loaderData;
    const navigate = useNavigate();
    const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [message, setMessage] = useState("");

    const getTargetMarketLabel = (market: string) => {
        switch (market) {
            case TARGET_MARKET.KR:
                return "한국";
            case TARGET_MARKET.JP:
                return "일본";
            case TARGET_MARKET.BOTH:
                return "한국/일본";
            default:
                return market;
        }
    };

    const handleStatusChange = async (status: string) => {
        const formData = new FormData();
        formData.append("status", status);
        formData.append("message", message);

        try {
            await fetch(`/proposals/advertiser/applications/${application.application_id}`, {
                method: "POST",
                body: formData
            });
            navigate(".", { replace: true });
        } catch (error) {
            console.error("상태 변경 실패:", error);
        } finally {
            setIsAcceptDialogOpen(false);
            setIsRejectDialogOpen(false);
            setMessage("");
        }
    };

    const isPending = application.proposal_application_status === PROPOSAL_APPLICATION_STATUS.PENDING;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <Link to="/proposals/advertiser" className="text-sm text-muted-foreground hover:underline">
                        ← 목록으로 돌아가기
                    </Link>
                    <div className="flex items-center gap-2 mt-2">
                        <h2 className="text-2xl font-semibold">{application.proposal.title}</h2>
                        <Badge className="bg-blue-500 text-white">공개 제안</Badge>
                    </div>
                    <p className="text-muted-foreground mt-1">
                        인플루언서가 제안한 협업 아이디어입니다
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline">
                        {getTargetMarketLabel(application.proposal.target_market)}
                    </Badge>
                    {application.proposal.proposal_status && (
                        <Badge>
                            {application.proposal.proposal_status}
                        </Badge>
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>제안 상세 정보</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="font-medium mb-2">설명</h3>
                                <p className="text-muted-foreground whitespace-pre-line">
                                    {application.proposal.description}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-medium mb-2">예상 결과물</h3>
                                <ul className="list-disc pl-5 text-muted-foreground">
                                    {application.proposal.expected_deliverables.map((item: string, index: number) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>

                            {application.proposal.portfolio_samples && application.proposal.portfolio_samples.length > 0 && (
                                <div>
                                    <h3 className="font-medium mb-2">포트폴리오 샘플</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {application.proposal.portfolio_samples.map((url: string, index: number) => (
                                            <a
                                                key={index}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline truncate"
                                            >
                                                샘플 #{index + 1}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-medium mb-1">예산</h3>
                                    <p className="text-muted-foreground">
                                        {formatCurrency(application.proposal.desired_budget)}
                                        {application.proposal.is_negotiable && " (협의 가능)"}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-medium mb-1">대상 시장</h3>
                                    <p className="text-muted-foreground">
                                        {getTargetMarketLabel(application.proposal.target_market)}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-medium mb-1">콘텐츠 유형</h3>
                                    <p className="text-muted-foreground">{application.proposal.content_type}</p>
                                </div>
                                <div>
                                    <h3 className="font-medium mb-1">가능 기간</h3>
                                    <p className="text-muted-foreground">
                                        {new Date(application.proposal.available_period_start).toLocaleDateString()} ~
                                        {new Date(application.proposal.available_period_end).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium mb-2">카테고리</h3>
                                <div className="flex flex-wrap gap-2">
                                    {application.proposal.categories.map((category: string, index: number) => (
                                        <Badge key={index} variant="outline">{category}</Badge>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium mb-2">키워드</h3>
                                <div className="flex flex-wrap gap-2">
                                    {application.proposal.keywords.map((keyword: string, index: number) => (
                                        <Badge key={index} variant="secondary">{keyword}</Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>신청 진행 상태</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative border-l-2 border-muted pl-6 pb-2">
                                <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-0"></div>
                                <div className="mb-6">
                                    <p className="text-sm font-medium">신청됨</p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(application.applied_at).toLocaleString()}
                                    </p>
                                </div>

                                {application.proposal_application_status !== "PENDING" && (
                                    <div className="relative">
                                        <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-0"></div>
                                        <div className="mb-6">
                                            <p className="text-sm font-medium">
                                                {application.proposal_application_status === "ACCEPTED" ? "수락됨" :
                                                    application.proposal_application_status === "REJECTED" ? "거절됨" :
                                                        application.proposal_application_status === "COMPLETED" ? "완료됨" : "취소됨"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(application.updated_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>신청 메시지</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-line text-muted-foreground">{application.message}</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>인플루언서 정보</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 mb-4">
                                <Avatar className="w-16 h-16">
                                    <AvatarFallback className="text-xl">
                                        {application.proposal.influencer.name.slice(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold text-lg">{application.proposal.influencer.name}</h3>
                                    <p className="text-muted-foreground">@{application.proposal.influencer.username}</p>
                                </div>
                            </div>

                            {application.proposal.influencer.influencer_profile?.introduction && (
                                <div className="mb-4">
                                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                                        {application.proposal.influencer.influencer_profile.introduction}
                                    </p>
                                </div>
                            )}

                            <Separator className="my-4" />

                            <div className="space-y-3">
                                {application.proposal.influencer.influencer_profile?.instagram_handle && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">Instagram:</span>
                                        <a
                                            href={`https://instagram.com/${application.proposal.influencer.influencer_profile.instagram_handle}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            @{application.proposal.influencer.influencer_profile.instagram_handle}
                                        </a>
                                    </div>
                                )}

                                {application.proposal.influencer.influencer_profile?.youtube_handle && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">YouTube:</span>
                                        <a
                                            href={`https://youtube.com/@${application.proposal.influencer.influencer_profile.youtube_handle}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            @{application.proposal.influencer.influencer_profile.youtube_handle}
                                        </a>
                                    </div>
                                )}

                                {application.proposal.influencer.influencer_profile?.tiktok_handle && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">TikTok:</span>
                                        <a
                                            href={`https://tiktok.com/@${application.proposal.influencer.influencer_profile.tiktok_handle}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            @{application.proposal.influencer.influencer_profile.tiktok_handle}
                                        </a>
                                    </div>
                                )}

                                {application.proposal.influencer.influencer_profile?.blog_url && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">블로그:</span>
                                        <a
                                            href={application.proposal.influencer.influencer_profile.blog_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline truncate max-w-[200px]"
                                        >
                                            {application.proposal.influencer.influencer_profile.blog_url}
                                        </a>
                                    </div>
                                )}
                            </div>

                            {application.proposal.influencer.influencer_profile?.followers_count && (
                                <>
                                    <Separator className="my-4" />
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium">팔로워 수</h4>
                                        <div className="space-y-1">
                                            {Object.entries(application.proposal.influencer.influencer_profile.followers_count as Record<string, number>).map(([platform, count]) => (
                                                <div key={platform} className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">{platform}</span>
                                                    <span className="text-sm font-medium">{count.toLocaleString()}명</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {application.proposal.influencer.influencer_profile?.portfolio_urls && application.proposal.influencer.influencer_profile.portfolio_urls.length > 0 && (
                                <>
                                    <Separator className="my-4" />
                                    <div>
                                        <h4 className="text-sm font-medium mb-2">포트폴리오</h4>
                                        <div className="space-y-1">
                                            {application.proposal.influencer.influencer_profile.portfolio_urls.map((url: string, index: number) => (
                                                <a
                                                    key={index}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block text-sm text-blue-600 hover:underline truncate"
                                                >
                                                    포트폴리오 #{index + 1}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {isPending && (
                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={() => setIsAcceptDialogOpen(true)}
                                className="w-full"
                            >
                                수락하기
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsRejectDialogOpen(true)}
                                className="w-full"
                            >
                                거절하기
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* 수락 다이얼로그 */}
            <Dialog open={isAcceptDialogOpen} onOpenChange={setIsAcceptDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>제안 수락</DialogTitle>
                        <DialogDescription>
                            이 제안을 수락하시겠습니까? 인플루언서에게 메시지를 남길 수 있습니다.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="인플루언서에게 전달할 메시지를 입력하세요 (선택사항)"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="min-h-[100px]"
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAcceptDialogOpen(false)}>
                            취소
                        </Button>
                        <Button onClick={() => handleStatusChange(PROPOSAL_APPLICATION_STATUS.ACCEPTED)}>
                            수락하기
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 거절 다이얼로그 */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>제안 거절</DialogTitle>
                        <DialogDescription>
                            이 제안을 거절하시겠습니까? 인플루언서에게 거절 사유를 알려주세요.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="거절 사유를 입력하세요"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="min-h-[100px]"
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                            취소
                        </Button>
                        <Button variant="destructive" onClick={() => handleStatusChange(PROPOSAL_APPLICATION_STATUS.REJECTED)}>
                            거절하기
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export const meta: Route.MetaFunction = () => {
    return [
        { title: "제안 신청 상세 | CROSSPHERE" },
        { description: "인플루언서의 제안 신청 상세 정보를 확인하고 관리하세요." }
    ];
};