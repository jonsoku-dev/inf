import type { Database } from "database-generated.types";
import { Link, redirect } from "react-router";
import { APPLICATION_STATUS } from "~/features/campaigns/constants";
import type { Route } from "./+types/application-detail-page";

import { Calendar, Clock, DollarSign, FileText, Instagram, Video, Youtube } from "lucide-react";
import { Avatar, AvatarFallback } from "~/common/components/ui/avatar";
import { Badge } from "~/common/components/ui/badge";
import { Button } from "~/common/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "~/common/components/ui/card";
import { Label } from "~/common/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/common/components/ui/select";
import { Separator } from "~/common/components/ui/separator";
import { Textarea } from "~/common/components/ui/textarea";
import { getServerClient } from "~/server";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const applicationId = params.applicationId;
    const campaignId = params.campaignId;

    if (!applicationId || !campaignId) {
        return redirect("/admin/applications");
    }

    // 신청 정보 가져오기
    const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select(`
      *,
      campaign:campaigns(*),
      influencer:profiles(*)
    `)
        .eq('application_id', applicationId)
        .eq('campaign_id', campaignId)
        .single();

    if (applicationError || !application) {
        console.error("Error fetching application:", applicationError);
        return redirect("/admin/applications");
    }

    // 인플루언서 SNS 정보 가져오기
    const { data: socialAccounts, error: socialError } = await supabase
        .from('influencer_stats')
        .select('*')
        .eq('profile_id', application.influencer_id);

    if (socialError) {
        console.error("Error fetching social accounts:", socialError);
    }

    return {
        application,
        socialAccounts: socialAccounts || [],
    };
};

export const action = async ({ params, request }: Route.ActionArgs) => {
    const { supabase } = getServerClient(request);
    const applicationId = params.applicationId;

    if (!applicationId) {
        return { error: "신청 ID가 필요합니다." };
    }

    const formData = await request.formData();
    const _action = formData.get("_action");

    if (_action === "updateStatus") {
        const newStatus = formData.get("status") as string;
        const adminComment = formData.get("adminComment") as string;

        if (!newStatus) {
            return { error: "상태 값이 필요합니다." };
        }

        try {
            const { error } = await supabase
                .from('applications')
                .update({
                    application_status: newStatus as Database["public"]["Enums"]["application_status"],
                    admin_comment: adminComment,
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
    }

    return { error: "알 수 없는 작업입니다." };
};

export const meta: Route.MetaFunction = () => {
    return [
        { title: "관리자 - 캠페인 신청 상세 | 인플루언서 플랫폼" },
        { name: "description", content: "캠페인 신청 상세 정보를 확인합니다" },
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
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);
};

// 날짜 및 시간 포맷팅 함수
const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

export default function ApplicationDetailAdminPage({ loaderData, actionData }: Route.ComponentProps) {
    const { application, socialAccounts } = loaderData;

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
                <div>
                    <h1 className="text-2xl font-bold">신청 상세 정보</h1>
                    <p className="text-gray-500">캠페인: {application.campaign?.title || "제목 없음"}</p>
                </div>
                <Button variant="outline" asChild>
                    <Link to="/admin/applications">목록으로 돌아가기</Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>신청 상세 정보</CardTitle>
                                    <CardDescription>
                                        신청 ID: {application.application_id}
                                    </CardDescription>
                                </div>
                                <Badge variant="outline">
                                    {application.application_status}
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">신청 내용</h3>
                                <p className="whitespace-pre-wrap text-gray-700">
                                    {application.message || "신청 메시지가 없습니다."}
                                </p>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="text-lg font-semibold mb-2">관리자 코멘트</h3>
                                <p className="whitespace-pre-wrap text-gray-700">
                                    {"관리자 코멘트가 없습니다."}
                                </p>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="text-lg font-semibold mb-2">신청 정보</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center">
                                        <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                                        <div>
                                            <p className="text-sm text-gray-500">신청일</p>
                                            <p className="font-medium">{formatDateTime(application.applied_at)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="h-5 w-5 text-gray-500 mr-2" />
                                        <div>
                                            <p className="text-sm text-gray-500">최종 업데이트</p>
                                            <p className="font-medium">{formatDateTime(application.updated_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            {application.application_status === APPLICATION_STATUS.PENDING && (
                                <form method="post" className="w-full space-y-4">
                                    <input type="hidden" name="_action" value="updateStatus" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="status">상태 변경</Label>
                                            <Select name="status" defaultValue={APPLICATION_STATUS.PENDING}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="상태 선택" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={APPLICATION_STATUS.ACCEPTED}>승인</SelectItem>
                                                    <SelectItem value={APPLICATION_STATUS.REJECTED}>거절</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="adminComment">관리자 코멘트</Label>
                                        <Textarea
                                            name="adminComment"
                                            placeholder="신청에 대한 코멘트를 입력하세요"
                                            defaultValue={""}
                                            className="min-h-[100px]"
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <Button type="submit">상태 업데이트</Button>
                                    </div>
                                </form>
                            )}

                            {application.application_status === APPLICATION_STATUS.ACCEPTED && (
                                <form method="post" className="w-full space-y-4">
                                    <input type="hidden" name="_action" value="updateStatus" />
                                    <input type="hidden" name="status" value={APPLICATION_STATUS.COMPLETED} />
                                    <div>
                                        <Label htmlFor="adminComment">관리자 코멘트</Label>
                                        <Textarea
                                            name="adminComment"
                                            placeholder="완료 코멘트를 입력하세요"
                                            defaultValue={""}
                                            className="min-h-[100px]"
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <Button type="submit">완료 처리</Button>
                                    </div>
                                </form>
                            )}
                        </CardFooter>
                    </Card>
                </div>

                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>인플루언서 정보</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback>{application.influencer?.name?.charAt(0) || "U"}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{application.influencer?.name || "이름 없음"}</p>
                                    <p className="text-sm text-gray-500">@{application.influencer?.username || "사용자명 없음"}</p>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="text-sm font-medium mb-2">SNS 계정</h3>
                                <div className="space-y-2">
                                    {socialAccounts && socialAccounts.length > 0 ? (
                                        socialAccounts.map((account, index) => (
                                            <div key={index} className="flex items-center">
                                                {account.platform === "INSTAGRAM" && <Instagram className="h-4 w-4 mr-2" />}
                                                {account.platform === "YOUTUBE" && <Youtube className="h-4 w-4 mr-2" />}
                                                {account.platform === "TIKTOK" && <Video className="h-4 w-4 mr-2" />}
                                                {account.platform === "BLOG" && <FileText className="h-4 w-4 mr-2" />}
                                                <span className="text-sm">{account.platform}: {account.followers_count.toLocaleString()} 팔로워</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500">등록된 SNS 계정이 없습니다.</p>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            <Button variant="outline" asChild className="w-full">
                                <Link to={`/admin/influencers/${application.influencer_id}`}>인플루언서 프로필 보기</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="mt-4">
                        <CardHeader>
                            <CardTitle>캠페인 정보</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <h3 className="font-medium">{application.campaign?.title || "제목 없음"}</h3>
                            <p className="text-sm text-gray-700 line-clamp-3">{application.campaign?.description || "설명 없음"}</p>

                            <Separator />

                            <div className="flex items-center">
                                <DollarSign className="h-5 w-5 text-gray-500 mr-2" />
                                <div>
                                    <p className="text-sm text-gray-500">예산</p>
                                    <p className="font-medium">{application.campaign?.budget?.toLocaleString() || "0"}원</p>
                                </div>
                            </div>

                            <Button variant="outline" asChild className="w-full">
                                <Link to={`/admin/campaigns/${application.campaign_id}`}>캠페인 상세 보기</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 