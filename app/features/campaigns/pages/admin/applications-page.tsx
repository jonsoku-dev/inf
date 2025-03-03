import type { Database } from "database-generated.types";
import { useState } from "react";
import { Link } from "react-router";
import { APPLICATION_STATUS } from "~/features/campaigns/constants";

import { MoreHorizontal, Search } from "lucide-react";
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
    if (status) {
        query = query.eq('application_status', status as Database["public"]["Enums"]["application_status"]);
    }

    if (campaignId) {
        query = query.eq('campaign_id', campaignId);
    }

    if (search) {
        query = query.or(`influencer.name.ilike.%${search}%,influencer.username.ilike.%${search}%,campaign.title.ilike.%${search}%`);
    }

    // 페이지네이션 및 정렬 적용
    const { data: applications, error, count } = await query
        .order('applied_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

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
        { title: "캠페인 신청 관리 - 관리자" },
        { name: "description", content: "인플루언서 캠페인 신청 관리 페이지입니다." }
    ];
};

// 상태에 따른 배지 색상 설정
const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case APPLICATION_STATUS.PENDING:
            return "warning";
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
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
};

export default function CampaignApplicationsAdminPage({ loaderData, actionData }: Route.ComponentProps) {
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
        setStatus(value);
        const url = new URL(window.location.href);
        url.searchParams.set("status", value);
        url.searchParams.set("page", "1");
        window.location.href = url.toString();
    };

    // 상태 업데이트 핸들러
    const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
        setIsSubmitting(true);

        const form = document.createElement("form");
        form.method = "post";

        const applicationIdInput = document.createElement("input");
        applicationIdInput.name = "applicationId";
        applicationIdInput.value = applicationId;
        form.appendChild(applicationIdInput);

        const statusInput = document.createElement("input");
        statusInput.name = "status";
        statusInput.value = newStatus;
        form.appendChild(statusInput);

        document.body.appendChild(form);
        form.submit();
    };

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
        <div className="container mx-auto py-8">
            {actionData?.success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {actionData.message}
                </div>
            )}

            {actionData?.error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {actionData.error}
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">캠페인 신청 관리</h1>
                <div className="text-sm text-gray-500">
                    총 <span className="font-medium">{totalCount}</span>개의 신청
                </div>
            </div>

            <Card className="mb-6">
                <CardHeader className="pb-3">
                    <CardTitle>필터 및 검색</CardTitle>
                    <CardDescription>신청 목록을 필터링하고 검색합니다.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-1/3">
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <Input
                                    placeholder="인플루언서 또는 캠페인 검색"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="flex-1"
                                />
                                <Button type="submit" size="icon">
                                    <Search className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                        <div className="w-full md:w-1/3">
                            <Select value={status} onValueChange={handleStatusChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="상태 필터" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">모든 상태</SelectItem>
                                    <SelectItem value={APPLICATION_STATUS.PENDING}>대기 중</SelectItem>
                                    <SelectItem value={APPLICATION_STATUS.ACCEPTED}>승인됨</SelectItem>
                                    <SelectItem value={APPLICATION_STATUS.REJECTED}>거절됨</SelectItem>
                                    <SelectItem value={APPLICATION_STATUS.COMPLETED}>완료됨</SelectItem>
                                    <SelectItem value={APPLICATION_STATUS.CANCELLED}>취소됨</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {initialCampaignId && (
                            <div className="flex-1 flex justify-end">
                                <Button variant="outline" asChild>
                                    <Link to="/admin/applications">모든 신청 보기</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>신청 ID</TableHead>
                                <TableHead>인플루언서</TableHead>
                                <TableHead>캠페인</TableHead>
                                <TableHead>신청일</TableHead>
                                <TableHead>상태</TableHead>
                                <TableHead className="text-right">작업</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {applications.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        신청 내역이 없습니다.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                applications.map((application) => (
                                    <TableRow key={application.application_id}>
                                        <TableCell className="font-medium">
                                            <Link
                                                to={`/admin/applications/${application.application_id}?campaignId=${application.campaign_id}`}
                                                className="text-blue-600 hover:underline"
                                            >
                                                {application.application_id.substring(0, 8)}...
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{application.influencer?.name || "이름 없음"}</span>
                                                <span className="text-xs text-gray-500">@{application.influencer?.username || "사용자명 없음"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col max-w-xs">
                                                <span className="font-medium truncate">{application.campaign?.title || "제목 없음"}</span>
                                                <span className="text-xs text-gray-500">
                                                    {application.campaign?.budget?.toLocaleString() || "0"}원
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{formatDate(application.applied_at)}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {application.application_status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link to={`/admin/applications/${application.application_id}?campaignId=${application.campaign_id}`}>
                                                            상세 보기
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    {application.application_status === APPLICATION_STATUS.PENDING && (
                                                        <>
                                                            <DropdownMenuItem
                                                                onClick={() => handleStatusUpdate(application.application_id, APPLICATION_STATUS.ACCEPTED)}
                                                                disabled={isSubmitting}
                                                            >
                                                                승인하기
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleStatusUpdate(application.application_id, APPLICATION_STATUS.REJECTED)}
                                                                disabled={isSubmitting}
                                                                className="text-red-600"
                                                            >
                                                                거절하기
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    {application.application_status === APPLICATION_STATUS.ACCEPTED && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleStatusUpdate(application.application_id, APPLICATION_STATUS.COMPLETED)}
                                                            disabled={isSubmitting}
                                                        >
                                                            완료 처리하기
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <div className="flex items-center gap-2">
                        {currentPage > 1 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const url = new URL(window.location.href);
                                    url.searchParams.set("page", String(currentPage - 1));
                                    window.location.href = url.toString();
                                }}
                            >
                                이전
                            </Button>
                        )}

                        {paginationRange().map((page) => (
                            <Button
                                key={page}
                                variant={page === currentPage ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                    const url = new URL(window.location.href);
                                    url.searchParams.set("page", String(page));
                                    window.location.href = url.toString();
                                }}
                            >
                                {page}
                            </Button>
                        ))}

                        {currentPage < totalPages && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const url = new URL(window.location.href);
                                    url.searchParams.set("page", String(currentPage + 1));
                                    window.location.href = url.toString();
                                }}
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