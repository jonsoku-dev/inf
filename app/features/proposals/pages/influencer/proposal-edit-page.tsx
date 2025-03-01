import type { Route } from "./+types/proposal-edit-page";
import { getServerClient } from "~/server";
import { ProposalForm } from "../../components/proposal-form";
import type { ProposalFormData } from "../../components/proposal-form";

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
        .single();

    if (!proposal) {
        throw new Error("제안을 찾을 수 없습니다");
    }

    // 본인 제안만 수정 가능
    if (proposal.influencer_id !== user.id) {
        throw new Error("수정 권한이 없습니다");
    }

    return {
        proposal,
    };
};

export const meta: Route.MetaFunction = () => {
    return [
        { title: "제안 수정 | Inf" },
        { name: "description", content: "제안 내용을 수정하세요" },
    ];
};

export default function ProposalEditPage({ loaderData }: Route.ComponentProps) {
    const { proposal } = loaderData;

    // 데이터베이스 값을 폼 데이터 형식으로 변환
    const formDefaultValues: Partial<ProposalFormData> = {
        title: proposal.title,
        description: proposal.description,
        desired_budget: proposal.desired_budget,
        target_market: proposal.target_market,
        content_type: proposal.content_type,
        expected_deliverables: proposal.expected_deliverables,
        available_period_start: proposal.available_period_start,
        available_period_end: proposal.available_period_end,
        categories: proposal.categories,
        keywords: proposal.keywords,
        portfolio_samples: proposal.portfolio_samples || undefined,
        is_negotiable: proposal.is_negotiable || true,
        preferred_industry: proposal.preferred_industry || undefined,
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">제안 수정</h1>
                <p className="text-muted-foreground text-sm">제안 내용을 수정하세요</p>
            </div>
            <ProposalForm defaultValues={formDefaultValues} />
        </div>
    );
} 