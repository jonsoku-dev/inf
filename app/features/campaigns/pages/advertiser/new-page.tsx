import { useEffect, useState } from "react";
import { Form, redirect, useNavigate } from "react-router";
import { getServerClient } from "~/server";
import { CampaignForm } from "../../components/campaign-form";
import type { Route } from "./+types/new-page";

export const loader = async ({ request }: Route.LoaderArgs) => {
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

    return {};
};

export const action = async ({ request }: Route.ActionArgs) => {
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
    const start_date = formData.get("start_date") as string;
    const end_date = formData.get("end_date") as string;
    const is_negotiable = formData.get("is_negotiable") === "on";
    const is_urgent = formData.get("is_urgent") === "on";
    const min_followers = formData.get("min_followers") ? Number(formData.get("min_followers")) : null;
    const preferred_gender = formData.get("preferred_gender") as string || null;
    const location_requirements = formData.get("location_requirements") as string || null;
    const keywords = formData.get("keywords") ?
        (formData.get("keywords") as string).split(",").map(k => k.trim()).filter(Boolean) :
        [];

    // 빈 배열 대신 기본 카테고리 설정
    const categories = ["OTHER"];

    try {
        const { data, error } = await supabase
            .from("campaigns")
            .insert({
                title,
                description,
                budget,
                campaign_type,
                target_market,
                requirements,
                start_date,
                end_date,
                is_negotiable,
                is_urgent,
                min_followers,
                preferred_gender,
                location_requirements,
                advertiser_id: user.id,
                campaign_status: "DRAFT",
                keywords,
                categories
            })
            .select()
            .single();

        if (error) {
            console.error("캠페인 등록 오류:", error);
            return {
                ok: false,
                error: "캠페인 등록에 실패했습니다: " + error.message
            };
        }

        return redirect(`/campaigns/advertiser`);
    } catch (error) {
        console.error("캠페인 등록 예외:", error);
        return {
            ok: false,
            error: "캠페인 등록 중 오류가 발생했습니다."
        };
    }
};

export const meta: Route.MetaFunction = () => {
    return [
        { title: "새 캠페인 | Inf" },
        { name: "description", content: "새로운 캠페인을 등록하세요" },
    ];
};

export default function NewPage({ actionData }: Route.ComponentProps) {
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
        navigate("/campaigns/advertiser");
    };

    return (
        <div className="container mx-auto max-w-4xl px-4 py-6 md:py-8">
            <div className="mb-6 space-y-2">
                <h1 className="text-xl font-semibold tracking-tight md:text-2xl">새 캠페인</h1>
                <p className="text-sm text-muted-foreground md:text-base">새로운 캠페인을 등록하세요</p>
            </div>

            {actionData?.error && (
                <div className="mb-6 rounded-md bg-red-50 p-3 text-sm text-red-600">
                    {actionData.error}
                </div>
            )}

            <div className="rounded-lg border bg-card p-4 shadow-sm md:p-6">
                <Form method="post" onSubmit={handleSubmit} className="space-y-4">
                    <CampaignForm isSubmitting={isSubmitting} />
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