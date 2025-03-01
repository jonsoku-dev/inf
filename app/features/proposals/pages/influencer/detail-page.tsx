import { Link } from "react-router";
import { Button } from "~/common/components/ui/button";
import { getServerClient } from "~/server";
import { ProposalDetail } from "../../components/proposal-detail";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { PROPOSAL_APPLICATION_STATUS_LABELS } from "../../constants";
import type { Route } from "./+types/detail-page";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

    const { data: proposal } = await supabase
        .from("influencer_proposals")
        .select(`
            *,
            applications:proposal_applications (
                *,
                advertiser:profiles!advertiser_id (
                    name,
                    username,
                    avatar_url
                )
            )
        `)
        .eq("proposal_id", params.proposalId)
        .eq("influencer_id", user.id)
        .single();

    if (!proposal) {
        throw new Error("제안을 찾을 수 없습니다");
    }

    return { proposal };
};

export default function DetailPage({ loaderData }: Route.ComponentProps) {
    const { proposal } = loaderData;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">제안 상세</h2>
                    <p className="text-muted-foreground text-sm">제안 상세 정보를 확인하세요</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link to="/proposals/influencer">목록으로</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link to={`/proposals/influencer/${proposal.proposal_id}/edit`}>수정</Link>
                    </Button>
                </div>
            </div>

            <ProposalDetail proposal={proposal} />

            <Card>
                <CardHeader>
                    <CardTitle>신청 현황</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {proposal.applications.map((application) => (
                            <Card key={application.application_id}>
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium">{application.advertiser.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                신청일: {new Date(application.applied_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Badge>
                                            {PROPOSAL_APPLICATION_STATUS_LABELS[application.status]}
                                        </Badge>
                                    </div>
                                    <div className="mt-4">
                                        <p className="text-sm whitespace-pre-wrap">{application.message}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {proposal.applications.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                                아직 신청이 없습니다
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 