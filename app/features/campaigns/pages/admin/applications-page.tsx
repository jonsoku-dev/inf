import type { Database } from "database-generated.types";
import { useState } from "react";
import { Link } from "react-router";
import { APPLICATION_STATUS } from "~/features/campaigns/constants";
import { DateTime } from "luxon";

import { ChevronLeft, ChevronRight, MoreHorizontal, Search } from "lucide-react";
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
    DropdownMenuSeparator,
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
import type { Route } from "./+types/applications-page";

export const loader = async ({ request }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "";
    const campaignId = url.searchParams.get("campaignId") || "";

    const pageSize = 10;
    const offset = (page - 1) * pageSize;

    // 기본 쿼리 설정
    let query = supabase
        .from('applications')
        .select(`
            *,
            campaign:campaigns(*),
            influencer:profiles(*)
        `, { count: 'exact' });

    // 필터 적용
    if (status && status !== "ALL") {
        query = query.eq('application_status', status as Database["public"]["Enums"]["application_status"]);
    }

    if (campaignId) {
        query = query.eq('campaign_id', campaignId);
    }

    if (search) {
        query = query.or(`influencer.name.ilike.%${search}%,influencer.username.ilike.%${search}%,campaign.title.ilike.%${search}%`);
    }

    // 페이지네이션 및 정렬 적용
    query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

    const { data: applications, error, count } = await query;

    if (error) {
        console.error("Error fetching applications:", error);
        return {
            applications: [],
            totalPages: 1,
            currentPage: 1,
            totalCount: 0,
            search,
            status,
            campaignId
        };
    }

    const totalPages = count ? Math.ceil(count / pageSize) : 1;

    return {
        applications: applications || [],
        totalPages,
        currentPage: page,
        totalCount: count || 0,
        search,
        status,
        campaignId
    };
};

export const action = async ({ request }: Route.ActionArgs) => {
    const { supabase } = getServerClient(request);
    const formData = await request.formData();
    const applicationId = formData.get("applicationId") as string;
    const newStatus = formData.get("status") as string;

    if (!applicationId || !newStatus) {
        return { error: "신청 ID와 상태가 필요합니다." };
    }

    try {
        const { error } = await supabase
            .from('applications')
            .update({
                application_status: newStatus as Database["public"]["Enums"]["application_status"],
                updated_at: new Date().toISOString()
            })
            .eq('application_id', applicationId);

        if (error) {
            console.error("Error updating application status:", error);
            return { error: "상태 업데이트 중 오류가 발생했습니다." };
        }

        return { success: true, message: "신청 상태가 업데이트되었습니다." };
    } catch (error) {
        console.error("Error updating application status:", error);
        return { error: "상태 업데이트 중 오류가 발생했습니다." };
    }
};

export const meta = () => {
    return [
        { title: "신청 관리 - 관리자" },
        {
            property: "og:title",
            content: "신청 관리 - 관리자",
        },
        {
            name: "description",
            content: "신청 관리 - 관리자",
        },
    ];
};

// 상태에 따른 배지 색상 설정
const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case APPLICATION_STATUS.PENDING:
            return "outline";
        case APPLICATION_STATUS.ACCEPTED:
            return "success";
        case APPLICATION_STATUS.REJECTED:
            return "destructive";
        case APPLICATION_STATUS.COMPLETED:
            return "secondary";
        case APPLICATION_STATUS.CANCELLED:
            return "default";
        default:
            return "default";
    }
};

// 날짜 포맷팅 함수
const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return DateTime.fromISO(dateString).toFormat('yyyy년 MM월 dd일');
};

export default function ApplicationsAdminPage({ loaderData, actionData }: Route.ComponentProps) {
    const {
        applications,
        totalPages,
        currentPage,
        totalCount,
        search: initialSearch,
        status: initialStatus,
        campaignId: initialCampaignId
    } = loaderData;

    const [search, setSearch] = useState(initialSearch);
    const [status, setStatus] = useState(initialStatus);
    const [campaignId, setCampaignId] = useState(initialCampaignId);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 검색 핸들러
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const url = new URL(window.location.href);
        url.searchParams.set("search", search);
        url.searchParams.set("page", "1");
        window.location.href = url.toString();
    };

    // 상태 필터 핸들러
    const handleStatusChange = (value: string) => {
        const url = new URL(window.location.href);
        url.searchParams.set("status", value);
        url.searchParams.set("page", "1");
        window.location.href = url.toString();
    };

    // 캠페인 필터 초기화 핸들러
    const handleClearCampaignFilter = () => {
        const url = new URL(window.location.href);
        url.searchParams.delete("campaignId");
        url.searchParams.set("page", "1");
        window.location.href = url.toString();
    };

    // 상태 업데이트 핸들러
    const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("applicationId", applicationId);
            formData.append("status", newStatus);

            const response = await fetch("/admin/applications", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                throw new Error("상태 업데이트에 실패했습니다.");
            }

            // 페이지 새로고침
            window.location.reload();
        } catch (error) {
            console.error("Error updating status:", error);
            alert("상태 업데이트에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // 페이지네이션 범위 계산
    const paginationRange = () => {
        const range = [];
        const maxPages = Math.min(totalPages, 5);
        let startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(startPage + maxPages - 1, totalPages);

        if (endPage - startPage + 1 < maxPages) {
            startPage = Math.max(1, endPage - maxPages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            range.push(i);
        }

        return range;
    };

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">신청 관리</h1>
            </div>

            {/* 필터 및 검색 */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input
                            type="text"
                            placeholder="인플루언서 이름 또는 캠페인 제목 검색"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1"
                        />
                        <Button type="submit" variant="outline" size="icon">
                            <Search className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
                <div className="w-full md:w-48">
                    <Select value={status} onValueChange={handleStatusChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="상태 필터" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">모든 상태</SelectItem>
                            {Object.values(APPLICATION_STATUS).map((status) => (
                                <SelectItem key={status} value={status}>
                                    {status}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {campaignId && (
                    <Button variant="outline" onClick={handleClearCampaignFilter}>
                        캠페인 필터 해제
                    </Button>
                )}
            </div>

            {/* 신청 목록 */}
            <Card>
                <CardHeader>
                    <CardTitle>신청 목록</CardTitle>
                    <CardDescription>
                        총 {totalCount}개의 신청이 있습니다.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>인플루언서</TableHead>
                                <TableHead>캠페인</TableHead>
                                <TableHead>상태</TableHead>
                                <TableHead>신청일</TableHead>
                                <TableHead className="text-right">작업</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {applications.length > 0 ? (
                                applications.map((application: any) => (
                                    <TableRow key={application.application_id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{application.influencer?.name || '인플루언서'}</div>
                                                <div className="text-sm text-gray-500">{application.influencer?.username || ''}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Link to={`/admin/campaigns/${application.campaign_id}`} className="hover:underline">
                                                {application.campaign?.title || '캠페인'}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadgeVariant(application.application_status)}>
                                                {application.application_status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{formatDate(application.created_at)}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">메뉴</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link to={`/admin/applications/${application.application_id}`}>
                                                            상세 보기
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {application.application_status === APPLICATION_STATUS.PENDING && (
                                                        <>
                                                            <DropdownMenuItem
                                                                onClick={() => handleStatusUpdate(application.application_id, APPLICATION_STATUS.ACCEPTED)}
                                                                disabled={isSubmitting}
                                                            >
                                                                승인
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleStatusUpdate(application.application_id, APPLICATION_STATUS.REJECTED)}
                                                                disabled={isSubmitting}
                                                            >
                                                                거절
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-4">
                                        신청 내역이 없습니다.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* 페이지네이션 */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-6">
                            <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={currentPage === 1}
                                    onClick={() => {
                                        const url = new URL(window.location.href);
                                        url.searchParams.set("page", (currentPage - 1).toString());
                                        window.location.href = url.toString();
                                    }}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                {paginationRange().map((page) => (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? "default" : "outline"}
                                        onClick={() => {
                                            if (currentPage !== page) {
                                                const url = new URL(window.location.href);
                                                url.searchParams.set("page", page.toString());
                                                window.location.href = url.toString();
                                            }
                                        }}
                                    >
                                        {page}
                                    </Button>
                                ))}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={currentPage === totalPages}
                                    onClick={() => {
                                        const url = new URL(window.location.href);
                                        url.searchParams.set("page", (currentPage + 1).toString());
                                        window.location.href = url.toString();
                                    }}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 