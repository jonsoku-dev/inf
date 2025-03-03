import type { Database } from "database-generated.types";
import { Form, Link, redirect } from "react-router";
import { APPLICATION_STATUS } from "~/features/campaigns/constants";
import type { Route } from ".react-router/types/app/features/campaigns/pages/admin/+types/application-detail-page";

import {
    AlertCircle,
    ArrowLeft,
    CheckCircle,
} from "lucide-react";
import { DateTime } from "luxon";
import { useState } from "react";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "~/common/components/ui/alert";
import { Badge } from "~/common/components/ui/badge";
import { Button } from "~/common/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "~/common/components/ui/card";
import { Label } from "~/common/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/common/components/ui/select";
import { Textarea } from "~/common/components/ui/textarea";
import { getServerClient } from "~/server";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const applicationId = params.applicationId;

    if (!applicationId) {
        return redirect("/admin/applications");
    }

    // 신청 정보 가져오기
    const { data: application, error } = await supabase
        .from('applications')
        .select(`
            *,
            campaign:campaigns(*),
            influencer:profiles(*)
        `)
        .eq('application_id', applicationId)
        .single();

    if (error) {
        console.error("Error fetching application:", error);
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
            // 먼저 신청 정보를 가져옵니다
            const { data: application, error: fetchError } = await supabase
                .from('applications')
                .select('*')
                .eq('application_id', applicationId)
                .single();

            if (fetchError || !application) {
                console.error("Error fetching application:", fetchError);
                return { error: "신청 정보를 가져오는데 실패했습니다." };
            }

            // 상태 업데이트
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

            // 어드민 코멘트가 있는 경우 저장
            if (adminComment && adminComment.trim() !== '') {
                // 현재 로그인한 관리자 정보 가져오기
                const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error("Error getting session:", sessionError);
                    return { error: "세션 정보를 가져오는데 실패했습니다." };
                }

                const adminId = sessionData.session?.user.id;

                if (!adminId) {
                    console.error("Admin ID not found");
                    return { error: "관리자 ID를 찾을 수 없습니다." };
                }

                // 어드민 코멘트 저장
                const { error: commentError } = await supabase
                    .from('campaign_admin_comments')
                    .insert({
                        campaign_id: application.campaign_id,
                        admin_id: adminId,
                        comment: adminComment,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    });

                if (commentError) {
                    console.error("Error saving admin comment:", commentError);
                    return { error: "어드민 코멘트 저장에 실패했습니다." };
                }
            }

            return { success: true, message: "신청 상태가 성공적으로 업데이트되었습니다." };
        } catch (error) {
            console.error("Error:", error);
            return { error: "처리 중 오류가 발생했습니다." };
        }
    }

    return { error: "알 수 없는 작업입니다." };
};

export const meta: Route.MetaFunction = () => {
    return [
        { title: "신청 상세 정보 - 관리자" },
        {
            property: "og:title",
            content: "신청 상세 정보 - 관리자",
        },
        {
            name: "description",
            content: "신청 상세 정보 - 관리자",
        },
    ];
};

// 상태에 따른 배지 색상 설정
const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case APPLICATION_STATUS.PENDING:
            return "outline" as const;
        case APPLICATION_STATUS.ACCEPTED:
            return "success" as const;
        case APPLICATION_STATUS.REJECTED:
            return "destructive" as const;
        case APPLICATION_STATUS.COMPLETED:
            return "secondary" as const;
        case APPLICATION_STATUS.CANCELLED:
            return "default" as const;
        default:
            return "default" as const;
    }
};

// 날짜 포맷팅 함수
const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return DateTime.fromISO(dateString).toFormat('yyyy년 MM월 dd일');
};

// 날짜 및 시간 포맷팅 함수
const formatDateTime = (dateString: string) => {
    if (!dateString) return "-";
    return DateTime.fromISO(dateString).toFormat('yyyy년 MM월 dd일 HH:mm');
};

export default function ApplicationDetailAdminPage({ loaderData, actionData }: Route.ComponentProps) {
    const { application, socialAccounts } = loaderData;
    const [status, setStatus] = useState(application.application_status);
    const [adminComment, setAdminComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    return (
        <div className="container mx-auto py-6">
            <div className="mb-6">
                <Button variant="outline" asChild>
                    <Link to="/admin/applications">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        신청 목록으로 돌아가기
                    </Link>
                </Button>
            </div>

            {actionData?.success && (
                <Alert className="mb-6">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>성공</AlertTitle>
                    <AlertDescription>{actionData.message}</AlertDescription>
                </Alert>
            )}

            {actionData?.error && (
                <Alert className="mb-6" variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>오류</AlertTitle>
                    <AlertDescription>{actionData.error}</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>신청 상세 정보</CardTitle>
                                    <CardDescription>
                                        신청 ID: {application.application_id}
                                    </CardDescription>
                                </div>
                                <Badge variant={getStatusBadgeVariant(application.application_status)}>
                                    {application.application_status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium">캠페인 정보</h3>
                                <div className="mt-2 p-4 border rounded-md">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-medium">{application.campaign?.title || '캠페인'}</h4>
                                            <p className="text-sm text-gray-500">
                                                예산: {application.campaign?.budget?.toLocaleString() || '0'}원
                                            </p>
                                        </div>
                                        <Button variant="outline" asChild size="sm">
                                            <Link to={`/admin/campaigns/${application.campaign_id}`}>
                                                캠페인 보기
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium">인플루언서 정보</h3>
                                <div className="mt-2 p-4 border rounded-md">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-medium">{application.influencer?.name || '인플루언서'}</h4>
                                            <p className="text-sm text-gray-500">@{application.influencer?.username || ''}</p>
                                        </div>
                                    </div>
                                    {socialAccounts && socialAccounts.length > 0 && (
                                        <div className="mt-4 grid grid-cols-2 gap-4">
                                            {socialAccounts.map((account: any) => (
                                                <div key={account.stat_id} className="p-2 bg-gray-50 rounded">
                                                    <div className="text-sm font-medium">{account.platform}</div>
                                                    <div className="text-sm">팔로워: {account.followers?.toLocaleString() || '0'}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium">신청 메시지</h3>
                                <div className="mt-2 p-4 border rounded-md">
                                    <p className="whitespace-pre-line">{application.message || '메시지 없음'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">신청일</h3>
                                    <p>{formatDate(application.applied_at)}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">마지막 업데이트</h3>
                                    <p>{formatDateTime(application.updated_at)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>상태 관리</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form method="post" onSubmit={() => setIsSubmitting(true)}>
                                <input type="hidden" name="_action" value="updateStatus" />
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="status">상태</Label>
                                        <Select
                                            name="status"
                                            value={status}
                                            onValueChange={(value) => setStatus(value as Database["public"]["Enums"]["application_status"])}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="상태 선택" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(APPLICATION_STATUS).map((status) => (
                                                    <SelectItem key={status} value={status}>
                                                        {status}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="adminComment">관리자 코멘트</Label>
                                        <Textarea
                                            id="adminComment"
                                            name="adminComment"
                                            value={adminComment}
                                            onChange={(e) => setAdminComment(e.target.value)}
                                            placeholder="상태 변경에 대한 코멘트를 입력하세요"
                                            rows={3}
                                        />
                                        <p className="text-sm text-gray-500">
                                            이 코멘트는 내부 관리용으로만 사용되며, 인플루언서에게는 표시되지 않습니다.
                                        </p>
                                    </div>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? "저장 중..." : "상태 업데이트"}
                                    </Button>
                                </div>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 