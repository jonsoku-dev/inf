import type { Database } from "database-generated.types";
import { useState } from "react";
import { Link, redirect } from "react-router";
import { CAMPAIGN_STATUS, CAMPAIGN_TYPE } from "~/features/campaigns/constants";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "~/common/components/ui/button";
import { Calendar } from "~/common/components/ui/calendar";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "~/common/components/ui/card";
import { Input } from "~/common/components/ui/input";
import { Label } from "~/common/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "~/common/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/common/components/ui/select";
import { Textarea } from "~/common/components/ui/textarea";
import { getServerClient } from "~/server";
import type { Route } from "./+types/new-page";
import { DateTime } from "luxon";

export const loader = async ({ request }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    // 광고주 목록 조회
    const { data: advertisers, error } = await supabase
        .from('profiles')
        .select('profile_id, name, username')
        .eq('role', 'ADVERTISER');

    if (error) {
        console.error("Error fetching advertisers:", error);
        return { advertisers: [] };
    }

    return { advertisers: advertisers || [] };
};

export const action = async ({ request }: Route.ActionArgs) => {
    const { supabase } = getServerClient(request);
    const formData = await request.formData();

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
    const requirementsArray = requirements ? [requirements] : [];
    const maxInfluencers = parseInt(formData.get("maxInfluencers") as string) || null;
    const campaignStatus = formData.get("campaignStatus") as Database["public"]["Enums"]["campaign_status"];
    const isNegotiable = formData.get("is_negotiable") === "on";
    const isUrgent = formData.get("is_urgent") === "on";

    // 필수 필드 검증
    if (!title || !description || !advertiserId || !budget || !startDate || !endDate || !targetMarket || !campaignStatus) {
        return { error: "모든 필수 필드를 입력해주세요." };
    }

    try {
        // 빈 카테고리와 키워드 배열 (필수 필드)
        const emptyCategories: string[] = [];
        const emptyKeywords: string[] = [];

        const { data, error } = await supabase
            .from('campaigns')
            .insert({
                title,
                description,
                advertiser_id: advertiserId,
                budget,
                start_date: startDate,
                end_date: endDate,
                target_market: targetMarket,
                requirements: requirementsArray,
                max_applications: maxInfluencers,
                campaign_status: campaignStatus,
                campaign_type: CAMPAIGN_TYPE.INSTAGRAM,
                categories: emptyCategories,
                keywords: emptyKeywords,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select();

        if (error) throw error;

        if (data && data.length > 0) {
            return redirect(`/admin/campaigns/${data[0].campaign_id}`);
        }

        return { success: true, message: "캠페인이 성공적으로 생성되었습니다." };
    } catch (error) {
        console.error("Error creating campaign:", error);
        return { error: "캠페인 생성에 실패했습니다." };
    }
};

export const meta = () => {
    return [
        { title: "새 캠페인 등록 - 관리자" },
        { name: "description", content: "새로운 캠페인을 등록합니다." }
    ];
};

export default function NewCampaignAdminPage({ loaderData, actionData }: {
    loaderData: {
        advertisers: any[]
    };
    actionData?: {
        success?: boolean;
        error?: string;
        message?: string
    }
}) {
    const { advertisers } = loaderData;

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [advertiserId, setAdvertiserId] = useState("");
    const [budget, setBudget] = useState<number | "">("");
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [targetMarket, setTargetMarket] = useState<Database["public"]["Enums"]["target_market"] | "">("");
    const [requirements, setRequirements] = useState("");
    const [maxInfluencers, setMaxInfluencers] = useState<number | "">("");
    const [campaignStatus, setCampaignStatus] = useState<Database["public"]["Enums"]["campaign_status"] | "">(CAMPAIGN_STATUS.DRAFT);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const form = e.target as HTMLFormElement;
        form.submit();
    };

    // 오늘 날짜를 기본값으로 설정
    const today = DateTime.now().toISODate();
    const nextMonth = DateTime.now().plus({ months: 1 }).toISODate();

    return (
        <div className="container mx-auto py-8">
            {actionData?.error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {actionData.error}
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link to="/admin/campaigns">목록으로</Link>
                    </Button>
                    <h1 className="text-2xl font-bold">새 캠페인 등록</h1>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>캠페인 정보 입력</CardTitle>
                    <CardDescription>
                        새로운 캠페인 정보를 입력합니다. 모든 필수 항목(*)을 입력해주세요.
                    </CardDescription>
                </CardHeader>
                <form method="post" onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">캠페인 제목 *</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="advertiserId">광고주 *</Label>
                                <Select
                                    value={advertiserId}
                                    onValueChange={setAdvertiserId}
                                    name="advertiserId"
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="광고주 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {advertisers.map((advertiser) => (
                                            <SelectItem key={advertiser.profile_id} value={advertiser.profile_id}>
                                                {advertiser.name} (@{advertiser.username})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">캠페인 설명 *</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={5}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="budget">예산 (원) *</Label>
                                <Input
                                    id="budget"
                                    name="budget"
                                    type="number"
                                    min="0"
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value ? parseInt(e.target.value) : "")}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="maxInfluencers">모집 인원 (선택)</Label>
                                <Input
                                    id="maxInfluencers"
                                    name="maxInfluencers"
                                    type="number"
                                    min="1"
                                    value={maxInfluencers}
                                    onChange={(e) => setMaxInfluencers(e.target.value ? parseInt(e.target.value) : "")}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="targetMarket">타겟 시장 *</Label>
                                <Select
                                    value={targetMarket}
                                    onValueChange={(value) => setTargetMarket(value as Database["public"]["Enums"]["target_market"])}
                                    name="targetMarket"
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="타겟 시장 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="KR">한국</SelectItem>
                                        <SelectItem value="JP">일본</SelectItem>
                                        <SelectItem value="BOTH">한국 & 일본</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">시작일</Label>
                                <Input
                                    id="startDate"
                                    name="startDate"
                                    type="date"
                                    defaultValue={today}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDate">종료일</Label>
                                <Input
                                    id="endDate"
                                    name="endDate"
                                    type="date"
                                    defaultValue={nextMonth}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="requirements">요구사항 (선택)</Label>
                            <Textarea
                                id="requirements"
                                name="requirements"
                                value={requirements}
                                onChange={(e) => setRequirements(e.target.value)}
                                rows={3}
                                placeholder="인플루언서에게 요구하는 사항을 입력하세요"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="campaignStatus">캠페인 상태 *</Label>
                            <Select
                                value={campaignStatus}
                                onValueChange={(value) => setCampaignStatus(value as Database["public"]["Enums"]["campaign_status"])}
                                name="campaignStatus"
                                required
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
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" asChild>
                            <Link to="/admin/campaigns">취소</Link>
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "저장 중..." : "저장"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
} 