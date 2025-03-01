import { Link } from "react-router";
import { Button } from "~/common/components/ui/button";
import { getServerClient } from "~/server";
import { ProposalDetail } from "../../components/proposal-detail";
import type { Route } from "./+types/detail-page";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    const { data: proposal } = await supabase
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
        .eq("proposal_id", params.proposalId)
        .eq("status", "PUBLISHED")
        .single();

    if (!proposal) {
        throw new Error("제안을 찾을 수 없습니다");
    }

    let isAdvertiser = false;
    let hasApplied = false;

    if (user) {
        // 현재 사용자가 광고주인지 확인
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("profile_id", user.id)
            .single();

        isAdvertiser = profile?.role === "ADVERTISER";

        // 이미 신청했는지 확인
        if (isAdvertiser) {
            const { data: application } = await supabase
                .from("proposal_applications")
                .select("application_id")
                .eq("proposal_id", params.proposalId)
                .eq("advertiser_id", user.id)
                .single();

            hasApplied = !!application;
        }
    }

    return {
        proposal,
        isAdvertiser,
        hasApplied,
    };
};

export default function DetailPage({ loaderData }: Route.ComponentProps) {
    const { proposal, isAdvertiser, hasApplied } = loaderData;

    return (
        <div className="container py-10 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">제안 상세</h1>
                    <p className="text-muted-foreground text-sm">인플루언서의 제안 상세 정보를 확인하세요</p>
                </div>
                <Button variant="outline" asChild>
                    <Link to="/proposals/public">목록으로</Link>
                </Button>
            </div>

            <ProposalDetail proposal={proposal} />

            {isAdvertiser && !hasApplied && (
                <div className="flex justify-end">
                    <Button asChild>
                        <Link to={`/proposals/public/${proposal.proposal_id}/apply`}>
                            신청하기
                        </Link>
                    </Button>
                </div>
            )}

            {hasApplied && (
                <div className="bg-muted p-4 rounded-lg text-center">
                    이미 신청한 제안입니다
                </div>
            )}

            {!isAdvertiser && (
                <div className="bg-muted p-4 rounded-lg text-center">
                    광고주만 제안에 신청할 수 있습니다
                </div>
            )}
        </div>
    );
} 