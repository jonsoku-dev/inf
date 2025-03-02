import { z } from "zod";
import InputPair from "~/common/components/input-pair";
import SelectPair from "~/common/components/select-pair";
import { Button } from "~/common/components/ui/button";
import { Checkbox } from "~/common/components/ui/checkbox";
import { Label } from "~/common/components/ui/label";
import { CAMPAIGN_TYPE } from "../constants";

export const campaignFormSchema = z.object({
    title: z.string().min(1, "제목을 입력해주세요"),
    description: z.string().min(1, "설명을 입력해주세요"),
    budget: z.number().min(1, "예산을 입력해주세요"),
    campaign_type: z.enum(["INSTAGRAM", "YOUTUBE", "TIKTOK", "BLOG"], {
        required_error: "캠페인 유형을 선택해주세요",
    }),
    target_market: z.enum(["KR", "JP", "BOTH"], {
        required_error: "대상 시장을 선택해주세요",
    }),
    requirements: z.array(z.string()).min(1, "요구사항을 입력해주세요"),
    start_date: z.string().min(1, "시작일을 입력해주세요"),
    end_date: z.string().min(1, "종료일을 입력해주세요"),
    is_negotiable: z.boolean().default(false),
    is_urgent: z.boolean().default(false),
    min_followers: z.number().nullable(),
    preferred_gender: z.enum(["MALE", "FEMALE", "OTHER", "ANY"]).nullable(),
    location_requirements: z.string().nullable(),
    max_applications: z.number().nullable(),
    keywords: z.array(z.string()).default([]),
    categories: z.array(z.string()).default([]),
});

export type CampaignFormData = z.infer<typeof campaignFormSchema>;

interface CampaignFormProps {
    defaultValues?: Partial<CampaignFormData>;
    isSubmitting?: boolean;
}

export function CampaignForm({ defaultValues, isSubmitting }: CampaignFormProps) {
    const campaignTypeOptions = [
        { label: "인스타그램", value: "INSTAGRAM" },
        { label: "유튜브", value: "YOUTUBE" },
        { label: "틱톡", value: "TIKTOK" },
        { label: "블로그", value: "BLOG" },
    ];

    const targetMarketOptions = [
        { label: "한국", value: "KR" },
        { label: "일본", value: "JP" },
        { label: "한국/일본", value: "BOTH" },
    ];

    const genderOptions = [
        { label: "남성", value: "MALE" },
        { label: "여성", value: "FEMALE" },
        { label: "기타", value: "OTHER" },
        { label: "무관", value: "ANY" },
    ];

    // 오늘 날짜를 YYYY-MM-DD 형식으로 가져오기
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <InputPair
                    id="title"
                    name="title"
                    label="캠페인 제목"
                    description="캠페인의 제목을 입력하세요"
                    defaultValue={defaultValues?.title}
                    placeholder="예: 신제품 홍보 인스타그램 캠페인"
                    required
                />

                <InputPair
                    id="description"
                    name="description"
                    label="캠페인 설명"
                    description="캠페인에 대한 상세 설명을 입력하세요"
                    defaultValue={defaultValues?.description}
                    placeholder="캠페인의 목적, 원하는 콘텐츠 유형, 브랜드 가이드라인 등을 자세히 설명해주세요"
                    textArea
                    required
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <SelectPair
                        name="campaign_type"
                        label="캠페인 유형"
                        description="인플루언서가 콘텐츠를 게시할 플랫폼"
                        placeholder="플랫폼 선택"
                        options={campaignTypeOptions}
                        defaultValue={defaultValues?.campaign_type}
                        required
                    />

                    <SelectPair
                        name="target_market"
                        label="대상 시장"
                        description="캠페인이 타겟팅하는 국가"
                        placeholder="국가 선택"
                        options={targetMarketOptions}
                        defaultValue={defaultValues?.target_market}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InputPair
                        id="budget"
                        name="budget"
                        type="number"
                        label="예산"
                        description="캠페인 예산 (원 단위)"
                        defaultValue={defaultValues?.budget?.toString()}
                        placeholder="예: 500000"
                        required
                    />

                    <InputPair
                        id="min_followers"
                        name="min_followers"
                        type="number"
                        label="최소 팔로워 수"
                        description="인플루언서의 최소 팔로워 수 요건"
                        defaultValue={defaultValues?.min_followers?.toString() || ""}
                        placeholder="예: 5000"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InputPair
                        id="start_date"
                        name="start_date"
                        type="date"
                        label="시작일"
                        description="캠페인 시작 날짜"
                        defaultValue={defaultValues?.start_date || today}
                        min={today}
                        required
                    />

                    <InputPair
                        id="end_date"
                        name="end_date"
                        type="date"
                        label="종료일"
                        description="캠페인 종료 날짜"
                        defaultValue={defaultValues?.end_date || ""}
                        min={today}
                        required
                    />
                </div>

                <InputPair
                    id="requirements"
                    name="requirements"
                    label="지원 요건"
                    description="인플루언서에게 요구되는 사항 (줄바꿈으로 구분)"
                    defaultValue={defaultValues?.requirements?.join("\n") || ""}
                    placeholder="예:\n- 20-30대 타겟 콘텐츠 제작 경험\n- 화장품 관련 콘텐츠 제작 경험\n- 제품 사용 후기 포스팅 가능"
                    textArea
                    required
                />

                <InputPair
                    id="keywords"
                    name="keywords"
                    label="키워드"
                    description="캠페인 관련 키워드 (쉼표로 구분)"
                    defaultValue={defaultValues?.keywords?.join(", ") || ""}
                    placeholder="예: 화장품, 뷰티, 스킨케어"
                />

                <SelectPair
                    name="preferred_gender"
                    label="선호 성별"
                    description="인플루언서 선호 성별 (선택사항)"
                    placeholder="성별 선택"
                    options={genderOptions}
                    defaultValue={defaultValues?.preferred_gender || "ANY"}
                />

                <InputPair
                    id="location_requirements"
                    name="location_requirements"
                    label="지역 요건"
                    description="특정 지역 요건이 있는 경우 입력"
                    defaultValue={defaultValues?.location_requirements || ""}
                    placeholder="예: 서울 지역 거주자 선호"
                />

                <div className="space-y-2 pt-2">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="is_negotiable"
                            name="is_negotiable"
                            defaultChecked={defaultValues?.is_negotiable}
                        />
                        <Label htmlFor="is_negotiable" className="text-sm font-normal md:text-base">
                            예산 협의 가능
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="is_urgent"
                            name="is_urgent"
                            defaultChecked={defaultValues?.is_urgent}
                        />
                        <Label htmlFor="is_urgent" className="text-sm font-normal md:text-base">
                            긴급 모집
                        </Label>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                    {isSubmitting ? "처리 중..." : defaultValues ? "수정하기" : "등록하기"}
                </Button>
            </div>
        </div>
    );
} 