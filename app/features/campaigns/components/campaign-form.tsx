import { Form } from "react-router";
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
import type { Campaign } from "../types";

export const campaignFormSchema = z.object({
    title: z.string().min(1, "제목을 입력해주세요"),
    description: z.string().min(1, "설명을 입력해주세요"),
    budget: z.number().min(1, "예산을 입력해주세요"),
    target_market: z.enum(["KR", "JP", "BOTH"], {
        required_error: "대상 시장을 선택해주세요",
    }),
    requirements: z.string().min(1, "요구사항을 입력해주세요"),
    period_start: z.string().min(1, "시작일을 입력해주세요"),
    period_end: z.string().min(1, "종료일을 입력해주세요"),
});

interface CampaignFormProps {
    defaultValues?: Partial<Campaign>;
}

export function CampaignForm({ defaultValues }: CampaignFormProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div>
                    <label htmlFor="title" className="text-sm font-medium">캠페인 제목</label>
                    <Input
                        id="title"
                        name="title"
                        defaultValue={defaultValues?.title}
                        placeholder="캠페인 제목을 입력하세요"
                    />
                </div>

                <div>
                    <label htmlFor="description" className="text-sm font-medium">캠페인 설명</label>
                    <Textarea
                        id="description"
                        name="description"
                        defaultValue={defaultValues?.description}
                        placeholder="캠페인 설명을 입력하세요"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="budget" className="text-sm font-medium">예산</label>
                        <Input
                            id="budget"
                            name="budget"
                            type="number"
                            defaultValue={defaultValues?.budget}
                            placeholder="예산을 입력하세요"
                        />
                    </div>

                    <div>
                        <label htmlFor="target_market" className="text-sm font-medium">대상 시장</label>
                        <Select name="target_market" defaultValue={defaultValues?.target_market || "KR"}>
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

                <div>
                    <label htmlFor="requirements" className="text-sm font-medium">지원 요건</label>
                    <Textarea
                        id="requirements"
                        name="requirements"
                        defaultValue={defaultValues?.requirements}
                        placeholder="지원 요건을 입력하세요"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="period_start" className="text-sm font-medium">시작일</label>
                        <Input
                            id="period_start"
                            name="period_start"
                            type="date"
                            defaultValue={defaultValues?.period_start}
                        />
                    </div>

                    <div>
                        <label htmlFor="period_end" className="text-sm font-medium">종료일</label>
                        <Input
                            id="period_end"
                            name="period_end"
                            type="date"
                            defaultValue={defaultValues?.period_end}
                        />
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