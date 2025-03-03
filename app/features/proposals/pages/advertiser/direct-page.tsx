import { Link } from "react-router";
import { getServerClient } from "~/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import { Button } from "~/common/components/ui/button";
import { CalendarIcon, ExternalLinkIcon, PlusIcon } from "lucide-react";
import { PROPOSAL_STATUS, TARGET_MARKET } from "../../constants";
import type { Route } from "./+types/direct-page";

/**
 * @description 광고주가 인플루언서에게 직접 제안한 목록을 보여주는 페이지
 */
export const loader = async ({ request }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

    // 내가 보낸 직접 제안 목록 가져오기
    const { data: myDirectProposals } = await supabase
        .from("advertiser_proposals")
        .select(`
            *,
            influencer:profiles!influencer_id (
                name,
                username,
                avatar_url
            )
        `)
        .eq("advertiser_id", user.id)
        .order("created_at", { ascending: false });

    // 각 제안에 대한 응답 정보 가져오기
    let directProposalsWithResponses: Array<any> = [];

    if (myDirectProposals && myDirectProposals.length > 0) {
        // 모든 제안 ID 목록
        const proposalIds = myDirectProposals.map(p => p.proposal_id);

        // 응답 정보 가져오기
        const { data: responses } = await supabase
            .from("advertiser_proposal_responses")
            .select("*")
            .in("proposal_id", proposalIds);

        // 제안과 응답 정보 합치기
        directProposalsWithResponses = myDirectProposals.map((proposal: any) => {
            const response = responses?.find(r => r.proposal_id === proposal.proposal_id) || null;
            return {
                ...proposal,
                response
            };
        });
    }

    return {
        myDirectProposals: directProposalsWithResponses
    };
};

export default function DirectPage({ loaderData }: Route.ComponentProps) {
    const { myDirectProposals } = loaderData;

    const getStatusColor = (status: string) => {
        switch (status) {
            case PROPOSAL_STATUS.PUBLISHED:
                return "bg-green-500";
            case "PENDING":
                return "bg-yellow-500";
            case PROPOSAL_STATUS.REJECTED:
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };

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

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">내 직접 제안</h1>
                    <p className="text-muted-foreground mt-1">인플루언서에게 직접 제안한 협업 내역을 확인하세요</p>
                </div>
            </div>

            {myDirectProposals.length === 0 ? (
                <div className="text-center py-12 bg-muted rounded-lg">
                    <h3 className="text-lg font-medium mb-2">아직 직접 제안한 내역이 없습니다</h3>
                    <p className="text-muted-foreground mb-4">인플루언서 프로필 페이지에서 직접 협업을 제안해보세요</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {myDirectProposals.map((proposal: any) => (
                        <Card key={proposal.proposal_id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-center justify-between mb-2">
                                    <Badge className={getStatusColor(proposal.proposal_status)}>
                                        {proposal.proposal_status}
                                    </Badge>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <CalendarIcon className="h-4 w-4 mr-1" />
                                        {formatDate(proposal.created_at)}
                                    </div>
                                </div>
                                <CardTitle className="line-clamp-1">{proposal.title}</CardTitle>
                                <CardDescription className="line-clamp-2">
                                    {proposal.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium">예산</p>
                                            <p className="text-lg font-bold">
                                                {proposal.budget.toLocaleString()}원
                                                {proposal.is_negotiable && (
                                                    <span className="ml-2 text-sm text-gray-500">(협의 가능)</span>
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-right">대상 시장</p>
                                            <p className="text-right">{getTargetMarketLabel(proposal.target_market)}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">제안 대상 인플루언서</p>
                                        <div className="flex items-center mt-1">
                                            <Avatar className="h-8 w-8 mr-2">
                                                <AvatarImage src={proposal.influencer?.avatar_url || ""} />
                                                <AvatarFallback>
                                                    {proposal.influencer?.name?.charAt(0) || "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <p>{proposal.influencer?.name || "알 수 없음"}</p>
                                        </div>
                                    </div>
                                    {proposal.response && (
                                        <div>
                                            <p className="text-sm font-medium">인플루언서 응답</p>
                                            <Badge className={
                                                proposal.response.is_accepted ? "bg-green-500" :
                                                    proposal.response.is_rejected ? "bg-red-500" : "bg-yellow-500"
                                            }>
                                                {proposal.response.is_accepted ? "수락됨" :
                                                    proposal.response.is_rejected ? "거절됨" : "검토 중"}
                                            </Badge>
                                            {proposal.response.message && (
                                                <p className="text-sm mt-1 bg-muted p-2 rounded-md">
                                                    {proposal.response.message}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button asChild variant="outline" className="w-full">
                                    <Link to={`/proposals/advertiser/${proposal.proposal_id}`}>
                                        자세히 보기
                                        <ExternalLinkIcon className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
} 