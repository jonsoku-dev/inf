import type { Route } from "./+types/application-list-page";
import { getServerClient } from "~/server";
import { ProposalApplicationCard } from "../../components/proposal-application-card";
import { Link } from "react-router";

export const loader = async ({ request }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

    const { data: applications } = await supabase
        .from("proposal_applications")
        .select(`
            *,
            proposal:influencer_proposals!proposal_id (
                title,
                description,
                desired_budget,
                target_market,
                content_type,
                influencer:profiles!influencer_id (
                    name,
                    username
                )
            )
        `)
        .eq("advertiser_id", user.id)
        .order("created_at", { ascending: false });

    return {
        applications: applications || [],
    };
};

export default function ApplicationListPage({ loaderData }: Route.ComponentProps) {
    const { applications } = loaderData;

    return (
        <div className="container py-10 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">관심 제안 관리</h1>
                <p className="text-muted-foreground">신청한 인플루언서 제안을 관리하세요</p>
            </div>
            <div className="grid gap-4">
                {applications.map((application) => (
                    <Link key={application.application_id} to={`/my/proposal-applications/${application.application_id}`}>
                        <ProposalApplicationCard application={application} />
                    </Link>
                ))}
                {applications.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                        신청한 제안이 없습니다
                    </div>
                )}
            </div>
        </div>
    );
} 