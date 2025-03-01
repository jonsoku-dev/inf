import type { Route } from "./+types/application-detail-page";
import { getServerClient } from "~/server";
import { ProposalDetail } from "../../components/proposal-detail";
import { ApplicationStatus } from "../../components/application-status";
import { Button } from "~/common/components/ui/button";
import { Link } from "react-router";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

    const { data: application } = await supabase
        .from("proposal_applications")
        .select(`
            *,
            proposal:influencer_proposals!proposal_id (
                *,
                influencer:profiles!influencer_id (
                    name,
                    username
                )
            )
        `)
        .eq("application_id", params.applicationId)
        .eq("advertiser_id", user.id)
        .single();

    if (!application) {
        throw new Error("신청 정보를 찾을 수 없습니다");
    }

    return {
        application,
    };
};

export default function ApplicationDetailPage({ loaderData }: Route.ComponentProps) {
    const { application } = loaderData;

    return (
        <div className="container py-10 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">제안 신청 상세</h1>
                    <p className="text-muted-foreground">제안 신청 상세 정보를 확인하세요</p>
                </div>
                <Button variant="outline" asChild>
                    <Link to="/my/proposal-applications">목록으로</Link>
                </Button>
            </div>
            <ApplicationStatus application={application} />
            <ProposalDetail proposal={application.proposal} />
        </div>
    );
} 