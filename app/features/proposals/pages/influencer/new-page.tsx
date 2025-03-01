import { redirect } from "react-router";
import { getServerClient } from "~/server";
import { ProposalForm } from "../../components/proposal-form";
import type { Route } from "./+types/new-page";

export const loader = async ({ request }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

    // 인플루언서 프로필 확인
    const { data: profile } = await supabase
        .from("influencer_profiles")
        .select("*")
        .eq("profile_id", user.id)
        .single();

    if (!profile) {
        throw new Error("인플루언서 프로필이 필요합니다");
    }

    return {};
};

export const action = async ({ request }: Route.ActionArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    const formData = await request.formData();

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

    const data = {
        influencer_id: user.id,
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
        status: "DRAFT",
    };

    const { data: proposal, error } = await supabase
        .from("influencer_proposals")
        .insert(data)
        .select()
        .single();

    if (error) throw error;

    return redirect(`/proposals/influencer/${proposal.proposal_id}`);
};

export default function NewPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold tracking-tight">새 제안 등록</h2>
                <p className="text-muted-foreground text-sm">새로운 제안을 등록하세요</p>
            </div>

            <ProposalForm />
        </div>
    );
} 