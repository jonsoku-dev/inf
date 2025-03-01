import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "~/common/components/ui/button";
import { getServerClient } from "~/server";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { Avatar, AvatarFallback } from "~/common/components/ui/avatar";
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
    PROPOSAL_APPLICATION_STATUS_LABELS,
    TARGET_MARKET,
    CONTENT_TYPE,
    CONTENT_TYPE_LABELS,
    ADVERTISER_PROPOSAL_STATUS,
    ADVERTISER_PROPOSAL_STATUS_LABELS
} from "../../constants";
import type { Route } from "./+types/detail-page";
import type { Database } from "database.types";

// 직접 제안과 응답을 포함하는 타입 정의
interface DirectProposalWithResponses {
    proposal_id: string;
    proposal_status: Database["public"]["Enums"]["advertiser_proposal_status"] | null;
    created_at: string;
    title: string;
    responses: Array<{
        response_id: string;
        proposal_id: string;
        influencer_id: string;
        message: string;
        response_status: Database["public"]["Enums"]["proposal_application_status"] | null;
        responded_at: string;
        updated_at: string;
    }>;
}

/**
 * @description 광고주가 볼 수 있는 인플루언서 제안 상세 페이지
 */
export const loader = async ({ request, params }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

    // 제안 정보 가져오기
    const { data: proposal, error: proposalError } = await supabase
        .from("influencer_proposals")
        .select(`
            *,
            influencer:profiles (
                profile_id,
                name,
                username,
                line_user_id,
                influencer_profile:influencer_profiles (
                    instagram_handle,
                    youtube_handle,
                    tiktok_handle,
                    blog_url,
                    followers_count,
                    introduction,
                    location,
                    categories,
                    portfolio_urls,
                    birth_year,
                    gender
                )
            )
        `)
        .eq("proposal_id", params.proposalId)
        .single();

    if (proposalError || !proposal) {
        throw new Error("제안을 찾을 수 없습니다");
    }

    // 이미 신청한 제안인지 확인
    const { data: existingApplication } = await supabase
        .from("proposal_applications")
        .select("application_id, proposal_application_status, applied_at, message")
        .eq("proposal_id", params.proposalId)
        .eq("advertiser_id", user.id)
        .single();

    // 이미 이 인플루언서에게 직접 제안을 보냈는지 확인
    const { data: existingDirectProposals } = await supabase
        .from("advertiser_proposals")
        .select(`
            proposal_id, 
            proposal_status, 
            created_at, 
            title
        `)
        .eq("influencer_id", proposal.influencer_id)
        .eq("advertiser_id", user.id)
        .order("created_at", { ascending: false });

    // 각 제안에 대한 응답 정보 가져오기 (별도 쿼리로 처리)
    let directProposalsWithResponses: DirectProposalWithResponses[] = [];

    if (existingDirectProposals && existingDirectProposals.length > 0) {
        // 모든 제안 ID 목록
        const proposalIds = existingDirectProposals.map(p => p.proposal_id);

        // 응답 정보 가져오기
        const { data: responses } = await supabase
            .from("advertiser_proposal_responses")
            .select("*")
            .in("proposal_id", proposalIds);

        // 제안과 응답 정보 합치기
        directProposalsWithResponses = existingDirectProposals.map(proposal => {
            const proposalResponses = responses ? responses.filter(r => r.proposal_id === proposal.proposal_id) : [];
            return {
                ...proposal,
                responses: proposalResponses
            };
        });
    }

    return {
        proposal,
        application: existingApplication || null,
        directProposals: directProposalsWithResponses
    };
};

export default function DetailPage({ loaderData }: Route.ComponentProps) {
    const { proposal, application, directProposals } = loaderData;
    const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
    const [isDirectProposalDialogOpen, setIsDirectProposalDialogOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const getTargetMarketLabel = (market: typeof TARGET_MARKET[keyof typeof TARGET_MARKET]) => {
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

    const handleSubmit = async (action: "apply" | "direct_proposal") => {
        setIsSubmitting(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("action", action);
            formData.append("message", message);

            const response = await fetch(`/proposals/advertiser/${proposal.proposal_id}`, {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (result.error) {
                setError(result.error);
                return;
            }

            // 성공 시 다이얼로그 닫기 및 메시지 초기화
            setIsApplyDialogOpen(false);
            setIsDirectProposalDialogOpen(false);
            setMessage("");

            // 페이지 새로고침
            navigate(`/proposals/advertiser/${proposal.proposal_id}`);
        } catch (err) {
            setError("요청 처리 중 오류가 발생했습니다");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitDirectProposal = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("action", "direct_proposal");
            formData.append("title", proposal.title);
            formData.append("budget", proposal.desired_budget.toString());
            formData.append("target_market", proposal.target_market);
            formData.append("content_type", proposal.content_type);
            formData.append("campaign_start_date", new Date().toISOString().split('T')[0]);
            formData.append("campaign_end_date", new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
            formData.append("is_negotiable", "true");
            formData.append("description", message);
            formData.append("requirements", ""); // Placeholder for requirements

            const response = await fetch(`/proposals/advertiser/${proposal.proposal_id}/direct`, {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (result.error) {
                setError(result.error);
                return;
            }

            // 성공 시 다이얼로그 닫기 및 메시지 초기화
            setIsApplyDialogOpen(false);
            setIsDirectProposalDialogOpen(false);
            setMessage("");

            // 페이지 새로고침
            navigate(`/proposals/advertiser/${proposal.proposal_id}`);
        } catch (err) {
            setError("요청 처리 중 오류가 발생했습니다");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto py-8">
            <div className="mb-6">
                <Button asChild variant="outline" size="sm">
                    <Link to="/proposals/advertiser">
                        ← 목록으로 돌아가기
                    </Link>
                </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between mb-2">
                                <Badge>
                                    {proposal.proposal_status}
                                </Badge>
                                <Badge variant="outline">
                                    {getTargetMarketLabel(proposal.target_market)}
                                </Badge>
                            </div>
                            <CardTitle className="text-2xl">{proposal.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">제안 설명</h3>
                                    <p className="whitespace-pre-line">{proposal.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium">예산</h4>
                                        <p className="text-lg font-bold">
                                            {formatCurrency(proposal.desired_budget)}
                                            {proposal.is_negotiable && (
                                                <span className="ml-2 text-sm text-gray-500">(협의 가능)</span>
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium">콘텐츠 유형</h4>
                                        <p>{CONTENT_TYPE_LABELS[proposal.content_type as keyof typeof CONTENT_TYPE_LABELS]}</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium mb-2">기대 결과물</h4>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {proposal.expected_deliverables.map((deliverable, index) => (
                                            <li key={index} className="text-sm">{deliverable}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium mb-2">가능 기간</h4>
                                    <p>
                                        {new Date(proposal.available_period_start).toLocaleDateString()} ~
                                        {new Date(proposal.available_period_end).toLocaleDateString()}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium mb-2">카테고리</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {proposal.categories.map((category, index) => (
                                            <Badge key={index} variant="outline">{category}</Badge>
                                        ))}
                                    </div>
                                </div>

                                {proposal.keywords && proposal.keywords.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium mb-2">키워드</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {proposal.keywords.map((keyword, index) => (
                                                <Badge key={index} variant="secondary">{keyword}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {proposal.preferred_industry && proposal.preferred_industry.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium mb-2">선호 산업</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {proposal.preferred_industry.map((industry, index) => (
                                                <Badge key={index} variant="outline">{industry}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {proposal.portfolio_samples && proposal.portfolio_samples.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium mb-2">포트폴리오 샘플</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {proposal.portfolio_samples.map((sample, index) => (
                                                <a
                                                    key={index}
                                                    href={sample}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block text-sm text-blue-600 hover:underline truncate"
                                                >
                                                    샘플 #{index + 1}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 신청 및 역제안 버튼 부분 수정 */}
                                {!application && (
                                    <div className="mt-6">
                                        <div className="p-4 bg-muted rounded-lg mb-3">
                                            <h4 className="text-sm font-medium mb-2">제안에 대한 응답 방법</h4>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                인플루언서의 제안에 두 가지 방식으로 응답할 수 있습니다:
                                            </p>
                                            <ul className="text-sm list-disc pl-5 mb-3 space-y-1">
                                                <li>
                                                    <span className="font-medium">제안 수락하기</span>: 인플루언서가 제시한 조건 그대로 수락합니다.
                                                </li>
                                                <li>
                                                    <span className="font-medium">역제안하기</span>: 다른 조건(예산, 기간 등)을 제시하여 협상합니다.
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                className="w-full"
                                                onClick={() => setIsApplyDialogOpen(true)}
                                            >
                                                제안 수락하기
                                            </Button>

                                            {directProposals.length === 0 && (
                                                <Button
                                                    variant="outline"
                                                    className="w-full"
                                                    onClick={() => setIsDirectProposalDialogOpen(true)}
                                                >
                                                    역제안하기
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {application && (
                                    <div className="mt-6 space-y-3">
                                        <div className="p-4 bg-muted rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-sm font-medium">내 신청 상태</h4>
                                                <Badge>
                                                    {PROPOSAL_APPLICATION_STATUS_LABELS[application.proposal_application_status as keyof typeof PROPOSAL_APPLICATION_STATUS_LABELS]}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(application.applied_at).toLocaleDateString()} 신청됨
                                            </p>
                                            <p className="text-sm mt-2">
                                                <span className="font-medium">내 메시지:</span>
                                                <span className="text-muted-foreground line-clamp-2 mt-1">{application.message}</span>
                                            </p>
                                        </div>

                                        {/* 신청이 거절된 경우에만 역제안 버튼 표시 */}
                                        {application.proposal_application_status === "REJECTED" && directProposals.length === 0 && (
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={() => setIsDirectProposalDialogOpen(true)}
                                            >
                                                역제안하기
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 역제안 목록 표시 */}
                    {directProposals.length > 0 && (
                        <>
                            <Separator className="my-4" />
                            <div>
                                <h4 className="text-sm font-medium mb-2">내 역제안 목록</h4>
                                <div className="space-y-3">
                                    {directProposals.map((proposal) => (
                                        <div key={proposal.proposal_id} className="p-3 border rounded-lg">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium">{proposal.title}</span>
                                                <Badge>
                                                    {proposal.proposal_status &&
                                                        ADVERTISER_PROPOSAL_STATUS_LABELS[proposal.proposal_status as keyof typeof ADVERTISER_PROPOSAL_STATUS_LABELS] ||
                                                        '상태 없음'}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mb-2">
                                                {new Date(proposal.created_at).toLocaleDateString()} 제안됨
                                            </p>

                                            {proposal.responses && Array.isArray(proposal.responses) && proposal.responses.length > 0 && (
                                                <div className="mt-2 p-2 bg-muted rounded">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-medium">인플루언서 응답</span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {proposal.responses[0].response_status &&
                                                                PROPOSAL_APPLICATION_STATUS_LABELS[proposal.responses[0].response_status as keyof typeof PROPOSAL_APPLICATION_STATUS_LABELS] ||
                                                                '응답 대기중'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs mt-1 line-clamp-2">{proposal.responses[0].message}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {new Date(proposal.responses[0].responded_at).toLocaleDateString()} 응답됨
                                                    </p>
                                                </div>
                                            )}

                                            <div className="mt-2">
                                                <Link to={`/proposals/advertiser/direct/${proposal.proposal_id}`}>
                                                    <Button variant="outline" size="sm" className="w-full">
                                                        상세 보기
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* 인플루언서 정보 */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>인플루언서 정보</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3 mb-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback>
                                        {proposal.influencer.name?.substring(0, 2) || "??"}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-medium">{proposal.influencer.name}</h3>
                                    <p className="text-sm text-muted-foreground">@{proposal.influencer.username}</p>
                                </div>
                            </div>

                            {proposal.influencer.influencer_profile?.introduction && (
                                <div className="mb-4">
                                    <p className="text-sm whitespace-pre-line">{proposal.influencer.influencer_profile.introduction}</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                {proposal.influencer.influencer_profile?.location && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">위치:</span>
                                        <span className="text-sm text-muted-foreground">{proposal.influencer.influencer_profile.location}</span>
                                    </div>
                                )}

                                {proposal.influencer.influencer_profile?.birth_year && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">출생년도:</span>
                                        <span className="text-sm text-muted-foreground">{proposal.influencer.influencer_profile.birth_year}년</span>
                                    </div>
                                )}

                                {proposal.influencer.influencer_profile?.gender && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">성별:</span>
                                        <span className="text-sm text-muted-foreground">
                                            {proposal.influencer.influencer_profile.gender === 'MALE' ? '남성' :
                                                proposal.influencer.influencer_profile.gender === 'FEMALE' ? '여성' : '기타'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-2">
                                {proposal.influencer.influencer_profile?.instagram_handle && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">인스타그램:</span>
                                        <a
                                            href={`https://instagram.com/${proposal.influencer.influencer_profile.instagram_handle}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            @{proposal.influencer.influencer_profile.instagram_handle}
                                        </a>
                                    </div>
                                )}

                                {proposal.influencer.influencer_profile?.youtube_handle && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">유튜브:</span>
                                        <a
                                            href={`https://youtube.com/@${proposal.influencer.influencer_profile.youtube_handle}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            @{proposal.influencer.influencer_profile.youtube_handle}
                                        </a>
                                    </div>
                                )}

                                {proposal.influencer.influencer_profile?.tiktok_handle && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">틱톡:</span>
                                        <a
                                            href={`https://tiktok.com/@${proposal.influencer.influencer_profile.tiktok_handle}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            @{proposal.influencer.influencer_profile.tiktok_handle}
                                        </a>
                                    </div>
                                )}

                                {proposal.influencer.influencer_profile?.blog_url && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">블로그:</span>
                                        <a
                                            href={proposal.influencer.influencer_profile.blog_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline truncate max-w-[200px]"
                                        >
                                            {proposal.influencer.influencer_profile.blog_url}
                                        </a>
                                    </div>
                                )}
                            </div>

                            {proposal.influencer.influencer_profile?.followers_count &&
                                typeof proposal.influencer.influencer_profile.followers_count === 'object' && (
                                    <>
                                        <Separator className="my-4" />
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium">팔로워 수</h4>
                                            <div className="space-y-1">
                                                {Object.entries(proposal.influencer.influencer_profile.followers_count as Record<string, number>).map(([platform, count]) => (
                                                    <div key={platform} className="flex justify-between">
                                                        <span className="text-sm text-muted-foreground">{platform}</span>
                                                        <span className="text-sm font-medium">{count.toLocaleString()}명</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                            {proposal.influencer.influencer_profile?.categories && proposal.influencer.influencer_profile.categories.length > 0 && (
                                <>
                                    <Separator className="my-4" />
                                    <div>
                                        <h4 className="text-sm font-medium mb-2">전문 분야</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {proposal.influencer.influencer_profile.categories.map((category: string, index: number) => (
                                                <Badge key={index} variant="outline">{category}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {proposal.influencer.influencer_profile?.portfolio_urls && proposal.influencer.influencer_profile.portfolio_urls.length > 0 && (
                                <>
                                    <Separator className="my-4" />
                                    <div>
                                        <h4 className="text-sm font-medium mb-2">포트폴리오</h4>
                                        <div className="space-y-1">
                                            {proposal.influencer.influencer_profile.portfolio_urls.map((url: string, index: number) => (
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
                </div>
            </div>

            {/* 신청 다이얼로그 */}
            <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>제안 신청하기</DialogTitle>
                        <DialogDescription>
                            이 제안에 신청하려면 메시지를 작성해주세요.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="인플루언서에게 전달할 메시지를 입력하세요"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="min-h-[150px]"
                    />
                    {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsApplyDialogOpen(false)}>
                            취소
                        </Button>
                        <Button
                            onClick={() => handleSubmit("apply")}
                            disabled={isSubmitting || !message.trim()}
                        >
                            {isSubmitting ? "처리 중..." : "신청하기"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 직접 제안 다이얼로그 */}
            <Dialog open={isDirectProposalDialogOpen} onOpenChange={setIsDirectProposalDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>인플루언서에게 역제안하기</DialogTitle>
                        <DialogDescription>
                            인플루언서의 제안에 대한 역제안을 보내려면 아래 정보를 작성해주세요.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="title" className="text-right text-sm font-medium">
                                제안 제목
                            </label>
                            <input
                                id="title"
                                name="title"
                                defaultValue={`${proposal.title}에 대한 역제안`}
                                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="budget" className="text-right text-sm font-medium">
                                예산 (원)
                            </label>
                            <input
                                id="budget"
                                name="budget"
                                type="number"
                                defaultValue={proposal.desired_budget}
                                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="target_market" className="text-right text-sm font-medium">
                                대상 시장
                            </label>
                            <select
                                id="target_market"
                                name="target_market"
                                defaultValue={proposal.target_market}
                                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="KR">한국</option>
                                <option value="JP">일본</option>
                                <option value="BOTH">한국/일본</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="content_type" className="text-right text-sm font-medium">
                                콘텐츠 유형
                            </label>
                            <select
                                id="content_type"
                                name="content_type"
                                defaultValue={proposal.content_type}
                                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                {Object.entries(CONTENT_TYPE_LABELS).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="campaign_start_date" className="text-right text-sm font-medium">
                                캠페인 시작일
                            </label>
                            <input
                                id="campaign_start_date"
                                name="campaign_start_date"
                                type="date"
                                defaultValue={new Date().toISOString().split('T')[0]}
                                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="campaign_end_date" className="text-right text-sm font-medium">
                                캠페인 종료일
                            </label>
                            <input
                                id="campaign_end_date"
                                name="campaign_end_date"
                                type="date"
                                defaultValue={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="is_negotiable" className="text-right text-sm font-medium">
                                협상 가능 여부
                            </label>
                            <div className="col-span-3 flex items-center">
                                <input
                                    id="is_negotiable"
                                    name="is_negotiable"
                                    type="checkbox"
                                    defaultChecked={true}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <label htmlFor="is_negotiable" className="ml-2 text-sm">
                                    협상 가능
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-start gap-4">
                            <label htmlFor="description" className="text-right text-sm font-medium pt-2">
                                제안 설명
                            </label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="인플루언서에게 전달할 제안 내용을 입력하세요"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="col-span-3 min-h-[150px]"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-start gap-4">
                            <label htmlFor="requirements" className="text-right text-sm font-medium pt-2">
                                요구사항
                            </label>
                            <Textarea
                                id="requirements"
                                name="requirements"
                                placeholder="콘텐츠 제작에 대한 요구사항을 입력하세요 (쉼표로 구분)"
                                className="col-span-3 min-h-[100px]"
                            />
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDirectProposalDialogOpen(false)}>
                            취소
                        </Button>
                        <Button
                            onClick={() => handleSubmitDirectProposal()}
                            disabled={isSubmitting || !message.trim()}
                        >
                            {isSubmitting ? "처리 중..." : "역제안 보내기"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export async function action({ request, params }: Route.ActionArgs) {
    const formData = await request.formData();
    const action = formData.get("action") as string;
    const message = formData.get("message") as string;

    if (!message || message.trim() === "") {
        return { error: "메시지를 입력해주세요" };
    }

    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

    if (action === "apply") {
        // 제안 신청 생성
        const { data, error } = await supabase
            .from("proposal_applications")
            .insert({
                proposal_id: params.proposalId,
                advertiser_id: user.id,
                message,
                applied_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            return { error: "제안 신청에 실패했습니다" };
        }

        // 인플루언서에게 알림 보내기 (추후 구현)
        // await supabase.from("notifications").insert({
        //     user_id: data.influencer_id,
        //     message: `새로운 제안 신청이 도착했습니다: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
        //     sent_at: new Date().toISOString()
        // });

        return { success: true, applicationId: data.application_id };
    } else if (action === "direct_proposal") {
        // 인플루언서 정보 가져오기
        const { data: proposalData } = await supabase
            .from("influencer_proposals")
            .select(`
                influencer_id, 
                title, 
                target_market, 
                content_type, 
                categories,
                desired_budget,
                keywords
            `)
            .eq("proposal_id", params.proposalId)
            .single();

        if (!proposalData) {
            return { error: "제안 정보를 찾을 수 없습니다" };
        }

        // 직접 제안 생성
        const { data, error } = await supabase
            .from("advertiser_proposals")
            .insert({
                advertiser_id: user.id,
                influencer_id: proposalData.influencer_id,
                title: `${proposalData.title}에 대한 역제안`,
                description: message,
                budget: proposalData.desired_budget || 0, // 인플루언서가 원하는 예산을 기본값으로 설정, 없으면 0
                target_market: proposalData.target_market,
                content_type: proposalData.content_type,
                requirements: [], // 초기에는 빈 배열, 추후 수정 페이지에서 설정
                campaign_start_date: new Date().toISOString(),
                campaign_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30일 후
                categories: proposalData.categories || [], // 없으면 빈 배열
                keywords: proposalData.keywords || [],
                reference_urls: [], // 초기에는 빈 배열
                is_negotiable: true, // 협의 가능으로 설정
                proposal_status: ADVERTISER_PROPOSAL_STATUS.SENT,
                message: message,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            return { error: "직접 제안 생성에 실패했습니다" };
        }

        // 인플루언서에게 알림 보내기 (추후 구현)
        // await supabase.from("notifications").insert({
        //     user_id: proposalData.influencer_id,
        //     message: `새로운 역제안이 도착했습니다: ${data.title}`,
        //     sent_at: new Date().toISOString()
        // });

        return { success: true, directProposalId: data.proposal_id };
    }

    return { error: "잘못된 요청입니다" };
}

export const meta: Route.MetaFunction = () => {
    return [
        { title: "인플루언서 제안 상세 | CROSSPHERE" },
        { description: "인플루언서의 제안 상세 정보를 확인하고 협업을 신청하세요." },
    ];
};