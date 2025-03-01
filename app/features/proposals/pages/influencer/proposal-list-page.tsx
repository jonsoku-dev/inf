import type { Route } from "./+types/proposal-list-page";
import { getServerClient } from "~/server";
import { ProposalCard } from "../../components/proposal-card";
import { Button } from "~/common/components/ui/button";
import { Link } from "react-router";

export const loader = async ({ request }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

    const { data: proposals } = await supabase
        .from("influencer_proposals")
        .select(`
            *,
            influencer:profiles!influencer_id (
                name,
                username
            )
        `)
        .eq("influencer_id", user.id)
        .order("created_at", { ascending: false });

    return {
        proposals: proposals || [],
    };
};

export const meta: Route.MetaFunction = () => {
    return [
        { title: "내 제안 목록 | Inf" },
        { name: "description", content: "등록한 제안 목록을 확인하세요" },
    ];
};

export default function ProposalListPage({ loaderData }: Route.ComponentProps) {

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">내 제안 목록</h1>
                    <p className="text-muted-foreground text-sm">등록한 제안 목록을 확인하세요</p>
                </div>
                <Button asChild>
                    <Link to="/my/proposals/new">새 제안 등록</Link>
                </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {loaderData.proposals.map((proposal) => (
                    <Link key={proposal.proposal_id} to={`/my/proposals/${proposal.proposal_id}`}>
                        <ProposalCard proposal={proposal} />
                    </Link>
                ))}
            </div>
            {loaderData.proposals.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                    등록된 제안이 없습니다
                </div>
            )}
        </div>
    );
} 