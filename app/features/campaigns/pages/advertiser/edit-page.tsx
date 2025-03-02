import { useEffect, useState } from "react";
import { Form, redirect, useNavigate } from "react-router";
import { DateTime } from "luxon";
import { getServerClient } from "~/server";
import { CampaignForm } from "../../components/campaign-form";
import type { Route } from "./+types/edit-page";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/auth/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("profile_id", user.id)
        .single();

    if (profile?.role !== "ADVERTISER") {
        return redirect("/campaigns");
    }

    const { data: campaign } = await supabase
        .from("campaigns")
        .select("*")
        .eq("campaign_id", params.campaignId)
        .single();

    if (!campaign || campaign.advertiser_id !== user.id) {
        return redirect("/campaigns");
    }

    return {
        campaign,
    };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/auth/login");
    }

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const budget = Number(formData.get("budget"));
    const campaign_type = formData.get("campaign_type") as "INSTAGRAM" | "YOUTUBE" | "TIKTOK" | "BLOG";
    const target_market = formData.get("target_market") as string;
    const requirements = formData.get("requirements")?.toString().split("\n").filter(Boolean);

    // 날짜 형식 표준화
    const start_date = formData.get("start_date") as string;
    const end_date = formData.get("end_date") as string;

    // ISO 형식으로 변환 (시간대 정보 포함)
    const formattedStartDate = start_date ? DateTime.fromISO(start_date).toISO() : undefined;
    const formattedEndDate = end_date ? DateTime.fromISO(end_date).toISO() : undefined;

    const is_negotiable = formData.get("is_negotiable") === "on";
    const is_urgent = formData.get("is_urgent") === "on";
    const min_followers = formData.get("min_followers") ? Number(formData.get("min_followers")) : null;
    const preferred_gender = formData.get("preferred_gender") as string || null;
    const location_requirements = formData.get("location_requirements") as string || null;
    const keywords = formData.get("keywords") ?
        (formData.get("keywords") as string).split(",").map(k => k.trim()).filter(Boolean) :
        [];

    try {
        // 타입 캐스팅을 통해 해결
        const campaignData = {
            title,
            description,
            budget,
            campaign_type,
            target_market,
            requirements,
            start_date: formattedStartDate,
            end_date: formattedEndDate,
            is_negotiable,
            is_urgent,
            min_followers,
            preferred_gender,
            location_requirements,
            keywords,
        };

        const { error } = await supabase
            .from("campaigns")
            .update(campaignData as any)
            .eq("campaign_id", params.campaignId);

        if (error) {
            console.error("캠페인 수정 오류:", error);
            return {
                ok: false,
                error: "캠페인 수정에 실패했습니다: " + error.message
            };
        }

        return redirect(`/campaigns/advertiser/${params.campaignId}`);
    } catch (error) {
        console.error("캠페인 수정 예외:", error);
        return {
            ok: false,
            error: "캠페인 수정 중 오류가 발생했습니다."
        };
    }
};

export const meta: Route.MetaFunction = () => {
    return [
        { title: "캠페인 수정 | Inf" },
        { name: "description", content: "캠페인 정보를 수정하세요" },
    ];
};

export default function EditPage({ loaderData, actionData }: Route.ComponentProps) {
    const { campaign } = loaderData;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    // actionData에 에러가 있으면 제출 상태를 false로 변경
    useEffect(() => {
        if (actionData?.error) {
            setIsSubmitting(false);
        }
    }, [actionData]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        setIsSubmitting(true);
        // 폼 제출은 기본 동작으로 처리됨
    };

    const handleCancel = () => {
        navigate(`/campaigns/advertiser/${campaign.campaign_id}`);
    };

    // 타입 안전하게 데이터 포맷팅
    const formattedCampaign = {
        ...campaign,
        // categories가 배열이 아니면 기본값 설정
        categories: Array.isArray(campaign.categories)
            ? campaign.categories.map(c => String(c))
            : ["OTHER"],
        // 날짜 처리 - Luxon을 사용하여 ISO 날짜 문자열을 YYYY-MM-DD 형식으로 변환
        start_date: campaign.start_date
            ? DateTime.fromISO(campaign.start_date).toISODate()
            : "",
        end_date: campaign.end_date
            ? DateTime.fromISO(campaign.end_date).toISODate()
            : "",
        // keywords가 배열이 아니면 기본값 설정
        keywords: Array.isArray(campaign.keywords)
            ? campaign.keywords.map(k => String(k))
            : []
    };

    return (
        <div className="container mx-auto max-w-4xl px-4 py-6 md:py-8">
            <div className="mb-6 space-y-2">
                <h1 className="text-xl font-semibold tracking-tight md:text-2xl">캠페인 수정</h1>
                <p className="text-sm text-muted-foreground md:text-base">캠페인 정보를 수정하세요</p>
            </div>

            {actionData?.error && (
                <div className="mb-6 rounded-md bg-red-50 p-3 text-sm text-red-600">
                    {actionData.error}
                </div>
            )}

            <div className="rounded-lg border bg-card p-4 shadow-sm md:p-6">
                <Form method="post" onSubmit={handleSubmit} className="space-y-4">
                    <CampaignForm
                        defaultValues={formattedCampaign as any}
                        isSubmitting={isSubmitting}
                    />
                </Form>
            </div>

            <div className="mt-4 flex justify-end">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="text-sm text-muted-foreground hover:underline"
                >
                    취소하고 돌아가기
                </button>
            </div>
        </div>
    );
} 