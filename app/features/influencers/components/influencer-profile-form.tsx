import { useState } from "react";
import { Form } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Checkbox } from "~/common/components/ui/checkbox";
import { Input } from "~/common/components/ui/input";
import { Textarea } from "~/common/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/common/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { GENDER, GENDER_LABELS, INFLUENCER_CATEGORY, INFLUENCER_CATEGORY_LABELS } from "../constants";
import type { Database } from "database-generated.types";
import { z } from "zod";

type InfluencerProfile = Database["public"]["Tables"]["influencer_profiles"]["Row"];

interface InfluencerProfileFormProps {
    defaultValues?: Partial<InfluencerProfile>;
    errors?: {
        form?: string;
        [key: string]: string | undefined;
    };
}

export const influencerProfileFormSchema = z.object({
    categories: z.array(z.enum(["fashion", "beauty", "food", "travel", "tech", "game", "entertainment", "lifestyle", "parenting", "pets", "other"] as [Database["public"]["Enums"]["influencer_category"], ...Database["public"]["Enums"]["influencer_category"][]])),
    instagram_handle: z.string().nullable(),
    youtube_handle: z.string().nullable(),
    tiktok_handle: z.string().nullable(),
    blog_url: z.string().nullable(),
    introduction: z.string().nullable(),
    is_public: z.boolean(),
    gender: z.enum(["male", "female", "other"] as [Database["public"]["Enums"]["gender"], ...Database["public"]["Enums"]["gender"][]]).nullable(),
    birth_year: z.number().nullable(),
    location: z.string().nullable(),
});

export type InfluencerProfileFormData = z.infer<typeof influencerProfileFormSchema>;

function CategorySection({ selectedCategories, setSelectedCategories }: {
    selectedCategories: string[];
    setSelectedCategories: (categories: string[]) => void;
}) {
    return (
        <div>
            <h3 className="text-sm font-medium mb-2">카테고리</h3>
            <Card>
                <CardContent className="grid grid-cols-2 gap-2 pt-6">
                    {Object.entries(INFLUENCER_CATEGORY).map(([key, value]) => (
                        <div key={value} className="flex items-center space-x-2">
                            <Checkbox
                                id={value}
                                checked={selectedCategories.includes(value)}
                                onCheckedChange={(checked) => {
                                    if (checked) {
                                        setSelectedCategories([...selectedCategories, value]);
                                    } else {
                                        setSelectedCategories(selectedCategories.filter((cat) => cat !== value));
                                    }
                                }}
                                name="categories[]"
                                value={value}
                            />
                            <label htmlFor={value} className="text-sm">
                                {INFLUENCER_CATEGORY_LABELS[value as keyof typeof INFLUENCER_CATEGORY]}
                            </label>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

function SocialMediaSection({ defaultValues }: { defaultValues?: Partial<InfluencerProfile> }) {
    return (
        <div>
            <h3 className="text-sm font-medium mb-2">SNS 계정</h3>
            <Card>
                <CardContent className="space-y-4 pt-6">
                    <div>
                        <label className="text-sm text-muted-foreground">인스타그램</label>
                        <Input
                            name="instagram_handle"
                            placeholder="@username"
                            defaultValue={defaultValues?.instagram_handle || ""}
                        />
                    </div>
                    <div>
                        <label className="text-sm text-muted-foreground">유튜브</label>
                        <Input
                            name="youtube_handle"
                            placeholder="채널 URL"
                            defaultValue={defaultValues?.youtube_handle || ""}
                        />
                    </div>
                    <div>
                        <label className="text-sm text-muted-foreground">틱톡</label>
                        <Input
                            name="tiktok_handle"
                            placeholder="@username"
                            defaultValue={defaultValues?.tiktok_handle || ""}
                        />
                    </div>
                    <div>
                        <label className="text-sm text-muted-foreground">블로그</label>
                        <Input
                            name="blog_url"
                            placeholder="블로그 URL"
                            defaultValue={defaultValues?.blog_url || ""}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function BasicInfoSection({ defaultValues }: { defaultValues?: Partial<InfluencerProfile> }) {
    return (
        <div>
            <h3 className="text-sm font-medium mb-2">기본 정보</h3>
            <Card>
                <CardContent className="space-y-4 pt-6">
                    <div>
                        <label className="text-sm text-muted-foreground">성별</label>
                        <Select name="gender" defaultValue={defaultValues?.gender || undefined}>
                            <SelectTrigger>
                                <SelectValue placeholder="성별 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(GENDER).map(([key, value]) => (
                                    <SelectItem key={value} value={value}>
                                        {GENDER_LABELS[value as keyof typeof GENDER]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm text-muted-foreground">출생연도</label>
                        <Input
                            type="number"
                            name="birth_year"
                            placeholder="YYYY"
                            defaultValue={defaultValues?.birth_year || ""}
                        />
                    </div>
                    <div>
                        <label className="text-sm text-muted-foreground">활동 지역</label>
                        <Input
                            name="location"
                            placeholder="예: 서울"
                            defaultValue={defaultValues?.location || ""}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export function InfluencerProfileForm({ defaultValues, errors }: InfluencerProfileFormProps) {
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        defaultValues?.categories || []
    );

    return (
        <Form method="post" className="space-y-6">
            {errors?.form && (
                <div className="text-red-500 text-sm">{errors.form}</div>
            )}

            <CategorySection
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
            />

            <SocialMediaSection defaultValues={defaultValues} />

            <BasicInfoSection defaultValues={defaultValues} />

            <div>
                <h3 className="text-sm font-medium mb-2">자기소개</h3>
                <Card>
                    <CardContent className="pt-6">
                        <Textarea
                            name="introduction"
                            placeholder="자기소개를 입력하세요"
                            defaultValue={defaultValues?.introduction || ""}
                            className="min-h-[150px]"
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="is_public"
                    name="is_public"
                    defaultChecked={defaultValues?.is_public ?? true}
                />
                <label htmlFor="is_public" className="text-sm">프로필 공개</label>
            </div>

            <div className="flex justify-end">
                <Button type="submit">
                    {defaultValues ? "수정하기" : "등록하기"}
                </Button>
            </div>
        </Form>
    );
} 