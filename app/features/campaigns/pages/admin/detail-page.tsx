import type { Database } from "database-generated.types";
import { useState } from "react";
import { useNavigate, Form, useNavigation, useActionData } from "react-router";
import { CAMPAIGN_STATUS } from "~/features/campaigns/constants";

import {
    AlertCircle, ArrowLeft, CheckCircle,
    Loader2
} from "lucide-react";
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
import type { Route } from "./+types/detail-page";
import { getServerClient } from "~/server";

// 액션 데이터 타입 정의
interface ActionDataSuccess {
    success: true;
    message: string;
}

interface ActionDataError {
    error: string;
}

type ActionData = ActionDataSuccess | ActionDataError;

export const loader = async ({ params, request }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const { campaignId } = params;

    if (!campaignId) {
        throw new Response("캠페인 ID가 필요합니다", { status: 400 });
    }

    try {
        // 캠페인 정보 가져오기
        const { data: campaignData, error: campaignError } = await supabase
            .from('campaigns')
            .select(`
                *,
                advertiser:profiles(*)
            `)
            .eq('campaign_id', campaignId);

        if (campaignError) throw campaignError;

        // 결과가 없는 경우 처리
        if (!campaignData || campaignData.length === 0) {
            throw new Response("캠페인을 찾을 수 없습니다", { status: 404 });
        }

        const campaign = campaignData[0];

        // 관리자 코멘트 가져오기
        const { data: adminComments, error: commentsError } = await supabase
            .from('campaign_admin_comments')
            .select(`
                *,
                admin:profiles(*)
            `)
            .eq('campaign_id', campaignId)
            .order('created_at', { ascending: false });

        if (commentsError) throw commentsError;

        // 지원자 정보 가져오기
        const { data: applications, error: applicationsError } = await supabase
            .from('applications')
            .select(`
                *,
                influencer:profiles(*)
            `)
            .eq('campaign_id', campaignId);

        if (applicationsError) throw applicationsError;

        return {
            campaign,
            adminComments: adminComments || [],
            applications: applications || [],
        };
    } catch (error) {
        throw new Response("캠페인 정보를 가져오는데 실패했습니다", { status: 500 });
    };
};

export const action = async ({ params, request }: Route.ActionArgs) => {
    const { supabase } = getServerClient(request);
    const { campaignId } = params;
    const formData = await request.formData();
    const intent = formData.get("intent");

    if (!campaignId) {
        return new Response(JSON.stringify({ error: "캠페인 ID가 필요합니다" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    if (intent === "update-status") {
        const newStatus = formData.get("status") as Database["public"]["Enums"]["campaign_status"];
        const adminComment = formData.get("adminComment") as string;

        if (!Object.values(CAMPAIGN_STATUS).includes(newStatus)) {
            return new Response(JSON.stringify({ error: "유효하지 않은 상태입니다" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        try {
            // 트랜잭션 시작
            const { data: { user } } = await supabase.auth.getUser();
            console.log({ user });
            if (!user?.id) {
                return new Response(JSON.stringify({ error: "인증이 필요합니다" }), {
                    status: 401,
                    headers: { "Content-Type": "application/json" }
                });
            }

            // 1. 캠페인 상태 업데이트
            const { error: campaignError } = await supabase
                .from('campaigns')
                .update({
                    campaign_status: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('campaign_id', campaignId);

            if (campaignError) throw campaignError;

            // 2. 관리자 코멘트가 있는 경우 코멘트 추가
            if (adminComment && adminComment.trim() !== '') {
                const { error: commentError } = await supabase
                    .from('campaign_admin_comments')
                    .insert({
                        campaign_id: campaignId,
                        admin_id: user.id,
                        comment: adminComment,
                    });

                if (commentError) throw commentError;
            }

            return new Response(JSON.stringify({ success: true, message: "캠페인 상태가 업데이트되었습니다" }), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: "캠페인 상태 업데이트에 실패했습니다" }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }
    }

    return new Response(JSON.stringify({ error: "알 수 없는 작업입니다" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
    });
};

export const meta = ({ data }: Route.MetaArgs) => {
    return [
        { title: `관리자 - ${data?.campaign?.title || "캠페인 상세"} | 인플루언서 플랫폼` },
        { name: "description", content: "캠페인 상세 정보 및 관리" },
    ];
};

export default function CampaignDetailAdminPage({ loaderData }: Route.ComponentProps) {
    const { campaign, adminComments, applications } = loaderData;
    const [selectedStatus, setSelectedStatus] = useState<Database["public"]["Enums"]["campaign_status"]>(campaign.campaign_status);
    const [adminComment, setAdminComment] = useState("");
    const navigate = useNavigate();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";
    const actionData = useActionData() as ActionData;

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case CAMPAIGN_STATUS.DRAFT:
                return "secondary";
            case CAMPAIGN_STATUS.PUBLISHED:
                return "success";
            case CAMPAIGN_STATUS.CLOSED:
                return "destructive";
            case CAMPAIGN_STATUS.CANCELLED:
                return "destructive";
            case CAMPAIGN_STATUS.COMPLETED:
                return "success";
            default:
                return "default";
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("ko-KR", {
            style: "currency",
            currency: "KRW",
        }).format(amount);
    };

    const getApplicationStatusBadgeColor = (status: string) => {
        switch (status) {
            case "APPROVED":
                return "success";
            case "REJECTED":
                return "destructive";
            case "PENDING":
                return "secondary";
            default:
                return "default";
        }
    };

    return (
        <div className="container mx-auto py-8">
            {actionData && 'error' in actionData && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>오류</AlertTitle>
                    <AlertDescription>{actionData.error}</AlertDescription>
                </Alert>
            )}

            {actionData && 'success' in actionData && (
                <Alert variant="default" className="mb-4 bg-green-50 text-green-800 border-green-200">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>성공</AlertTitle>
                    <AlertDescription>{actionData.message}</AlertDescription>
                </Alert>
            )}

            <div className="flex justify-between items-center mb-6">
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> 뒤로 가기
                </Button>
                <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeColor(campaign.campaign_status)}>
                        {campaign.campaign_status}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{campaign.title}</CardTitle>
                            <CardDescription>
                                {campaign.advertiser?.name || '광고주'} • {formatDate(campaign.created_at)}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium">설명</h3>
                                <p className="mt-1 whitespace-pre-line">{campaign.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">예산</h3>
                                    <p>{formatCurrency(campaign.budget)}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">캠페인 유형</h3>
                                    <p>{campaign.campaign_type}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">시작일</h3>
                                    <p>{formatDate(campaign.start_date)}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">종료일</h3>
                                    <p>{formatDate(campaign.end_date)}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">대상 시장</h3>
                                    <p>{campaign.target_market}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">카테고리</h3>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {campaign.categories && Array.isArray(campaign.categories) && campaign.categories.map((category: any) => (
                                            <Badge key={category} variant="outline">{String(category)}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 관리자 코멘트 섹션 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>관리자 코멘트</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {adminComments.length > 0 ? (
                                <div className="space-y-4">
                                    {adminComments.map((comment: any) => (
                                        <div key={comment.comment_id} className="p-3 bg-gray-50 rounded-md">
                                            <div className="flex justify-between items-start">
                                                <div className="font-medium">{comment.admin?.name || '관리자'}</div>
                                                <div className="text-sm text-gray-500">{formatDate(comment.created_at)}</div>
                                            </div>
                                            <p className="mt-1 whitespace-pre-line">{comment.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">아직 코멘트가 없습니다.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* 지원자 목록 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>지원자 목록</CardTitle>
                            <CardDescription>총 {applications.length}명의 인플루언서가 지원했습니다.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {applications.length > 0 ? (
                                <div className="space-y-4">
                                    {applications.map((application: any) => (
                                        <div key={application.application_id} className="p-4 border rounded-md">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-medium">{application.influencer?.name || '인플루언서'}</h3>
                                                    <p className="text-sm text-gray-500">{application.influencer?.username || ''}</p>
                                                </div>
                                                <Badge variant={getApplicationStatusBadgeColor(application.status)}>
                                                    {application.status}
                                                </Badge>
                                            </div>
                                            {application.message && (
                                                <div className="mt-2">
                                                    <h4 className="text-sm font-medium">메시지</h4>
                                                    <p className="text-sm mt-1">{application.message}</p>
                                                </div>
                                            )}
                                            <div className="mt-2 text-sm text-gray-500">
                                                지원일: {formatDate(application.created_at)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">아직 지원자가 없습니다.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>캠페인 상태 관리</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form method="post" action="">
                                <input type="hidden" name="intent" value="update-status" />
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="status">상태</Label>
                                        <Select
                                            name="status"
                                            value={selectedStatus}
                                            onValueChange={(value: Database["public"]["Enums"]["campaign_status"]) => setSelectedStatus(value)}
                                            disabled={isSubmitting}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="상태 선택" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(CAMPAIGN_STATUS).map((status) => (
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
                                            placeholder="상태 변경에 대한 코멘트를 입력하세요"
                                            value={adminComment}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAdminComment(e.target.value)}
                                            rows={4}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                업데이트 중...
                                            </>
                                        ) : (
                                            "상태 업데이트"
                                        )}
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