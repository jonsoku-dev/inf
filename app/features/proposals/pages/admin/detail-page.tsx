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
import { formatCurrency, formatDate } from "~/lib/utils";
import {
    PROPOSAL_STATUS,
    PROPOSAL_STATUS_LABELS,
    TARGET_MARKET,
    TARGET_MARKET_LABELS,
    CONTENT_TYPE_LABELS,
    ADVERTISER_PROPOSAL_STATUS,
    ADVERTISER_PROPOSAL_STATUS_LABELS,
    PROPOSAL_APPLICATION_STATUS,
    PROPOSAL_APPLICATION_STATUS_LABELS
} from "../../constants";
import type { Route } from "./+types/detail-page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/common/components/ui/tabs";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

// 인플루언서 제안서 타입 정의
interface InfluencerProposal {
    proposal_id: string;
    influencer_id: string;
    title: string;
    description: string;
    desired_budget: number;
    target_market: string;
    content_type: string;
    expected_deliverables: string[];
    available_period_start: string;
    available_period_end: string;
    categories: string[];
    keywords: string[];
    portfolio_samples?: string[];
    is_negotiable: boolean;
    preferred_industry?: string[];
    proposal_status: string;
    created_at: string;
    updated_at: string;
    influencer: {
        name: string;
        username: string;
    };
}

// 광고주 제안서 타입 정의
interface AdvertiserProposal {
    proposal_id: string;
    advertiser_id: string;
    influencer_id: string;
    title: string;
    description: string;
    budget: number;
    target_market: string;
    content_type: string;
    requirements: string[];
    campaign_start_date: string;
    campaign_end_date: string;
    categories: string[];
    keywords?: string[];
    reference_urls?: string[];
    is_negotiable: boolean;
    proposal_status: string;
    message?: string;
    created_at: string;
    updated_at: string;
    advertiser: {
        name: string;
        username: string;
    };
    influencer: {
        name: string;
        username: string;
    };
}

// 타입 가드 함수
function isInfluencerProposalType(proposal: InfluencerProposal | AdvertiserProposal): proposal is InfluencerProposal {
    return 'desired_budget' in proposal;
}

function isAdvertiserProposalType(proposal: InfluencerProposal | AdvertiserProposal): proposal is AdvertiserProposal {
    return 'budget' in proposal;
}

export async function loader({ request, params }: Route.LoaderArgs) {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    const proposalId = params.id;

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

    // 사용자 프로필 정보 가져오기
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("profile_id", user.id)
        .single();

    // 관리자 권한 확인
    if (profile?.role !== "ADMIN") {
        throw new Error("관리자 권한이 필요합니다");
    }

    // 인플루언서 제안서 확인
    const { data: influencerProposal } = await supabase
        .from("influencer_proposals")
        .select(`
            *,
            influencer:profiles (
                name,
                username
            )
        `)
        .eq("proposal_id", proposalId)
        .single();

    // 광고주 직접 제안서 확인
    const { data: advertiserProposal } = await supabase
        .from("advertiser_proposals")
        .select(`
            *,
            advertiser:profiles!advertiser_id (
                name,
                username
            ),
            influencer:profiles!influencer_id (
                name,
                username
            )
        `)
        .eq("proposal_id", proposalId)
        .single();

    // 제안서가 존재하지 않는 경우
    if (!influencerProposal && !advertiserProposal) {
        throw new Error("제안서를 찾을 수 없습니다");
    }

    const isInfluencerProposal = !!influencerProposal;
    const proposal = isInfluencerProposal ? influencerProposal : advertiserProposal;

    if (!proposal) {
        throw new Error("제안서를 찾을 수 없습니다");
    }

    // 인플루언서 제안서인 경우 신청 목록 가져오기
    let applications: any[] = [];
    if (isInfluencerProposal) {
        const { data: proposalApplications } = await supabase
            .from("proposal_applications")
            .select(`
                *,
                advertiser:profiles!advertiser_id (
                    name,
                    username
                )
            `)
            .eq("proposal_id", proposalId)
            .order("applied_at", { ascending: false });

        applications = proposalApplications || [];
    }

    return {
        proposal,
        applications,
        isInfluencerProposal
    };
}

export async function action({ request, params }: Route.ActionArgs) {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    const proposalId = params.id;

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

    // 사용자 프로필 정보 가져오기
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("profile_id", user.id)
        .single();

    // 관리자 권한 확인
    if (profile?.role !== "ADMIN") {
        throw new Error("관리자 권한이 필요합니다");
    }

    const formData = await request.formData();
    const action = formData.get("_action") as string;

    if (action === "updateStatus") {
        const newStatus = formData.get("newStatus") as string;
        const comment = formData.get("comment") as string;
        const isInfluencerProposal = formData.get("isInfluencerProposal") === "true";

        if (isInfluencerProposal) {
            // 인플루언서 제안서 상태 업데이트
            const { error } = await supabase
                .from("influencer_proposals")
                .update({
                    proposal_status: newStatus as any,
                    updated_at: new Date().toISOString()
                })
                .eq("proposal_id", proposalId);

            if (error) {
                throw new Error("제안서 상태 업데이트에 실패했습니다");
            }
        } else {
            // 광고주 직접 제안서 상태 업데이트
            const { error } = await supabase
                .from("advertiser_proposals")
                .update({
                    proposal_status: newStatus as any,
                    updated_at: new Date().toISOString()
                })
                .eq("proposal_id", proposalId);

            if (error) {
                throw new Error("제안서 상태 업데이트에 실패했습니다");
            }
        }

        // TODO: 필요한 경우 관리자 코멘트 저장 로직 추가

        return { success: true };
    }

    throw new Error("지원하지 않는 액션입니다");
}

export const meta: Route.MetaFunction = () => {
    return [
        { title: "제안서 상세 - 관리자 페이지" },
        { name: "description", content: "제안서 상세 정보를 확인하고 관리합니다" },
    ];
};

export default function DetailPage({ loaderData }: Route.ComponentProps) {
    const { proposal, applications, isInfluencerProposal } = loaderData;
    const navigate = useNavigate();
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const [newStatus, setNewStatus] = useState<string>("");
    const [statusComment, setStatusComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 타입 단언
    const typedProposal = proposal as InfluencerProposal | AdvertiserProposal;

    // 상태 변경 다이얼로그 열기
    const openStatusDialog = (status: string) => {
        setNewStatus(status);
        setStatusComment("");
        setIsStatusDialogOpen(true);
    };

    // 상태 변경 처리
    const handleStatusChange = async () => {
        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("_action", "updateStatus");
            formData.append("proposalId", proposal.proposal_id);
            formData.append("newStatus", newStatus);
            formData.append("comment", statusComment);
            formData.append("isInfluencerProposal", isInfluencerProposal.toString());

            const response = await fetch(`/admin/proposals/${proposal.proposal_id}`, {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                throw new Error("상태 변경에 실패했습니다");
            }

            alert("제안서 상태가 성공적으로 변경되었습니다.");

            // 페이지 새로고침
            navigate(`/admin/proposals/${proposal.proposal_id}`);
        } catch (error) {
            console.error("상태 변경 오류:", error);
            alert("상태 변경 중 오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
            setIsSubmitting(false);
            setIsStatusDialogOpen(false);
        }
    };

    // 제안서 상태에 따른 배지 색상
    const getStatusBadgeColor = (status: string | null) => {
        if (!status) return "bg-gray-200 text-gray-700";

        switch (status) {
            case PROPOSAL_STATUS.PUBLISHED:
                return "bg-green-500";
            case PROPOSAL_STATUS.CLOSED:
                return "bg-gray-500";
            case PROPOSAL_STATUS.REJECTED:
                return "bg-red-500";
            case ADVERTISER_PROPOSAL_STATUS.SENT:
                return "bg-blue-500";
            case ADVERTISER_PROPOSAL_STATUS.ACCEPTED:
                return "bg-green-500";
            case ADVERTISER_PROPOSAL_STATUS.REJECTED:
                return "bg-red-500";
            case ADVERTISER_PROPOSAL_STATUS.COMPLETED:
                return "bg-purple-500";
            case ADVERTISER_PROPOSAL_STATUS.CANCELLED:
                return "bg-gray-500";
            default:
                return "bg-yellow-500";
        }
    };

    // 신청 상태에 따른 배지 색상
    const getApplicationStatusBadgeColor = (status: string) => {
        switch (status) {
            case PROPOSAL_APPLICATION_STATUS.ACCEPTED:
                return "bg-green-500";
            case PROPOSAL_APPLICATION_STATUS.REJECTED:
                return "bg-red-500";
            case PROPOSAL_APPLICATION_STATUS.COMPLETED:
                return "bg-purple-500";
            case PROPOSAL_APPLICATION_STATUS.CANCELLED:
                return "bg-gray-500";
            default:
                return "bg-yellow-500";
        }
    };

    return (
        <div className="container mx-auto py-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">제안서 상세</h1>
                    <p className="text-muted-foreground mt-1">
                        {isInfluencerProposal ? "인플루언서 제안서" : "광고주 직접 제안서"} 상세 정보
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link to="/admin/proposals">
                        <Button variant="outline">목록으로</Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 제안서 정보 */}
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between mb-2">
                                <Badge className={getStatusBadgeColor(
                                    typedProposal.proposal_status || ""
                                )}>
                                    {isInfluencerProposal
                                        ? PROPOSAL_STATUS_LABELS[typedProposal.proposal_status as keyof typeof PROPOSAL_STATUS_LABELS]
                                        : ADVERTISER_PROPOSAL_STATUS_LABELS[typedProposal.proposal_status as keyof typeof ADVERTISER_PROPOSAL_STATUS_LABELS]}
                                </Badge>
                                <Badge variant="outline">
                                    {TARGET_MARKET_LABELS[typedProposal.target_market as keyof typeof TARGET_MARKET_LABELS]}
                                </Badge>
                            </div>
                            <CardTitle className="text-xl">{typedProposal.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="font-medium mb-2">설명</h3>
                                <p className="whitespace-pre-wrap">{typedProposal.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-medium mb-2">예산</h3>
                                    <p className="text-lg font-bold">
                                        {isInfluencerProposal && isInfluencerProposalType(typedProposal)
                                            ? formatCurrency(typedProposal.desired_budget)
                                            : isAdvertiserProposalType(typedProposal)
                                                ? formatCurrency(typedProposal.budget)
                                                : formatCurrency(0)}
                                        {typedProposal.is_negotiable && (
                                            <span className="ml-2 text-sm text-gray-500">(협의 가능)</span>
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-medium mb-2">콘텐츠 유형</h3>
                                    <p>{CONTENT_TYPE_LABELS[typedProposal.content_type as keyof typeof CONTENT_TYPE_LABELS]}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {isInfluencerProposal && isInfluencerProposalType(typedProposal) ? (
                                    <>
                                        <div>
                                            <h3 className="font-medium mb-2">가능 기간</h3>
                                            <p>{formatDate(typedProposal.available_period_start)} ~ {formatDate(typedProposal.available_period_end)}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-medium mb-2">예상 결과물</h3>
                                            <ul className="list-disc pl-5">
                                                {typedProposal.expected_deliverables.map((item: string, index: number) => (
                                                    <li key={index}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </>
                                ) : isAdvertiserProposalType(typedProposal) && (
                                    <>
                                        <div>
                                            <h3 className="font-medium mb-2">캠페인 기간</h3>
                                            <p>{formatDate(typedProposal.campaign_start_date)} ~ {formatDate(typedProposal.campaign_end_date)}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-medium mb-2">요구사항</h3>
                                            <ul className="list-disc pl-5">
                                                {typedProposal.requirements.map((item: string, index: number) => (
                                                    <li key={index}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div>
                                <h3 className="font-medium mb-2">카테고리</h3>
                                <div className="flex flex-wrap gap-2">
                                    {typedProposal.categories.map((category: string) => (
                                        <Badge key={category} variant="outline">
                                            {category}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium mb-2">키워드</h3>
                                <div className="flex flex-wrap gap-2">
                                    {typedProposal.keywords && typedProposal.keywords.map((keyword: string) => (
                                        <Badge key={keyword} variant="secondary">
                                            {keyword}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {!isInfluencerProposal && isAdvertiserProposalType(typedProposal) && typedProposal.message && (
                                <div>
                                    <h3 className="font-medium mb-2">메시지</h3>
                                    <p className="whitespace-pre-wrap">{typedProposal.message}</p>
                                </div>
                            )}

                            <div className="pt-4">
                                <h3 className="font-medium mb-2">관리자 작업</h3>
                                <div className="flex flex-wrap gap-2">
                                    {isInfluencerProposal && isInfluencerProposalType(typedProposal) ? (
                                        <>
                                            {typedProposal.proposal_status === PROPOSAL_STATUS.DRAFT && (
                                                <Button onClick={() => openStatusDialog(PROPOSAL_STATUS.PUBLISHED)}>
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    공개하기
                                                </Button>
                                            )}
                                            {typedProposal.proposal_status === PROPOSAL_STATUS.PUBLISHED && (
                                                <Button onClick={() => openStatusDialog(PROPOSAL_STATUS.CLOSED)}>
                                                    <XCircle className="mr-2 h-4 w-4" />
                                                    마감하기
                                                </Button>
                                            )}
                                            {(typedProposal.proposal_status === PROPOSAL_STATUS.DRAFT ||
                                                typedProposal.proposal_status === PROPOSAL_STATUS.PUBLISHED) && (
                                                    <Button variant="destructive" onClick={() => openStatusDialog(PROPOSAL_STATUS.REJECTED)}>
                                                        <AlertCircle className="mr-2 h-4 w-4" />
                                                        거절하기
                                                    </Button>
                                                )}
                                        </>
                                    ) : (
                                        <>
                                            {typedProposal.proposal_status === ADVERTISER_PROPOSAL_STATUS.DRAFT && (
                                                <Button onClick={() => openStatusDialog(ADVERTISER_PROPOSAL_STATUS.SENT)}>
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    전송 승인
                                                </Button>
                                            )}
                                            {typedProposal.proposal_status === ADVERTISER_PROPOSAL_STATUS.SENT && (
                                                <Button onClick={() => openStatusDialog(ADVERTISER_PROPOSAL_STATUS.CANCELLED)}>
                                                    <XCircle className="mr-2 h-4 w-4" />
                                                    취소하기
                                                </Button>
                                            )}
                                            {(typedProposal.proposal_status === ADVERTISER_PROPOSAL_STATUS.DRAFT) && (
                                                <Button variant="destructive" onClick={() => openStatusDialog(ADVERTISER_PROPOSAL_STATUS.REJECTED)}>
                                                    <AlertCircle className="mr-2 h-4 w-4" />
                                                    거절하기
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 사용자 정보 */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {isInfluencerProposal ? "인플루언서 정보" : "사용자 정보"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isInfluencerProposal ? (
                                <div>
                                    <h3 className="font-medium mb-2">인플루언서</h3>
                                    <div className="flex items-center">
                                        <Avatar className="h-10 w-10 mr-3">
                                            <AvatarFallback>{typedProposal.influencer?.name?.charAt(0) || "?"}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{typedProposal.influencer?.name}</p>
                                            <p className="text-sm text-muted-foreground">@{typedProposal.influencer?.username}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <h3 className="font-medium mb-2">광고주</h3>
                                        <div className="flex items-center">
                                            <Avatar className="h-10 w-10 mr-3">
                                                <AvatarFallback>
                                                    {!isInfluencerProposal && isAdvertiserProposalType(typedProposal)
                                                        ? (typedProposal.advertiser?.name?.charAt(0) || "?")
                                                        : "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">
                                                    {!isInfluencerProposal && isAdvertiserProposalType(typedProposal)
                                                        ? typedProposal.advertiser?.name
                                                        : ""}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    @{!isInfluencerProposal && isAdvertiserProposalType(typedProposal)
                                                        ? typedProposal.advertiser?.username
                                                        : ""}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div>
                                        <h3 className="font-medium mb-2">인플루언서</h3>
                                        <div className="flex items-center">
                                            <Avatar className="h-10 w-10 mr-3">
                                                <AvatarFallback>{typedProposal.influencer?.name?.charAt(0) || "?"}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{typedProposal.influencer?.name}</p>
                                                <p className="text-sm text-muted-foreground">@{typedProposal.influencer?.username}</p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                            <Separator />
                            <div>
                                <h3 className="font-medium mb-2">등록일</h3>
                                <p>{formatDate(typedProposal.created_at)}</p>
                            </div>
                            <div>
                                <h3 className="font-medium mb-2">최종 수정일</h3>
                                <p>{formatDate(typedProposal.updated_at)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 신청 목록 */}
                    {isInfluencerProposal && applications && applications.length > 0 && (
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="text-lg">신청 목록</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {applications.map((application: any) => (
                                        <div key={application.application_id} className="border rounded-md p-3">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center">
                                                    <Avatar className="h-8 w-8 mr-2">
                                                        <AvatarFallback>{application.advertiser?.name?.charAt(0) || "?"}</AvatarFallback>
                                                    </Avatar>
                                                    <p className="font-medium">{application.advertiser?.name}</p>
                                                </div>
                                                <Badge className={getApplicationStatusBadgeColor(application.proposal_application_status)}>
                                                    {PROPOSAL_APPLICATION_STATUS_LABELS[application.proposal_application_status as keyof typeof PROPOSAL_APPLICATION_STATUS_LABELS]}
                                                </Badge>
                                            </div>
                                            <p className="text-sm mb-2 line-clamp-2">{application.message}</p>
                                            <p className="text-xs text-muted-foreground">
                                                신청일: {formatDate(application.applied_at)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* 상태 변경 다이얼로그 */}
            <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>제안서 상태 변경</DialogTitle>
                        <DialogDescription>
                            제안서 상태를 변경하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <h4 className="font-medium mb-2">변경할 상태:</h4>
                        <Badge className={getStatusBadgeColor(newStatus)}>
                            {isInfluencerProposal
                                ? PROPOSAL_STATUS_LABELS[newStatus as keyof typeof PROPOSAL_STATUS_LABELS]
                                : ADVERTISER_PROPOSAL_STATUS_LABELS[newStatus as keyof typeof ADVERTISER_PROPOSAL_STATUS_LABELS]}
                        </Badge>

                        <div className="mt-4">
                            <label htmlFor="comment" className="block text-sm font-medium mb-2">
                                관리자 코멘트 (선택사항)
                            </label>
                            <Textarea
                                id="comment"
                                placeholder="상태 변경에 대한 코멘트를 입력하세요"
                                value={statusComment}
                                onChange={(e) => setStatusComment(e.target.value)}
                                className="w-full"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                            취소
                        </Button>
                        <Button onClick={handleStatusChange} disabled={isSubmitting}>
                            {isSubmitting ? "처리 중..." : "확인"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}