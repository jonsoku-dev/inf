import { Link } from "react-router";
import { Button } from "~/common/components/ui/button";
import { ProposalDetail } from "../../components/proposal-detail";
import { getServerClient } from "~/server";
import type { Route } from "./+types/proposal-detail-page";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

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
        .eq("proposal_status", "PUBLISHED")
        .single();

    if (!proposal) {
        throw new Error("제안을 찾을 수 없습니다");
    }

    // 이미 신청했는지 확인
    let hasApplied = false;
    if (user) {
        const { data: application } = await supabase
            .from("proposal_applications")
            .select("application_id")
            .eq("proposal_id", params.proposalId)
            .eq("advertiser_id", user.id)
            .single();

        hasApplied = !!application;
    }

    return {
        proposal,
        hasApplied,
        isAdvertiser: user?.role === "ADVERTISER",
    };
};

export const meta: Route.MetaFunction = () => {
    return [
        { title: "제안 상세 | Inf" },
        { name: "description", content: "인플루언서의 제안 상세 정보를 확인하세요" },
    ];
};

export default function PublicProposalDetailPage({ loaderData }: Route.ComponentProps) {
    const { proposal, hasApplied, isAdvertiser } = loaderData;

    return (
        <div className="container py-10 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">제안 상세</h1>
                    <p className="text-muted-foreground text-sm">인플루언서의 제안 상세 정보를 확인하세요</p>
                </div>
                <div className="flex items-center gap-2">
                    {isAdvertiser && !hasApplied && (
                        <Button asChild>
                            <Link to={`/proposals/${proposal.proposal_id}/apply`}>신청하기</Link>
                        </Button>
                    )}
                    <Button variant="outline" asChild>
                        <Link to="/proposals">목록으로</Link>
                    </Button>
                </div>
            </div>
            <ProposalDetail proposal={proposal} />
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
