import { Link } from "react-router";
import { getServerClient } from "~/server";
import { ProposalCard } from "../../components/proposal-card";
import type { Route } from "./+types/proposal-list-page";

export const loader = async ({ request }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);

    const { data: proposals } = await supabase
        .from("influencer_proposals")
        .select(`
            *,
            influencer:profiles!influencer_id (
                name,
                username
            )
        `)
        .eq("proposal_status", "PUBLISHED") // 공개된 제안만 표시
        .order("created_at", { ascending: false });

    return {
        proposals: proposals || [],
    };
};

export const meta: Route.MetaFunction = () => {
    return [
        { title: "인플루언서 제안 | Inf" },
        { name: "description", content: "인플루언서들의 제안을 확인하세요" },
    ];
};

export default function PublicProposalListPage({ loaderData }: Route.ComponentProps) {
    const { proposals } = loaderData;

    return (
        <div className="container py-10 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">인플루언서 제안</h1>
                <p className="text-muted-foreground text-sm">인플루언서들의 제안을 확인하세요</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {proposals.map((proposal) => (
                    <Link key={proposal.proposal_id} to={`/proposals/${proposal.proposal_id}`}>
                        <ProposalCard proposal={proposal} />
                    </Link>
                ))}
            </div>
            {proposals.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                    등록된 제안이 없습니다
                </div>
            )}
        </div>
    );
}
