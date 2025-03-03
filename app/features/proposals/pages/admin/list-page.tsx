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
import { formatCurrency, formatDate } from "~/lib/utils";
import { getServerClient } from "~/server";
import { PROPOSAL_STATUS, TARGET_MARKET, CONTENT_TYPE_LABELS, ADVERTISER_PROPOSAL_STATUS } from "../../constants";
import type { Route } from "./+types/list-page";
import { Avatar, AvatarFallback } from "~/common/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/common/components/ui/tabs";


export default function ListPage({ loaderData }: Route.ComponentProps) {
    const { influencerProposals, advertiserProposals } = loaderData;

    const getStatusBadgeColor = useCallback((status: string) => {
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
            <div className="mb-8">
                <h1 className="text-2xl font-bold">제안서 관리</h1>
                <p className="text-muted-foreground mt-1">인플루언서와 광고주의 제안서를 관리합니다</p>
            </div>

            <Tabs defaultValue="influencer" className="w-full">
                <TabsList className="mb-6">
                    <TabsTrigger value="influencer">인플루언서 제안서</TabsTrigger>
                    <TabsTrigger value="advertiser">광고주 직접 제안서</TabsTrigger>
                </TabsList>

                <TabsContent value="influencer">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {influencerProposals.map((proposal) => (
                            <Card key={proposal.proposal_id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <Badge className={getStatusBadgeColor(proposal.proposal_status || "")}>
                                            {proposal.proposal_status}
                                        </Badge>
                                        <Badge variant="outline">
                                            {getTargetMarketLabel(proposal.target_market as keyof typeof TARGET_MARKET)}
                                        </Badge>
                                    </div>
                                    <CardTitle className="mt-2 line-clamp-1">{proposal.title}</CardTitle>
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
                                                    {formatCurrency(proposal.desired_budget)}
                                                    {proposal.is_negotiable && (
                                                        <span className="ml-2 text-sm text-gray-500">(협의 가능)</span>
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-right">콘텐츠 유형</p>
                                                <p className="text-right">{CONTENT_TYPE_LABELS[proposal.content_type as keyof typeof CONTENT_TYPE_LABELS]}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">인플루언서</p>
                                            <div className="flex items-center mt-1">
                                                <Avatar className="h-8 w-8 mr-2">
                                                    <AvatarFallback>{proposal.influencer?.name?.charAt(0) || "?"}</AvatarFallback>
                                                </Avatar>
                                                <p className="text-sm">{proposal.influencer?.name || "알 수 없음"}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">등록일</p>
                                            <p className="text-sm">{formatDate(proposal.created_at)}</p>
                                        </div>
                                        <div className="pt-4">
                                            <Link to={`/admin/proposals/${proposal.proposal_id}`}>
                                                <Button className="w-full">자세히 보기</Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {influencerProposals.length === 0 && (
                            <div className="col-span-full text-center py-12 bg-muted/50 rounded-lg">
                                <p className="text-muted-foreground">등록된 인플루언서 제안서가 없습니다</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="advertiser">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {advertiserProposals.map((proposal) => (
                            <Card key={proposal.proposal_id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <Badge className={getStatusBadgeColor(proposal.proposal_status || "")}>
                                            {proposal.proposal_status}
                                        </Badge>
                                        <Badge variant="outline">
                                            {getTargetMarketLabel(proposal.target_market as keyof typeof TARGET_MARKET)}
                                        </Badge>
                                    </div>
                                    <CardTitle className="mt-2 line-clamp-1">{proposal.title}</CardTitle>
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
                                                    {formatCurrency(proposal.budget)}
                                                    {proposal.is_negotiable && (
                                                        <span className="ml-2 text-sm text-gray-500">(협의 가능)</span>
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-right">콘텐츠 유형</p>
                                                <p className="text-right">{CONTENT_TYPE_LABELS[proposal.content_type as keyof typeof CONTENT_TYPE_LABELS]}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">광고주</p>
                                            <div className="flex items-center mt-1">
                                                <Avatar className="h-8 w-8 mr-2">
                                                    <AvatarFallback>{proposal.advertiser?.name?.charAt(0) || "?"}</AvatarFallback>
                                                </Avatar>
                                                <p className="text-sm">{proposal.advertiser?.name || "알 수 없음"}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">인플루언서</p>
                                            <div className="flex items-center mt-1">
                                                <Avatar className="h-8 w-8 mr-2">
                                                    <AvatarFallback>{proposal.influencer?.name?.charAt(0) || "?"}</AvatarFallback>
                                                </Avatar>
                                                <p className="text-sm">{proposal.influencer?.name || "알 수 없음"}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">등록일</p>
                                            <p className="text-sm">{formatDate(proposal.created_at)}</p>
                                        </div>
                                        <div className="pt-4">
                                            <Link to={`/admin/proposals/${proposal.proposal_id}`}>
                                                <Button className="w-full">자세히 보기</Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {advertiserProposals.length === 0 && (
                            <div className="col-span-full text-center py-12 bg-muted/50 rounded-lg">
                                <p className="text-muted-foreground">등록된 광고주 직접 제안서가 없습니다</p>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export async function loader({ request }: Route.LoaderArgs) {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

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

    // 인플루언서 제안 목록 가져오기
    const { data: influencerProposals, error: influencerError } = await supabase
        .from("influencer_proposals")
        .select(`
            *,
            influencer:profiles (
                name,
                username
            )
        `)
        .order("created_at", { ascending: false });

    if (influencerError) {
        throw new Error("인플루언서 제안 목록을 불러오는데 실패했습니다.");
    }

    // 광고주 직접 제안 목록 가져오기
    const { data: advertiserProposals, error: advertiserError } = await supabase
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
        .order("created_at", { ascending: false });

    if (advertiserError) {
        throw new Error("광고주 제안 목록을 불러오는데 실패했습니다.");
    }

    return {
        influencerProposals: influencerProposals || [],
        advertiserProposals: advertiserProposals || []
    };
}

export const meta: Route.MetaFunction = () => {
    return [
        { title: "제안서 관리 - 관리자 페이지" },
        { name: "description", content: "인플루언서와 광고주의 제안서를 관리합니다" },
    ];
}; 