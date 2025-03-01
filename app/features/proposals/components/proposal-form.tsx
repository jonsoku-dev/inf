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
import { Badge } from "~/common/components/ui/badge";
import { X } from "lucide-react";
import { useState } from "react";
import {
    CONTENT_TYPE,
    CONTENT_TYPE_LABELS,
    INDUSTRY,
    INDUSTRY_LABELS,
    TARGET_MARKET,
    TARGET_MARKET_LABELS,
} from "../constants";

export const proposalFormSchema = z.object({
    title: z.string().min(1, "제목을 입력해주세요"),
    description: z.string().min(1, "설명을 입력해주세요"),
    desired_budget: z.number().min(1, "희망 예산을 입력해주세요"),
    target_market: z.enum(["KR", "JP", "BOTH"] as const),
    content_type: z.enum([
        "instagram_post",
        "instagram_reel",
        "instagram_story",
        "youtube_short",
        "youtube_video",
        "tiktok_video",
        "blog_post"
    ] as const),
    expected_deliverables: z.array(z.string()).min(1, "예상 결과물을 입력해주세요"),
    available_period_start: z.string().min(1, "시작일을 입력해주세요"),
    available_period_end: z.string().min(1, "종료일을 입력해주세요"),
    categories: z.array(z.string()).min(1, "카테고리를 입력해주세요"),
    keywords: z.array(z.string()).min(1, "키워드를 입력해주세요"),
    portfolio_samples: z.array(z.string()).optional(),
    is_negotiable: z.boolean().default(true),
    preferred_industry: z.array(z.string()).optional(),
});

export type ProposalFormData = z.infer<typeof proposalFormSchema>;

interface ProposalFormProps {
    defaultValues?: Partial<ProposalFormData>;
    errors?: Partial<Record<keyof ProposalFormData | 'form', string>>;
}

export function ProposalForm({ defaultValues, errors }: ProposalFormProps) {
    const [keywords, setKeywords] = useState<string[]>(defaultValues?.keywords || []);
    const [categories, setCategories] = useState<string[]>(defaultValues?.categories || []);
    const [deliverables, setDeliverables] = useState<string[]>(defaultValues?.expected_deliverables || []);
    const [preferredIndustries, setPreferredIndustries] = useState<string[]>(defaultValues?.preferred_industry || []);
    const [newKeyword, setNewKeyword] = useState("");
    const [newCategory, setNewCategory] = useState("");
    const [newDeliverable, setNewDeliverable] = useState("");

    const handleAddKeyword = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && newKeyword) {
            e.preventDefault();
            setKeywords([...keywords, newKeyword]);
            setNewKeyword("");
        }
    };

    const handleAddCategory = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && newCategory) {
            e.preventDefault();
            setCategories([...categories, newCategory]);
            setNewCategory("");
        }
    };

    const handleAddDeliverable = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && newDeliverable) {
            e.preventDefault();
            setDeliverables([...deliverables, newDeliverable]);
            setNewDeliverable("");
        }
    };

    return (
        <Form method="post" className="space-y-6">
            {/* Hidden inputs for arrays */}
            {keywords.map((keyword, index) => (
                <input
                    key={index}
                    type="hidden"
                    name="keywords[]"
                    value={keyword}
                />
            ))}
            {categories.map((category, index) => (
                <input
                    key={index}
                    type="hidden"
                    name="categories[]"
                    value={category}
                />
            ))}
            {deliverables.map((deliverable, index) => (
                <input
                    key={index}
                    type="hidden"
                    name="expected_deliverables[]"
                    value={deliverable}
                />
            ))}
            {preferredIndustries.map((industry, index) => (
                <input
                    key={index}
                    type="hidden"
                    name="preferred_industry[]"
                    value={industry}
                />
            ))}

            <div className="space-y-4">
                <div>
                    <label htmlFor="title" className="text-sm font-medium">제목</label>
                    <Input
                        id="title"
                        name="title"
                        defaultValue={defaultValues?.title}
                        placeholder="제안 제목을 입력하세요"
                    />
                    {errors?.title && <p className="text-destructive text-sm mt-1">{errors.title}</p>}
                </div>

                <div>
                    <label htmlFor="description" className="text-sm font-medium">설명</label>
                    <Textarea
                        id="description"
                        name="description"
                        defaultValue={defaultValues?.description}
                        placeholder="제안 내용을 상세히 설명해주세요"
                    />
                    {errors?.description && <p className="text-destructive text-sm mt-1">{errors.description}</p>}
                </div>

                <div>
                    <label htmlFor="desired_budget" className="text-sm font-medium">희망 예산</label>
                    <Input
                        id="desired_budget"
                        name="desired_budget"
                        type="number"
                        defaultValue={defaultValues?.desired_budget}
                        placeholder="희망하는 예산을 입력하세요"
                    />
                    {errors?.desired_budget && <p className="text-destructive text-sm mt-1">{errors.desired_budget}</p>}
                </div>

                <div>
                    <label htmlFor="target_market" className="text-sm font-medium">대상 시장</label>
                    <Select name="target_market" defaultValue={defaultValues?.target_market}>
                        <SelectTrigger>
                            <SelectValue placeholder="대상 시장을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(TARGET_MARKET_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors?.target_market && <p className="text-destructive text-sm mt-1">{errors.target_market}</p>}
                </div>

                <div>
                    <label htmlFor="content_type" className="text-sm font-medium">컨텐츠 유형</label>
                    <Select name="content_type" defaultValue={defaultValues?.content_type}>
                        <SelectTrigger>
                            <SelectValue placeholder="컨텐츠 유형을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(CONTENT_TYPE_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors?.content_type && <p className="text-destructive text-sm mt-1">{errors.content_type}</p>}
                </div>

                <div>
                    <label className="text-sm font-medium">선호 산업군</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(INDUSTRY_LABELS).map(([value, label]) => (
                            <Badge
                                key={value}
                                variant={preferredIndustries.includes(value) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => {
                                    if (preferredIndustries.includes(value)) {
                                        setPreferredIndustries(preferredIndustries.filter(i => i !== value));
                                    } else {
                                        setPreferredIndustries([...preferredIndustries, value]);
                                    }
                                }}
                            >
                                {label}
                            </Badge>
                        ))}
                    </div>
                    {errors?.preferred_industry && (
                        <p className="text-destructive text-sm mt-1">{errors.preferred_industry}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="available_period_start" className="text-sm font-medium">시작일</label>
                        <Input
                            id="available_period_start"
                            name="available_period_start"
                            type="date"
                            defaultValue={defaultValues?.available_period_start}
                        />
                        {errors?.available_period_start && (
                            <p className="text-destructive text-sm mt-1">{errors.available_period_start}</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="available_period_end" className="text-sm font-medium">종료일</label>
                        <Input
                            id="available_period_end"
                            name="available_period_end"
                            type="date"
                            defaultValue={defaultValues?.available_period_end}
                        />
                        {errors?.available_period_end && (
                            <p className="text-destructive text-sm mt-1">{errors.available_period_end}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label htmlFor="keywords" className="text-sm font-medium">키워드</label>
                    <Input
                        id="keywords"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyDown={handleAddKeyword}
                        placeholder="키워드를 입력하고 Enter를 누르세요"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                        {keywords.map((keyword, index) => (
                            <Badge key={index} variant="secondary">
                                {keyword}
                                <button
                                    type="button"
                                    onClick={() => setKeywords(keywords.filter((_, i) => i !== index))}
                                    className="ml-1"
                                >
                                    <X className="size-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                    {errors?.keywords && <p className="text-destructive text-sm mt-1">{errors.keywords}</p>}
                </div>

                <div>
                    <label htmlFor="categories" className="text-sm font-medium">카테고리</label>
                    <Input
                        id="categories"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyDown={handleAddCategory}
                        placeholder="카테고리를 입력하고 Enter를 누르세요"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                        {categories.map((category, index) => (
                            <Badge key={index} variant="secondary">
                                {category}
                                <button
                                    type="button"
                                    onClick={() => setCategories(categories.filter((_, i) => i !== index))}
                                    className="ml-1"
                                >
                                    <X className="size-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                    {errors?.categories && <p className="text-destructive text-sm mt-1">{errors.categories}</p>}
                </div>

                <div>
                    <label htmlFor="expected_deliverables" className="text-sm font-medium">예상 결과물</label>
                    <Input
                        id="expected_deliverables"
                        value={newDeliverable}
                        onChange={(e) => setNewDeliverable(e.target.value)}
                        onKeyDown={handleAddDeliverable}
                        placeholder="예상 결과물을 입력하고 Enter를 누르세요"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                        {deliverables.map((deliverable, index) => (
                            <Badge key={index} variant="secondary">
                                {deliverable}
                                <button
                                    type="button"
                                    onClick={() => setDeliverables(deliverables.filter((_, i) => i !== index))}
                                    className="ml-1"
                                >
                                    <X className="size-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                    {errors?.expected_deliverables && (
                        <p className="text-destructive text-sm mt-1">{errors.expected_deliverables}</p>
                    )}
                </div>
            </div>

            <div className="flex justify-end">
                <Button type="submit">
                    {defaultValues ? "수정하기" : "등록하기"}
                </Button>
            </div>
        </Form>
    );
} 