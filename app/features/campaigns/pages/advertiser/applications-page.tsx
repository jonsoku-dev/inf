import { useEffect, useState } from "react";
import { Form, redirect, useNavigate } from "react-router";
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
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Badge } from "~/common/components/ui/badge";
import { Card, CardContent } from "~/common/components/ui/card";
import { APPLICATION_STATUS, APPLICATION_STATUS_LABELS } from "~/features/campaigns/constants";
import { getServerClient } from "~/server";
import { DateTime } from "luxon";
import { SearchIcon, FilterIcon, ArrowUpDown, UserIcon, CheckIcon, XIcon, MessageSquareIcon, ClockIcon } from "lucide-react";
import type { Route } from "./+types/applications-page";
import { sendApplicationAcceptedAlert, sendApplicationRejectedAlert } from "~/features/alerts/utils/alert-utils";

// 페이지네이션 컴포넌트 직접 구현
function PaginationControls({
    currentPage,
    totalPages,
    onPageChange
}: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}) {
    return (
        <div className="flex items-center justify-center space-x-2 mt-4">
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
            >
                이전
            </Button>
            <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => onPageChange(page)}
                        className="w-8 h-8 p-0"
                    >
                        {page}
                    </Button>
                ))}
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
            >
                다음
            </Button>
        </div>
    );
}

export const loader = async ({ request, params }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();


    if (!user) {
        return redirect("/auth/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("profile_id", user.id)
        .single();

    if (profile?.role !== "ADVERTISER") {
        return redirect("/campaigns");
    }

    const { data: campaign, error } = await supabase
        .from("campaigns")
        .select(`
            *,
            applications (
                application_id,
                influencer_id,
                application_status,
                message,
                applied_at,
                updated_at,
                influencer:profiles!influencer_id (
                    name,
                    username
                )
            )
        `)
        .eq("campaign_id", params.campaignId)
        .single();


    console.log(error);
    if (!campaign || campaign.advertiser_id !== user.id) {
        return redirect("/campaigns");
    }

    return {
        campaign,
        applications: campaign.applications || [],
    };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    const { campaignId } = params;

    if (!user) {
        return redirect("/auth/login");
    }

    const formData = await request.formData();
    const intent = formData.get("intent") as string;
    const applicationId = formData.get("applicationId") as string;

    // 캠페인 소유자 확인
    const { data: campaign } = await supabase
        .from("campaigns")
        .select("advertiser_id, title")
        .eq("campaign_id", campaignId)
        .single();

    if (!campaign || campaign.advertiser_id !== user.id) {
        return { error: "권한이 없습니다." };
    }

    // 지원서 정보 가져오기
    const { data: application } = await supabase
        .from("applications")
        .select("influencer_id, application_status")
        .eq("application_id", applicationId)
        .eq("campaign_id", campaignId)
        .single();

    if (!application) {
        return { error: "지원서를 찾을 수 없습니다." };
    }

    let newStatus;
    switch (intent) {
        case "accept":
            newStatus = "ACCEPTED";
            break;
        case "reject":
            newStatus = "REJECTED";
            break;
        default:
            return { error: "유효하지 않은 작업입니다." };
    }

    const { error } = await supabase
        .from("applications")
        .update({ application_status: newStatus as keyof typeof APPLICATION_STATUS })
        .eq("application_id", applicationId);

    if (error) {
        return { error: "상태 변경 중 오류가 발생했습니다." };
    }

    // 상태 변경에 따른 알림 처리
    if (newStatus === "ACCEPTED") {
        await sendApplicationAcceptedAlert({
            request,
            applicationId,
            campaignId,
            campaignTitle: campaign.title,
            recipientId: application.influencer_id
        });
    } else if (newStatus === "REJECTED") {
        await sendApplicationRejectedAlert({
            request,
            applicationId,
            campaignId,
            campaignTitle: campaign.title,
            recipientId: application.influencer_id
        });
    }

    return { success: true };
};

export const meta: Route.MetaFunction = () => {
    return [
        { title: "지원자 관리 | Inf" },
        { name: "description", content: "캠페인 지원자를 관리하세요" },
    ];
};

export default function ApplicationsPage({ loaderData }: Route.ComponentProps) {
    const { campaign, applications } = loaderData;
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [sortField, setSortField] = useState<string>("applied_at");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedApplication, setSelectedApplication] = useState<any>(null);
    const itemsPerPage = 10;

    // 상태에 따른 배지 색상 가져오기
    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case APPLICATION_STATUS.PENDING:
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case APPLICATION_STATUS.ACCEPTED:
                return "bg-green-100 text-green-800 border-green-200";
            case APPLICATION_STATUS.REJECTED:
                return "bg-red-100 text-red-800 border-red-200";
            case APPLICATION_STATUS.COMPLETED:
                return "bg-blue-100 text-blue-800 border-blue-200";
            case APPLICATION_STATUS.CANCELLED:
                return "bg-gray-100 text-gray-800 border-gray-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    // 상태에 따른 아이콘 가져오기
    const getStatusIcon = (status: string) => {
        switch (status) {
            case APPLICATION_STATUS.PENDING:
                return <ClockIcon className="h-4 w-4" />;
            case APPLICATION_STATUS.ACCEPTED:
                return <CheckIcon className="h-4 w-4" />;
            case APPLICATION_STATUS.REJECTED:
                return <XIcon className="h-4 w-4" />;
            case APPLICATION_STATUS.COMPLETED:
                return <CheckIcon className="h-4 w-4" />;
            case APPLICATION_STATUS.CANCELLED:
                return <XIcon className="h-4 w-4" />;
            default:
                return <ClockIcon className="h-4 w-4" />;
        }
    };

    // 검색, 필터링, 정렬 적용
    const filteredApplications = applications
        .filter((app: any) => {
            // 검색어 필터링
            const searchMatch =
                app.influencer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.influencer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.message.toLowerCase().includes(searchTerm.toLowerCase());

            // 상태 필터링
            const statusMatch = statusFilter === "ALL" || app.application_status === statusFilter;

            return searchMatch && statusMatch;
        })
        .sort((a: any, b: any) => {
            // 정렬
            if (sortField === "applied_at") {
                return sortDirection === "asc"
                    ? new Date(a.applied_at).getTime() - new Date(b.applied_at).getTime()
                    : new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime();
            } else if (sortField === "name") {
                return sortDirection === "asc"
                    ? a.influencer.name.localeCompare(b.influencer.name)
                    : b.influencer.name.localeCompare(a.influencer.name);
            } else if (sortField === "status") {
                return sortDirection === "asc"
                    ? a.application_status.localeCompare(b.application_status)
                    : b.application_status.localeCompare(a.application_status);
            }
            return 0;
        });

    // 페이지네이션 적용
    const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
    const paginatedApplications = filteredApplications.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // 정렬 토글 함수
    const toggleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    // 페이지 변경 시 선택된 지원자 초기화
    useEffect(() => {
        setSelectedApplication(null);
    }, [currentPage]);

    // 검색어 변경 시 첫 페이지로 이동
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    // 상태 레이블 안전하게 가져오기
    const getStatusLabel = (status: string): string => {
        if (status in APPLICATION_STATUS_LABELS) {
            return APPLICATION_STATUS_LABELS[status as keyof typeof APPLICATION_STATUS_LABELS];
        }
        return "알 수 없음";
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">지원자 관리</h1>
                <p className="text-muted-foreground text-sm">
                    {campaign.title} 캠페인에 지원한 인플루언서를 관리하세요
                </p>
            </div>

            {/* 필터 및 검색 영역 */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                    <div className="relative w-full md:w-64">
                        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="이름, 사용자명, 메시지 검색..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-40">
                            <div className="flex items-center gap-2">
                                <FilterIcon className="h-4 w-4" />
                                <SelectValue placeholder="모든 상태" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">모든 상태</SelectItem>
                            {Object.entries(APPLICATION_STATUS).map(([key, value]) => (
                                <SelectItem key={value} value={value}>
                                    {getStatusLabel(value)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="text-sm text-muted-foreground">
                    총 {filteredApplications.length}명의 지원자
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* 지원자 목록 */}
                <div className="lg:col-span-2">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[200px]">
                                        <Button
                                            variant="ghost"
                                            className="flex items-center gap-1 p-0 hover:bg-transparent"
                                            onClick={() => toggleSort("name")}
                                        >
                                            인플루언서
                                            <ArrowUpDown className="h-3 w-3" />
                                        </Button>
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell">메시지</TableHead>
                                    <TableHead className="w-[120px]">
                                        <Button
                                            variant="ghost"
                                            className="flex items-center gap-1 p-0 hover:bg-transparent"
                                            onClick={() => toggleSort("applied_at")}
                                        >
                                            지원일
                                            <ArrowUpDown className="h-3 w-3" />
                                        </Button>
                                    </TableHead>
                                    <TableHead className="w-[120px]">
                                        <Button
                                            variant="ghost"
                                            className="flex items-center gap-1 p-0 hover:bg-transparent"
                                            onClick={() => toggleSort("status")}
                                        >
                                            상태
                                            <ArrowUpDown className="h-3 w-3" />
                                        </Button>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedApplications.length > 0 ? (
                                    paginatedApplications.map((application: any) => (
                                        <TableRow
                                            key={application.application_id}
                                            className={`cursor-pointer ${selectedApplication?.application_id === application.application_id ? 'bg-muted/50' : ''}`}
                                            onClick={() => setSelectedApplication(application)}
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                                        {application.influencer.avatar_url ? (
                                                            <img
                                                                src={application.influencer.avatar_url}
                                                                alt={application.influencer.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{application.influencer.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            @{application.influencer.username}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-md hidden md:table-cell">
                                                <p className="truncate">{application.message}</p>
                                            </TableCell>
                                            <TableCell>
                                                {DateTime.fromISO(application.applied_at).toFormat('yyyy-MM-dd')}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${getStatusBadgeColor(application.application_status)} flex w-fit items-center gap-1`}>
                                                    {getStatusIcon(application.application_status)}
                                                    {getStatusLabel(application.application_status)}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            {searchTerm || statusFilter !== "ALL" ? (
                                                <div className="text-muted-foreground">
                                                    <p>검색 결과가 없습니다.</p>
                                                    <p className="text-sm">다른 검색어나 필터를 시도해보세요.</p>
                                                </div>
                                            ) : (
                                                <div className="text-muted-foreground">
                                                    <p>아직 지원자가 없습니다.</p>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* 페이지네이션 */}
                    {totalPages > 1 && (
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </div>

                {/* 선택된 지원자 상세 정보 */}
                <div className="lg:col-span-1">
                    {selectedApplication ? (
                        <Card>
                            <CardContent className="p-6">
                                <div className="mb-6 space-y-2 text-center">
                                    <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                        {selectedApplication.influencer.avatar_url ? (
                                            <img
                                                src={selectedApplication.influencer.avatar_url}
                                                alt={selectedApplication.influencer.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <UserIcon className="h-8 w-8 text-muted-foreground" />
                                        )}
                                    </div>
                                    <h3 className="text-lg font-semibold">{selectedApplication.influencer.name}</h3>
                                    <p className="text-sm text-muted-foreground">@{selectedApplication.influencer.username}</p>

                                    {selectedApplication.influencer.bio && (
                                        <p className="text-sm mt-2 text-muted-foreground">
                                            {selectedApplication.influencer.bio}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                                            <MessageSquareIcon className="h-4 w-4" /> 지원 메시지
                                        </h4>
                                        <div className="rounded-md bg-muted p-3 text-sm">
                                            {selectedApplication.message || "메시지가 없습니다."}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium mb-1">지원 정보</h4>
                                        <div className="text-sm space-y-1">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">지원일</span>
                                                <span>{DateTime.fromISO(selectedApplication.applied_at).toFormat('yyyy년 MM월 dd일')}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">마지막 업데이트</span>
                                                <span>{DateTime.fromISO(selectedApplication.updated_at).toFormat('yyyy년 MM월 dd일')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium mb-2">상태 변경</h4>
                                        <Form method="post" className="w-full">
                                            <input type="hidden" name="intent" value="update-status" />
                                            <input type="hidden" name="applicationId" value={selectedApplication.application_id} />
                                            <Select
                                                name="status"
                                                defaultValue={selectedApplication.application_status}
                                                onValueChange={(value) => {
                                                    const form = document.createElement('form');
                                                    form.method = 'post';
                                                    form.innerHTML = `
                                                        <input type="hidden" name="intent" value="update-status" />
                                                        <input type="hidden" name="applicationId" value="${selectedApplication.application_id}" />
                                                        <input type="hidden" name="status" value="${value}" />
                                                    `;
                                                    document.body.appendChild(form);
                                                    form.submit();
                                                    document.body.removeChild(form);
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue>
                                                        {getStatusLabel(selectedApplication.application_status)}
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(APPLICATION_STATUS).map(([key, value]) => (
                                                        <SelectItem key={value} value={value}>
                                                            {getStatusLabel(value)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </Form>
                                    </div>

                                    <div className="pt-2">
                                        <Button variant="outline" className="w-full">
                                            인플루언서 프로필 보기
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="p-6 flex flex-col items-center justify-center h-[400px] text-center">
                                <UserIcon className="h-12 w-12 text-muted-foreground/30 mb-4" />
                                <h3 className="text-lg font-medium mb-1">지원자를 선택하세요</h3>
                                <p className="text-sm text-muted-foreground">
                                    왼쪽 목록에서 지원자를 선택하면 상세 정보를 확인할 수 있습니다.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
} 