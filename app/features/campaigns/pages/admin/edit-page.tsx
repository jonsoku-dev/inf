import type { Database } from "database-generated.types";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Checkbox } from "~/common/components/ui/checkbox";
import { CAMPAIGN_STATUS, CAMPAIGN_TYPE } from "~/features/campaigns/constants";

import { Button } from "~/common/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "~/common/components/ui/card";
import { Input } from "~/common/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/common/components/ui/select";
import { Textarea } from "~/common/components/ui/textarea";
import { getServerClient } from "~/server";
import type { Route } from "./+types/edit-page";
import { DateTime } from "luxon";
import { Label } from "~/common/components/ui/label";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
    const { campaignId } = params;
    const { supabase } = getServerClient(request);

    if (!campaignId) {
        throw new Error("캠페인 ID가 필요합니다.");
    }

    // 캠페인 정보 조회
    const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select(`
            *,
            advertiser:profiles(*)
        `)
        .eq('campaign_id', campaignId)
        .single();

    if (campaignError) {
        console.error("Error fetching campaign:", campaignError);
        throw new Error("캠페인을 찾을 수 없습니다.");
    }

    // 광고주 목록 조회
    const { data: advertisers, error: advertisersError } = await supabase
        .from('profiles')
        .select('profile_id, name, username')
        .eq('role', 'ADVERTISER');

    if (advertisersError) {
        console.error("Error fetching advertisers:", advertisersError);
    }

    return {
        campaign,
        advertisers: advertisers || []
    };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
    const { supabase } = getServerClient(request);
    const formData = await request.formData();
    const campaignId = params.campaignId;

    // 폼 데이터 추출
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const advertiserId = formData.get("advertiserId") as string;
    const budget = parseInt(formData.get("budget") as string);
    const startDateStr = formData.get("startDate") as string;
    const endDateStr = formData.get("endDate") as string;

    // Luxon을 사용하여 날짜 형식 변환
    const startDate = DateTime.fromISO(startDateStr).toISODate();
    const endDate = DateTime.fromISO(endDateStr).toISODate();

    const targetMarket = formData.get("targetMarket") as Database["public"]["Enums"]["target_market"];
    const requirements = formData.get("requirements") as string;
    const requirementsArray = requirements ? [requirements] : []; // 문자열을 배열로 변환
    const maxInfluencers = formData.get("maxInfluencers") as string;
    const campaignStatus = formData.get("campaignStatus") as Database["public"]["Enums"]["campaign_status"];
    const isNegotiable = formData.get("is_negotiable") === "on";
    const isUrgent = formData.get("is_urgent") === "on";
    const adminComment = formData.get("adminComment") as string;

    // 필수 필드 검증
    if (!title || !description || !advertiserId || !budget || !startDate || !endDate || !targetMarket || !campaignStatus) {
        return { error: "모든 필수 필드를 입력해주세요." };
    }

    try {
        const { data, error } = await supabase
            .from('campaigns')
            .update({
                title,
                description,
                advertiser_id: advertiserId,
                budget,
                start_date: startDate,
                end_date: endDate,
                target_market: targetMarket,
                requirements: requirementsArray,
                max_applications: maxInfluencers ? parseInt(maxInfluencers) : null,
                campaign_status: campaignStatus,
                is_negotiable: isNegotiable,
                is_urgent: isUrgent,
                updated_at: new Date().toISOString()
            })
            .eq('campaign_id', campaignId)
            .select();

        if (error) throw error;

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
                    campaign_id: campaignId,
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

        return { success: true, message: "캠페인이 성공적으로 업데이트되었습니다." };
    } catch (error) {
        console.error("Error updating campaign:", error);
        return { error: "캠페인 업데이트에 실패했습니다." };
    }
};

export const meta = () => {
    return [
        { title: "캠페인 수정 - 관리자" },
        { name: "description", content: "캠페인 정보를 수정합니다." }
    ];
};

export default function CampaignEditAdminPage({ loaderData, actionData }: {
    loaderData: {
        campaign: any;
        advertisers: any[]
    };
    actionData?: {
        success?: boolean;
        error?: string;
        message?: string
    }
}) {
    const navigate = useNavigate();
    const { campaign, advertisers } = loaderData;

    // 캠페인 데이터 초기화
    const [title, setTitle] = useState(campaign.title);
    const [description, setDescription] = useState(campaign.description);
    const [advertiserId, setAdvertiserId] = useState(campaign.advertiser_id);
    const [budget, setBudget] = useState<number | "">(campaign.budget);
    const [startDate, setStartDate] = useState(campaign.start_date);
    const [endDate, setEndDate] = useState(campaign.end_date);
    const [targetMarket, setTargetMarket] = useState(campaign.target_market);
    const [requirements, setRequirements] = useState(campaign.requirements ? campaign.requirements.join("\n") : "");
    const [maxInfluencers, setMaxInfluencers] = useState<number | "">(campaign.max_applications || "");
    const [campaignStatus, setCampaignStatus] = useState(campaign.campaign_status);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 카테고리와 키워드 문자열로 변환
    const categoriesString = Array.isArray(campaign.categories) ? campaign.categories.join(", ") : "";
    const keywordsString = Array.isArray(campaign.keywords) ? campaign.keywords.join(", ") : "";

    // Luxon을 사용하여 날짜 형식 변환
    const formattedStartDate = campaign?.start_date
        ? DateTime.fromISO(campaign.start_date).toISODate() || ''
        : '';
    const formattedEndDate = campaign?.end_date
        ? DateTime.fromISO(campaign.end_date).toISODate() || ''
        : '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const form = e.target as HTMLFormElement;
        form.submit();
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

            <div className="flex items-center mb-6">
                <Link to={`/admin/campaigns/${campaign.campaign_id}`} className="flex items-center text-gray-600 hover:text-gray-900">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    캠페인 상세로 돌아가기
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>캠페인 수정</CardTitle>
                    <CardDescription>
                        캠페인 정보를 수정하세요.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form method="post" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="title" className="text-sm font-medium">
                                        캠페인 제목 <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="title"
                                        name="title"
                                        defaultValue={campaign.title}
                                        placeholder="캠페인 제목을 입력하세요"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="advertiser_id" className="text-sm font-medium">
                                        광고주 <span className="text-red-500">*</span>
                                    </label>
                                    <Select name="advertiser_id" defaultValue={campaign.advertiser_id}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="광고주 선택" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {advertisers.map((advertiser: any) => (
                                                <SelectItem key={advertiser.profile_id} value={advertiser.profile_id}>
                                                    {advertiser.name} ({advertiser.username})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="budget" className="text-sm font-medium">
                                        예산 (원) <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="budget"
                                        name="budget"
                                        type="number"
                                        defaultValue={campaign.budget}
                                        placeholder="예산을 입력하세요"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="startDate">시작일</Label>
                                    <Input
                                        id="startDate"
                                        name="startDate"
                                        type="date"
                                        defaultValue={formattedStartDate}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endDate">종료일</Label>
                                    <Input
                                        id="endDate"
                                        name="endDate"
                                        type="date"
                                        defaultValue={formattedEndDate}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="campaign_type" className="text-sm font-medium">
                                        캠페인 유형 <span className="text-red-500">*</span>
                                    </label>
                                    <Select name="campaign_type" defaultValue={campaign.campaign_type}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="캠페인 유형 선택" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(CAMPAIGN_TYPE).map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="campaign_status" className="text-sm font-medium">
                                        캠페인 상태 <span className="text-red-500">*</span>
                                    </label>
                                    <Select name="campaign_status" defaultValue={campaign.campaign_status}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="캠페인 상태 선택" />
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
                                    <label htmlFor="target_market" className="text-sm font-medium">
                                        타겟 시장 <span className="text-red-500">*</span>
                                    </label>
                                    <Select name="target_market" defaultValue={campaign.target_market}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="타겟 시장 선택" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="KR">한국</SelectItem>
                                            <SelectItem value="JP">일본</SelectItem>
                                            <SelectItem value="BOTH">한국 및 일본</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center space-x-6">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_negotiable"
                                            name="is_negotiable"
                                            defaultChecked={campaign.is_negotiable}
                                        />
                                        <label
                                            htmlFor="is_negotiable"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            협상 가능
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_urgent"
                                            name="is_urgent"
                                            defaultChecked={campaign.is_urgent}
                                        />
                                        <label
                                            htmlFor="is_urgent"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            긴급 캠페인
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="description" className="text-sm font-medium">
                                        캠페인 설명 <span className="text-red-500">*</span>
                                    </label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        defaultValue={campaign.description}
                                        placeholder="캠페인에 대한 상세 설명을 입력하세요"
                                        className="min-h-[120px]"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="categories" className="text-sm font-medium">
                                        카테고리 (쉼표로 구분) <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="categories"
                                        name="categories"
                                        defaultValue={categoriesString}
                                        placeholder="패션, 뷰티, 음식 등"
                                        required
                                    />
                                    <p className="text-xs text-gray-500">
                                        여러 카테고리는 쉼표(,)로 구분하여 입력하세요.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="keywords" className="text-sm font-medium">
                                        키워드 (쉼표로 구분) <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="keywords"
                                        name="keywords"
                                        defaultValue={keywordsString}
                                        placeholder="인스타그램, 리뷰, 홍보 등"
                                        required
                                    />
                                    <p className="text-xs text-gray-500">
                                        여러 키워드는 쉼표(,)로 구분하여 입력하세요.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="requirements" className="text-sm font-medium">
                                        요구사항 (줄바꿈으로 구분)
                                    </label>
                                    <Textarea
                                        id="requirements"
                                        name="requirements"
                                        defaultValue={requirements}
                                        placeholder="각 줄에 하나의 요구사항을 입력하세요"
                                        className="min-h-[120px]"
                                    />
                                    <p className="text-xs text-gray-500">
                                        각 줄에 하나의 요구사항을 입력하세요.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="adminComment">관리자 코멘트</Label>
                                    <Textarea
                                        id="adminComment"
                                        name="adminComment"
                                        placeholder="캠페인 수정에 대한 코멘트를 입력하세요"
                                        rows={3}
                                    />
                                    <p className="text-sm text-gray-500">
                                        이 코멘트는 내부 관리용으로만 사용되며, 광고주에게는 표시되지 않습니다.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <Button variant="outline" asChild>
                                <Link to={`/admin/campaigns/${campaign.campaign_id}`}>취소</Link>
                            </Button>
                            <Button type="submit">캠페인 업데이트</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
} 