import { redirect } from "react-router";
import { getServerClient } from "~/server";
import { ProposalForm } from "../../components/proposal-form";
import type { Route } from "./+types/edit-page";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

    const { data: proposal } = await supabase
        .from("influencer_proposals")
        .select("*")
        .eq("proposal_id", params.proposalId)
        .eq("influencer_id", user.id)
        .single();

    if (!proposal) {
        throw new Error("제안을 찾을 수 없습니다");
    }

    return { proposal };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    const formData = await request.formData();

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

    const data = {
        title: formData.get("title"),
        description: formData.get("description"),
        desired_budget: parseInt(formData.get("desired_budget")),
        target_market: formData.get("target_market"),
        content_type: formData.get("content_type"),
        expected_deliverables: formData.getAll("expected_deliverables"),
        available_period_start: formData.get("available_period_start"),
        available_period_end: formData.get("available_period_end"),
        categories: formData.getAll("categories"),
        is_negotiable: formData.get("is_negotiable") === "on",
        preferred_industry: formData.get("preferred_industry"),
    };

    const { error } = await supabase
        .from("influencer_proposals")
        .update(data)
        .eq("proposal_id", params.proposalId)
        .eq("influencer_id", user.id);

    if (error) throw error;

    return redirect(`/proposals/influencer/${params.proposalId}`);
};

export default function EditPage({ loaderData }: Route.ComponentProps) {
    const { proposal } = loaderData;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold tracking-tight">제안 수정</h2>
                <p className="text-muted-foreground text-sm">제안 내용을 수정하세요</p>
            </div>

            <ProposalForm defaultValues={proposal} />
        </div>
    );
} 