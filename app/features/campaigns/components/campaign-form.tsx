import { z } from "zod";
import { Input } from "~/common/components/ui/input";
import { Textarea } from "~/common/components/ui/textarea";
import { Button } from "~/common/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/common/components/ui/select";
import { Checkbox } from "~/common/components/ui/checkbox";
import { Label } from "~/common/components/ui/label";

export const campaignFormSchema = z.object({
    title: z.string().min(1, "제목을 입력해주세요"),
    description: z.string().min(1, "설명을 입력해주세요"),
    budget: z.number().min(1, "예산을 입력해주세요"),
    campaign_type: z.enum(["INSTAGRAM", "YOUTUBE", "TIKTOK", "BLOG"], {
        required_error: "캠페인 유형을 선택해주세요",
    }),
    target_market: z.string().min(1, "대상 시장을 선택해주세요"),
    requirements: z.array(z.string()).min(1, "요구사항을 입력해주세요"),
    start_date: z.string().min(1, "시작일을 입력해주세요"),
    end_date: z.string().min(1, "종료일을 입력해주세요"),
    is_negotiable: z.boolean().default(false),
    is_urgent: z.boolean().default(false),
    min_followers: z.number().nullable(),
    preferred_gender: z.enum(["MALE", "FEMALE", "ANY"]).nullable(),
    location_requirements: z.string().nullable(),
    max_applications: z.number().nullable(),
    keywords: z.array(z.string()).default([]),
    categories: z.array(z.string()).default([]),
});

export type CampaignFormData = z.infer<typeof campaignFormSchema>;

interface CampaignFormProps {
    defaultValues?: Partial<CampaignFormData>;
}

export function CampaignForm({ defaultValues }: CampaignFormProps) {
    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <div>
                    <Label htmlFor="title">캠페인 제목</Label>
                    <Input
                        id="title"
                        name="title"
                        defaultValue={defaultValues?.title}
                        placeholder="캠페인 제목을 입력하세요"
                    />
                </div>

                <div>
                    <Label htmlFor="description">캠페인 설명</Label>
                    <Textarea
                        id="description"
                        name="description"
                        defaultValue={defaultValues?.description}
                        placeholder="캠페인 설명을 입력하세요"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="campaign_type">캠페인 유형</Label>
                        <Select name="campaign_type" defaultValue={defaultValues?.campaign_type}>
                            <SelectTrigger>
                                <SelectValue placeholder="캠페인 유형을 선택하세요" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="INSTAGRAM">인스타그램</SelectItem>
                                <SelectItem value="YOUTUBE">유튜브</SelectItem>
                                <SelectItem value="TIKTOK">틱톡</SelectItem>
                                <SelectItem value="BLOG">블로그</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="target_market">대상 시장</Label>
                        <Select name="target_market" defaultValue={defaultValues?.target_market}>
                            <SelectTrigger>
                                <SelectValue placeholder="대상 시장을 선택하세요" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="KR">한국</SelectItem>
                                <SelectItem value="JP">일본</SelectItem>
                                <SelectItem value="BOTH">한국/일본</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="budget">예산</Label>
                        <Input
                            id="budget"
                            name="budget"
                            type="number"
                            defaultValue={defaultValues?.budget}
                            placeholder="예산을 입력하세요"
                        />
                        <div className="mt-2">
                            <Checkbox
                                id="is_negotiable"
                                name="is_negotiable"
                                defaultChecked={defaultValues?.is_negotiable}
                            />
                            <Label htmlFor="is_negotiable" className="ml-2">협의 가능</Label>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="min_followers">최소 팔로워 수</Label>
                        <Input
                            id="min_followers"
                            name="min_followers"
                            type="number"
                            defaultValue={defaultValues?.min_followers ?? ""}
                            placeholder="최소 팔로워 수를 입력하세요"
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="requirements">지원 요건</Label>
                    <Textarea
                        id="requirements"
                        name="requirements"
                        defaultValue={defaultValues?.requirements?.join("\n")}
                        placeholder="지원 요건을 입력하세요 (줄바꿈으로 구분)"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="start_date">시작일</Label>
                        <Input
                            id="start_date"
                            name="start_date"
                            type="date"
                            defaultValue={defaultValues?.start_date}
                        />
                    </div>

                    <div>
                        <Label htmlFor="end_date">종료일</Label>
                        <Input
                            id="end_date"
                            name="end_date"
                            type="date"
                            defaultValue={defaultValues?.end_date}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div>
                        <Checkbox
                            id="is_urgent"
                            name="is_urgent"
                            defaultChecked={defaultValues?.is_urgent}
                        />
                        <Label htmlFor="is_urgent" className="ml-2">긴급 모집</Label>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Button type="submit">
                    {defaultValues ? "수정하기" : "등록하기"}
                </Button>
            </div>
        </div>
    );
} 