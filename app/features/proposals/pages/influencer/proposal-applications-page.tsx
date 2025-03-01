import type { Route } from "./+types/proposal-applications-page";
import { getServerClient } from "~/server";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

    const { data: applications } = await supabase
        .from("proposal_applications")
        .select(`
            *,
            advertiser:profiles!advertiser_id (
                name,
                username    
            )
        `)
        .eq("proposal_id", params.proposalId)
        .order("created_at", { ascending: false });

    return {
        applications: applications || [],
    };
};

export const meta: Route.MetaFunction = () => {
    return [
        { title: "제안 신청 현황 | Inf" },
        { name: "description", content: "제안에 대한 광고주들의 신청 현황을 확인하세요" },
    ];
};

export default function ProposalApplicationsPage({ loaderData }: Route.ComponentProps) {
    const { applications } = loaderData;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">제안 신청 현황</h1>
                <p className="text-muted-foreground text-sm">제안에 대한 광고주들의 신청 현황을 확인하세요</p>
            </div>
            {/* ProposalApplicationList 컴포넌트 */}
        </div>
    );
} 