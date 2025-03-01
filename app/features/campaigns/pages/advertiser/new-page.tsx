import { Form, redirect } from "react-router";
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
    const campaign_type = formData.get("campaign_type") as string;
    const target_market = formData.get("target_market") as string;
    const requirements = formData.get("requirements")?.toString().split("\n").filter(Boolean);
    const start_date = formData.get("start_date") as string;
    const end_date = formData.get("end_date") as string;
    const is_negotiable = formData.get("is_negotiable") === "on";
    const min_followers = formData.get("min_followers") ? Number(formData.get("min_followers")) : null;

    const { data, error } = await supabase
        .from("campaigns")
        .insert({
            title,
            description,
            budget,
            campaign_type,
            target_market,
            requirements,
            period_start: start_date,
            period_end: end_date,
            is_negotiable,
            min_followers,
            advertiser_id: user.id,
            campaign_status: "DRAFT"
        })
        .select()
        .single();

    if (error) {
        return {
            ok: false,
            error: "캠페인 등록에 실패했습니다."
        };
    }

    return redirect(`/campaigns/advertiser/${data.campaign_id}`);
};

export const meta: Route.MetaFunction = () => {
    return [
        { title: "새 캠페인 | Inf" },
        { name: "description", content: "새로운 캠페인을 등록하세요" },
    ];
};

export default function NewPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">새 캠페인</h1>
                <p className="text-muted-foreground text-sm">새로운 캠페인을 등록하세요</p>
            </div>
            <Form method="post" className="max-w-2xl">
                <CampaignForm />
            </Form>
        </div>
    );
} 