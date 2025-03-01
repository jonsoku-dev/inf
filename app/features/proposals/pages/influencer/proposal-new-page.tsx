import type { Tables } from "database-generated.types";
import { data, redirect } from "react-router";
import { ZodError } from "zod";
import { getServerClient } from "~/server";
import type { ProposalFormData } from "../../components/proposal-form";
import { ProposalForm, proposalFormSchema } from "../../components/proposal-form";
import type { Route } from "./+types/proposal-new-page";

export const loader = async ({ request }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

    // 사용자 역할 확인
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("profile_id", user.id)
        .single();

    if (profile?.role !== "INFLUENCER") {
        throw new Error("인플루언서만 제안을 등록할 수 있습니다");
    }

    return {};
};

export const action = async ({ request }: Route.ActionArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

    try {
        const formData = await request.formData();
        const rawData = {
            title: formData.get("title"),
            description: formData.get("description"),
            desired_budget: formData.get("desired_budget") ? Number(formData.get("desired_budget")) : undefined,
            target_market: formData.get("target_market"),
            content_type: formData.get("content_type"),
            expected_deliverables: formData.getAll("expected_deliverables[]"),
            available_period_start: formData.get("available_period_start"),
            available_period_end: formData.get("available_period_end"),
            categories: formData.getAll("categories[]"),
            keywords: formData.getAll("keywords[]"),
            portfolio_samples: formData.getAll("portfolio_samples[]"),
            preferred_industry: formData.getAll("preferred_industry[]"),
            is_negotiable: true,
        };

        // Zod로 데이터 검증
        const validatedData = proposalFormSchema.parse(rawData);

        // 제안 등록
        const { data: proposal, error: supabaseError } = await supabase
            .from("influencer_proposals")
            .insert({
                ...validatedData,
                influencer_id: user.id,
                proposal_status: "draft",
            } as Tables<"influencer_proposals">)
            .select()
            .single();

        if (supabaseError) throw supabaseError;

        // 성공시 상세 페이지로 리다이렉트
        return redirect(`/my/proposals/${proposal.proposal_id}`);
    } catch (error) {
        if (error instanceof Error) {
            return data({ errors: { form: error.message } }, { status: 400 });
        }
        if (error instanceof ZodError) {
            const fieldErrors = error.errors.reduce((acc: Record<string, string>, curr) => {
                if (curr.path[0]) {
                    acc[curr.path[0].toString()] = curr.message;
                }
                return acc;
            }, {});
            return data({ errors: fieldErrors }, { status: 400 });
        }
        return data({ errors: { form: "알 수 없는 오류가 발생했습니다" } }, { status: 500 });
    }
};

export const meta: Route.MetaFunction = () => {
    return [
        { title: "새 제안 등록 | Inf" },
        { name: "description", content: "새로운 제안을 등록하세요" },
    ];
};

export default function ProposalNewPage({ loaderData, actionData }: Route.ComponentProps) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">새 제안 등록</h1>
                <p className="text-muted-foreground text-sm">새로운 제안을 등록하세요</p>
            </div>
            <ProposalForm errors={actionData?.errors as Partial<Record<keyof ProposalFormData, string>>} />
        </div>
    );
} 