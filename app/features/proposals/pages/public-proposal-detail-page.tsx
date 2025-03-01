import type { Route } from "./+types/public-proposal-detail-page";
import { getServerClient } from "~/server";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);

    const { data: proposal } = await supabase
        .from("influencer_proposals")
        .select(`
            *,
            influencer:profiles!influencer_id (
                name,
                username
            )
        `)
        .eq("proposal_id", params.proposalId)
        .single();

    if (!proposal) {
        throw new Error("제안을 찾을 수 없습니다");
    }

    return {
        proposal,
    };
};

export const meta: Route.MetaFunction = () => {
    return [
        { title: "제안 상세 | Inf" },
        { name: "description", content: "인플루언서의 제안 상세 정보를 확인하세요" },
    ];
};

export default function PublicProposalDetailPage({ loaderData }: Route.ComponentProps) {
    const { proposal } = loaderData;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">제안 상세</h1>
                <p className="text-muted-foreground text-sm">인플루언서의 제안 상세 정보를 확인하세요</p>
            </div>
            {/* PublicProposalDetail 컴포넌트 */}
        </div>
    );
} 