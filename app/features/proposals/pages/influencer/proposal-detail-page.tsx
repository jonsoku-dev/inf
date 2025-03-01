import { Link } from "react-router";
import { Button } from "~/common/components/ui/button";
import { ProposalDetail } from "~/features/proposals/components/proposal-detail";
import { getServerClient } from "~/server";
import type { Route } from "./+types/proposal-detail-page";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

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
        { name: "description", content: "제안 상세 정보를 확인하세요" },
    ];
};

export default function ProposalDetailPage({ loaderData }: Route.ComponentProps) {
    const { proposal } = loaderData;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">제안 상세</h1>
                    <p className="text-muted-foreground text-sm">제안 상세 정보를 확인하세요</p>
                </div>
                <Button variant="outline" asChild>
                    <Link to="/my/proposals">목록으로</Link>
                </Button>
            </div>
            <ProposalDetail proposal={proposal} />
        </div>
    );
} 