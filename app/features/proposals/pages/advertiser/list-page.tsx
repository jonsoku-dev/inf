import { useCallback } from "react";
import { Link } from "react-router";
import { Badge } from "~/common/components/ui/badge";
import { Button } from "~/common/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "~/common/components/ui/card";
import { formatCurrency } from "~/lib/utils";
import { getServerClient } from "~/server";
import { PROPOSAL_STATUS, TARGET_MARKET, CONTENT_TYPE_LABELS } from "../../constants";
import type { Route } from "./+types/list-page";

interface ListPageProps extends Route.ComponentProps { }

export default function ListPage({ loaderData }: ListPageProps) {
    const { proposals, myDirectProposals } = loaderData;

    const getStatusBadgeColor = useCallback((status: typeof PROPOSAL_STATUS[keyof typeof PROPOSAL_STATUS]) => {
        switch (status) {
            case PROPOSAL_STATUS.PUBLISHED:
                return "bg-green-500";
            case PROPOSAL_STATUS.CLOSED:
                return "bg-gray-500";
            case PROPOSAL_STATUS.REJECTED:
                return "bg-red-500";
            default:
                return "bg-yellow-500";
        }
    }, []);

    const getTargetMarketLabel = useCallback((market: typeof TARGET_MARKET[keyof typeof TARGET_MARKET]) => {
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
    }, []);

    return (
        <div className="container mx-auto py-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">인플루언서 제안 목록</h1>
                    <p className="text-muted-foreground mt-1">인플루언서들이 제안한 협업 아이디어를 확인하세요</p>
                </div>
                <div className="flex gap-3">
                    <Button asChild variant="outline">
                        <Link to="/proposals/advertiser/applications">내 신청 목록</Link>
                    </Button>
                    <Button asChild>
                        <Link to="/proposals/advertiser/direct">내 직접 제안</Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {proposals.map((proposal) => (
                    <Card key={proposal.proposal_id}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <Badge className={getStatusBadgeColor(proposal.proposal_status as keyof typeof PROPOSAL_STATUS)}>
                                    {proposal.proposal_status}
                                </Badge>
                                <Badge variant="outline">
                                    {getTargetMarketLabel(proposal.target_market)}
                                </Badge>
                            </div>
                            <CardTitle className="mt-2">{proposal.title}</CardTitle>
                            <CardDescription className="line-clamp-2">
                                {proposal.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium">예산</p>
                                    <p className="text-lg font-bold">
                                        {formatCurrency(proposal.desired_budget)}
                                        {proposal.is_negotiable && (
                                            <span className="ml-2 text-sm text-gray-500">(협의 가능)</span>
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">콘텐츠 유형</p>
                                    <p>{CONTENT_TYPE_LABELS[proposal.content_type as keyof typeof CONTENT_TYPE_LABELS]}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">인플루언서</p>
                                    <p className="text-sm">{proposal.influencer?.name || "알 수 없음"}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">카테고리</p>
                                    <div className="flex flex-wrap gap-2">
                                        {proposal.categories.map((category) => (
                                            <Badge key={category} variant="outline">
                                                {category}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <Link to={`/proposals/advertiser/${proposal.proposal_id}`}>
                                        <Button className="w-full">자세히 보기</Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {proposals.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-muted/50 rounded-lg">
                        <p className="text-muted-foreground">등록된 제안이 없습니다</p>
                    </div>
                )}
            </div>

            {myDirectProposals && myDirectProposals.length > 0 && (
                <>
                    <div className="mt-12 mb-6">
                        <h2 className="text-xl font-semibold">내가 보낸 직접 제안</h2>
                        <p className="text-muted-foreground mt-1">인플루언서에게 직접 보낸 제안 목록입니다</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {myDirectProposals.map((proposal) => (
                            <Card key={proposal.proposal_id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <Badge className="bg-purple-500">
                                            {proposal.proposal_status}
                                        </Badge>
                                        <Badge variant="outline">
                                            {getTargetMarketLabel(proposal.target_market)}
                                        </Badge>
                                    </div>
                                    <CardTitle className="mt-2">{proposal.title}</CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {proposal.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium">예산</p>
                                            <p className="text-lg font-bold">
                                                {formatCurrency(proposal.budget)}
                                                {proposal.is_negotiable && (
                                                    <span className="ml-2 text-sm text-gray-500">(협의 가능)</span>
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">콘텐츠 유형</p>
                                            <p>{CONTENT_TYPE_LABELS[proposal.content_type as keyof typeof CONTENT_TYPE_LABELS]}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">인플루언서</p>
                                            <p className="text-sm">{proposal.influencer?.name || "알 수 없음"}</p>
                                        </div>
                                        <div className="pt-4">
                                            <Link to={`/proposals/advertiser/direct/${proposal.proposal_id}`}>
                                                <Button className="w-full" variant="outline">자세히 보기</Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export async function loader({ request }: Route.LoaderArgs) {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

    // 인플루언서 제안 목록 가져오기
    const { data: proposals, error } = await supabase
        .from("influencer_proposals")
        .select(`
            *,
            influencer:profiles (
                name
            )
        `)
        .eq("proposal_status", PROPOSAL_STATUS.PUBLISHED)
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error("제안 목록을 불러오는데 실패했습니다.");
    }

    // 내가 보낸 직접 제안 목록 가져오기
    const { data: myDirectProposals } = await supabase
        .from("advertiser_proposals")
        .select(`
            *,
            influencer:profiles!influencer_id (
                name
            )
        `)
        .eq("advertiser_id", user.id)
        .order("created_at", { ascending: false });

    // 각 제안에 대한 응답 정보 가져오기
    let directProposalsWithResponses = [];

    if (myDirectProposals && myDirectProposals.length > 0) {
        // 모든 제안 ID 목록
        const proposalIds = myDirectProposals.map(p => p.proposal_id);

        // 응답 정보 가져오기
        const { data: responses } = await supabase
            .from("advertiser_proposal_responses")
            .select("*")
            .in("proposal_id", proposalIds);

        // 제안과 응답 정보 합치기
        directProposalsWithResponses = myDirectProposals.map(proposal => {
            const proposalResponses = responses ? responses.filter(r => r.proposal_id === proposal.proposal_id) : [];
            return {
                ...proposal,
                responses: proposalResponses
            };
        });
    }

    return {
        proposals: proposals || [],
        myDirectProposals: directProposalsWithResponses || []
    };
}

export const meta: Route.MetaFunction = () => {
    return [
        { title: "인플루언서 제안 목록 | CROSSPHERE" },
        { description: "인플루언서들의 제안을 확인하고 협업 기회를 찾아보세요." },
    ];
};
