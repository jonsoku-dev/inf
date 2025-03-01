import type { Route } from "./+types/public-proposal-list-page";
import { getServerClient } from "~/server";

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
        .eq("status", "PUBLISHED")
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
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">인플루언서 제안</h1>
                <p className="text-muted-foreground text-sm">인플루언서들의 제안을 확인하세요</p>
            </div>
            {/* PublicProposalList 컴포넌트 */}
        </div>
    );
} 