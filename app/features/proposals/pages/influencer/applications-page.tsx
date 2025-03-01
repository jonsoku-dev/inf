import { Link } from "react-router";
import { getServerClient } from "~/server";
import { ProposalCard } from "../../components/proposal-card";
import type { Route } from "./+types/list-page";
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
            applications:proposal_applications (
                application_id
            )
        `)
        .eq("influencer_id", user.id)
        .order("created_at", { ascending: false });

    return {
        proposals: proposals || [],
    };
};

export default function ApplicationListPage({ loaderData }: Route.ComponentProps) {
    const { proposals } = loaderData;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {proposals.map((proposal) => (
                    <Link key={proposal.proposal_id} to={`/proposals/influencer/${proposal.proposal_id}`}>
                        <ProposalCard
                            proposal={proposal}
                            badge={`신청 ${proposal.applications.length}건`}
                        />
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