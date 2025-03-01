import { Form, redirect } from "react-router";
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
    const campaign_type = formData.get("campaign_type") as string;
    const target_market = formData.get("target_market") as string;
    const requirements = formData.get("requirements")?.toString().split("\n").filter(Boolean);
    const start_date = formData.get("start_date") as string;
    const end_date = formData.get("end_date") as string;
    const is_negotiable = formData.get("is_negotiable") === "on";
    const min_followers = formData.get("min_followers") ? Number(formData.get("min_followers")) : null;

    const { error } = await supabase
        .from("campaigns")
        .update({
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
        })
        .eq("campaign_id", params.campaignId)
        .eq("advertiser_id", user.id);

    if (error) {
        return {
            ok: false,
            error: "캠페인 수정에 실패했습니다."
        };
    }

    return redirect(`/campaigns/advertiser/${params.campaignId}`);
};

export const meta: Route.MetaFunction = () => {
    return [
        { title: "캠페인 수정 | Inf" },
        { name: "description", content: "캠페인 정보를 수정하세요" },
    ];
};

export default function EditPage({ loaderData }: Route.ComponentProps) {
    const { campaign } = loaderData;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">캠페인 수정</h1>
                <p className="text-muted-foreground text-sm">캠페인 정보를 수정하세요</p>
            </div>
            <Form method="post" className="max-w-2xl">
                <CampaignForm defaultValues={campaign} />
            </Form>
        </div>
    );
} 