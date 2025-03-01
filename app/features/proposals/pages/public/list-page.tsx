import { Link } from "react-router";
import { getServerClient } from "~/server";
import { ProposalCard } from "../../components/proposal-card";
import { INFLUENCER_CATEGORY_LABELS } from "~/features/influencers/constants";
import { Badge } from "~/common/components/ui/badge";
import type { Route } from "./+types/list-page";
import { PROPOSAL_STATUS } from "~/features/proposals/constants";

export const loader = async ({ request }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const url = new URL(request.url);
    const category = url.searchParams.get("category");

    let query = supabase
        .from("influencer_proposals")
        .select(`
            *,
            influencer:profiles!influencer_id (
                name,
                username,
                avatar_url
            ),
            stats:influencer_stats (
                platform,
                followers_count,
                engagement_rate
            )
        `)
        .eq("status", PROPOSAL_STATUS.PUBLISHED);

    if (category) {
        query = query.contains("categories", [category]);
    }

    const { data: proposals } = await query.order("created_at", { ascending: false });

    return {
        proposals: proposals || [],
        category,
    };
};

export default function ListPage({ loaderData }: Route.ComponentProps) {
    const { proposals, category } = loaderData;

    return (
        <div className="container py-10 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">인플루언서 제안</h1>
                <p className="text-muted-foreground text-sm">인플루언서들의 제안을 확인하세요</p>
            </div>

            <div className="flex flex-wrap gap-2">
                {Object.entries(INFLUENCER_CATEGORY_LABELS).map(([value, label]) => (
                    <Badge
                        key={value}
                        variant={category === value ? "default" : "outline"}
                        className="cursor-pointer"
                    >
                        <Link to={category === value ? "/proposals/public" : `/proposals/public?category=${value}`}>
                            {label}
                        </Link>
                    </Badge>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {proposals.map((proposal) => (
                    <Link key={proposal.proposal_id} to={`/proposals/public/${proposal.proposal_id}`}>
                        <ProposalCard proposal={proposal} />
                    </Link>
                ))}
            </div>
        </div>
    );
} 