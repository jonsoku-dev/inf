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
        // 프로필이 없으면 프로필 생성 페이지로 리다이렉트
        return redirect("/influencer/my");
    }

    return {};
};

export const action = async ({ request }: Route.ActionArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    const formData = await request.formData();

    if (!user) {
        return redirect("/login?redirect=/proposals/influencer/new");
    }

    // 인플루언서 프로필 다시 확인
    const { data: profile } = await supabase
        .from("influencer_profiles")
        .select("*")
        .eq("profile_id", user.id)
        .single();

    if (!profile) {
        return redirect("/my/influencer-profile/create?redirect=/proposals/influencer/new");
    }

    const data = {
        influencer_id: user.id,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        desired_budget: parseInt(formData.get("desired_budget") as string),
        target_market: formData.get("target_market") as string,
        content_type: formData.get("content_type") as string,
        expected_deliverables: formData.getAll("expected_deliverables") as string[],
        available_period_start: formData.get("available_period_start") as string,
        available_period_end: formData.get("available_period_end") as string,
        categories: formData.getAll("categories") as string[],
        is_negotiable: formData.get("is_negotiable") === "on",
        preferred_industry: formData.get("preferred_industry") as string,
        keywords: [], // 필수 필드 추가
        status: "DRAFT",
    };

    const { data: proposal, error } = await supabase
        .from("influencer_proposals")
        .insert(data)
        .select()
        .single();

    if (error) {
        console.error("제안 등록 오류:", error);
        throw new Error("제안 등록 중 오류가 발생했습니다: " + error.message);
    }

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