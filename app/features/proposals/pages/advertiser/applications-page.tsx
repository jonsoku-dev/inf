import { Link } from "react-router";
import { getServerClient } from "~/server";
import { Card, CardContent } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import { PROPOSAL_APPLICATION_STATUS_LABELS } from "../../constants";
import type { Route } from "./+types/applications-page";

/**
 * @description 광고주가 제출한 모든 제안 신청을 보여주는 페이지
 */
export const loader = async ({ request }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

    const { data: applications } = await supabase
        .from("proposal_applications")
        .select(`
            application_id,
            proposal_application_status,
            applied_at,
            message,
            proposal:influencer_proposals (
                proposal_id,
                title,
                description,
                desired_budget,
                target_market,
                content_type,
                influencer:profiles (
                    profile_id,
                    name,
                    username,
                    influencer_profile:influencer_profiles (
                        instagram_handle,
                        youtube_handle,
                        tiktok_handle,
                        blog_url,
                        followers_count
                    )
                )
            )
        `)
        .eq("advertiser_id", user.id)
        .order("applied_at", { ascending: false });

    return {
        applications: applications || [],
    };
};

export default function ApplicationsPage({ loaderData }: Route.ComponentProps) {
    const { applications } = loaderData;

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-semibold">제안 신청 목록</h2>
                <p className="text-muted-foreground mt-1">인플루언서들의 제안 신청 현황을 확인하세요</p>
            </div>

            <div className="grid gap-4">
                {applications.map((application) => (
                    <Link
                        key={application.application_id}
                        to={`/proposals/advertiser/applications/${application.application_id}`}
                        className="block transition-colors hover:bg-muted/50"
                    >
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-start gap-6">
                                    <Avatar className="w-12 h-12">
                                        <AvatarFallback className="text-lg">
                                            {application.proposal.influencer.name.slice(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="font-semibold truncate">
                                                    {application.proposal.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {application.proposal.influencer.name}
                                                </p>
                                            </div>
                                            <Badge variant="secondary">
                                                {PROPOSAL_APPLICATION_STATUS_LABELS[application.proposal_application_status as keyof typeof PROPOSAL_APPLICATION_STATUS_LABELS]}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4">
                                            <div className="text-sm">
                                                <span className="text-muted-foreground">예상 비용: </span>
                                                {application.proposal.desired_budget.toLocaleString()}원
                                            </div>
                                            <div className="text-sm">
                                                <span className="text-muted-foreground">신청일: </span>
                                                {new Date(application.applied_at).toLocaleDateString()}
                                            </div>
                                            {application.proposal.influencer.influencer_profile?.followers_count && (
                                                <div className="text-sm col-span-2">
                                                    <span className="text-muted-foreground">팔로워: </span>
                                                    {Object.entries(application.proposal.influencer.influencer_profile.followers_count as Record<string, number>)
                                                        .map(([platform, count]) => `${platform} ${count.toLocaleString()}명`)
                                                        .join(', ')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}

                {applications.length === 0 && (
                    <div className="text-center py-12 bg-muted/50 rounded-lg">
                        <p className="text-muted-foreground">신청한 제안이 없습니다</p>
                    </div>
                )}
            </div>
        </div>
    );
}