import type { Database } from "database-generated.types";
import { useState } from "react";
import { Link, useNavigate, type MetaFunction } from "react-router";
import { CAMPAIGN_STATUS } from "~/features/campaigns/constants";

import { MoreHorizontal, Plus, Search } from "lucide-react";
import { Badge } from "~/common/components/ui/badge";
import { Button } from "~/common/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "~/common/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "~/common/components/ui/dropdown-menu";
import { Input } from "~/common/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/common/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/common/components/ui/table";
import { getServerClient } from "~/server";
import type { Route } from "./+types/list-page";

export const loader = async ({ request }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "";
    const market = url.searchParams.get("market") || "";

    const pageSize = 10;
    const offset = (page - 1) * pageSize;

    // 기본 쿼리 설정
    let query = supabase
        .from('campaigns')
        .select(`
      *,
      advertiser:profiles(*)
    `, { count: 'exact' });

    // 필터 적용
    if (status && status !== "ALL") {
        query = query.eq('campaign_status', status as Database["public"]["Enums"]["campaign_status"]);
    }

    if (market && market !== "ALL") {
        query = query.eq('target_market', market as Database["public"]["Enums"]["target_market"]);
    }

    if (search) {
        query = query.or(`title.ilike.%${search}%,advertiser.name.ilike.%${search}%,advertiser.username.ilike.%${search}%`);
    }

    // 페이지네이션 및 정렬 적용
    const { data: campaigns, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

    if (error) {
        console.error("Error fetching campaigns:", error);
        return {
            campaigns: [],
            totalPages: 1,
            currentPage: 1,
            totalCount: 0,
            search,
            status,
            market
        };
    }

    const totalPages = count ? Math.ceil(count / pageSize) : 1;

    return {
        campaigns: campaigns || [],
        totalPages,
        currentPage: page,
        totalCount: count || 0,
        search,
        status,
        market
    };
};

export const meta: MetaFunction = () => {
    return [
        { title: "캠페인 관리 - 관리자" },
        {
            property: "og:title",
            content: "캠페인 관리 - 관리자",
        },
        {
            name: "description",
            content: "캠페인 관리 - 관리자",
        },
    ];
};

// 상태에 따른 배지 색상 설정
const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case CAMPAIGN_STATUS.DRAFT:
            return "secondary";
        case CAMPAIGN_STATUS.PUBLISHED:
            return "outline";
        case CAMPAIGN_STATUS.CLOSED:
            return "default";
        case CAMPAIGN_STATUS.CANCELLED:
            return "destructive";
        case CAMPAIGN_STATUS.COMPLETED:
            return "secondary";
        default:
            return "default";
    }
};

// 날짜 포맷팅 함수
const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
};

// 타겟 시장 표시 함수
const formatMarket = (market: string) => {
    switch (market) {
        case 'KR':
            return '한국';
        case 'JP':
            return '일본';
        case 'BOTH':
            return '한국 & 일본';
        default:
            return market;
    }
};

export default function CampaignListAdminPage({ loaderData }: Route.ComponentProps) {
    const {
        campaigns,
        totalPages,
        currentPage,
        totalCount,
        search: initialSearch,
        status: initialStatus,
        market: initialMarket
    } = loaderData;

    const [search, setSearch] = useState(initialSearch);
    const [status, setStatus] = useState(initialStatus || "ALL");
    const [market, setMarket] = useState(initialMarket || "ALL");
    const navigate = useNavigate();

    // 쿼리 파라미터 생성 함수
    const createQueryParams = (params: Record<string, string>) => {
        const searchParams = new URLSearchParams();

        if (params.search) searchParams.set("search", params.search);
        if (params.status && params.status !== "ALL") searchParams.set("status", params.status);
        if (params.market && params.market !== "ALL") searchParams.set("market", params.market);
        if (params.page) searchParams.set("page", params.page);

        return searchParams;
    }

    // 검색 핸들러
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const searchParams = createQueryParams({
            search,
            status,
            market,
            page: "1"
        });
        navigate(`?${searchParams.toString()}`, { replace: true });
    };

    // 상태 필터 핸들러
    const handleStatusChange = (value: string) => {
        setStatus(value);
        const searchParams = createQueryParams({
            search,
            status: value,
            market,
            page: "1"
        });
        navigate(`?${searchParams.toString()}`, { replace: true });
    };

    // 시장 필터 핸들러
    const handleMarketChange = (value: string) => {
        setMarket(value);
        const searchParams = createQueryParams({
            search,
            status,
            market: value,
            page: "1"
        });
        navigate(`?${searchParams.toString()}`, { replace: true });
    };

    // 페이지 이동 핸들러
    const handlePageChange = (page: number) => {
        const searchParams = createQueryParams({
            search,
            status,
            market,
            page: page.toString()
        });
        navigate(`?${searchParams.toString()}`, { replace: true });
    }

    // 페이지네이션 계산
    const paginationRange = () => {
        const range = [];
        const maxPages = 5;
        let start = Math.max(1, currentPage - Math.floor(maxPages / 2));
        let end = Math.min(totalPages, start + maxPages - 1);

        if (end - start + 1 < maxPages) {
            start = Math.max(1, end - maxPages + 1);
        }

        for (let i = start; i <= end; i++) {
            range.push(i);
        }
        return range;
    };

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h1 className="text-3xl font-bold">캠페인 관리</h1>
                <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link to="/admin/campaigns/new">
                        <Plus className="mr-2 h-5 w-5" /> 새 캠페인
                    </Link>
                </Button>
            </div>

            <Card className="mb-8 shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl">필터 및 검색</CardTitle>
                    <CardDescription>캠페인 목록을 필터링하고 검색합니다.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="col-span-1">
                            <form onSubmit={handleSearch} className="flex gap-3">
                                <Input
                                    placeholder="캠페인 또는 광고주 검색"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="flex-1"
                                />
                                <Button type="submit" size="icon" className="h-10 w-10">
                                    <Search className="h-5 w-5" />
                                </Button>
                            </form>
                        </div>
                        <div className="col-span-1">
                            <Select value={status} onValueChange={handleStatusChange}>
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="상태 필터" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">모든 상태</SelectItem>
                                    <SelectItem value={CAMPAIGN_STATUS.DRAFT}>초안</SelectItem>
                                    <SelectItem value={CAMPAIGN_STATUS.PUBLISHED}>모집중</SelectItem>
                                    <SelectItem value={CAMPAIGN_STATUS.CLOSED}>모집마감</SelectItem>
                                    <SelectItem value={CAMPAIGN_STATUS.CANCELLED}>취소됨</SelectItem>
                                    <SelectItem value={CAMPAIGN_STATUS.COMPLETED}>완료됨</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-1">
                            <Select value={market} onValueChange={handleMarketChange}>
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="시장 필터" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">모든 시장</SelectItem>
                                    <SelectItem value="KR">한국</SelectItem>
                                    <SelectItem value="JP">일본</SelectItem>
                                    <SelectItem value="BOTH">한국 & 일본</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="py-4 font-semibold">캠페인</TableHead>
                                <TableHead className="py-4 font-semibold">광고주</TableHead>
                                <TableHead className="py-4 font-semibold">예산</TableHead>
                                <TableHead className="py-4 font-semibold">시장</TableHead>
                                <TableHead className="py-4 font-semibold">상태</TableHead>
                                <TableHead className="py-4 font-semibold">생성일</TableHead>
                                <TableHead className="text-right py-4 font-semibold">작업</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {campaigns.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-16 text-gray-500">
                                        캠페인이 없습니다.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                campaigns.map((campaign) => (
                                    <TableRow key={campaign.campaign_id} className="hover:bg-muted/30">
                                        <TableCell className="font-medium py-4">
                                            <Link
                                                to={`/admin/campaigns/${campaign.campaign_id}`}
                                                className="text-blue-600 hover:underline"
                                            >
                                                {campaign.title}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex flex-col">
                                                <span>{campaign.advertiser?.name || "이름 없음"}</span>
                                                <span className="text-xs text-gray-500">@{campaign.advertiser?.username || "사용자명 없음"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">{campaign.budget?.toLocaleString() || "0"}원</TableCell>
                                        <TableCell className="py-4">{formatMarket(campaign.target_market)}</TableCell>
                                        <TableCell className="py-4">
                                            <Badge variant={getStatusBadgeVariant(campaign.campaign_status)} className="px-3 py-1">
                                                {campaign.campaign_status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4">{formatDate(campaign.created_at)}</TableCell>
                                        <TableCell className="text-right py-4">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link to={`/admin/campaigns/${campaign.campaign_id}`}>
                                                            상세 보기
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link to={`/admin/campaigns/${campaign.campaign_id}/edit`}>
                                                            수정
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link to={`/admin/applications?campaignId=${campaign.campaign_id}`}>
                                                            신청 관리
                                                        </Link>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                    <div className="flex items-center gap-3">
                        {currentPage > 1 && (
                            <Button
                                variant="outline"
                                size="default"
                                onClick={() => handlePageChange(currentPage - 1)}
                                className="px-4"
                            >
                                이전
                            </Button>
                        )}

                        {paginationRange().map((page) => (
                            <Button
                                key={page}
                                variant={page === currentPage ? "default" : "outline"}
                                size="default"
                                onClick={() => handlePageChange(page)}
                                className="w-10 h-10"
                            >
                                {page}
                            </Button>
                        ))}

                        {currentPage < totalPages && (
                            <Button
                                variant="outline"
                                size="default"
                                onClick={() => handlePageChange(currentPage + 1)}
                                className="px-4"
                            >
                                다음
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
} 