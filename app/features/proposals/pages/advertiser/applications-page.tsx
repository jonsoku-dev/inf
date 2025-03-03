import { Link } from "react-router";
import { getServerClient } from "~/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import { Button } from "~/common/components/ui/button";
import { CalendarIcon, ExternalLinkIcon, ListIcon } from "lucide-react";
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING":
                return "bg-yellow-500";
            case "ACCEPTED":
                return "bg-green-500";
            case "REJECTED":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold">내 신청 목록</h1>
                <p className="text-muted-foreground mt-1">인플루언서 제안에 신청한 내역을 확인하세요</p>
            </div>

            {applications.length === 0 ? (
                <div className="text-center py-12 bg-muted rounded-lg">
                    <h3 className="text-lg font-medium mb-2">아직 신청한 제안이 없습니다</h3>
                    <p className="text-muted-foreground mb-4">인플루언서 제안 목록에서 관심있는 제안을 찾아보세요</p>
                    <Button asChild>
                        <Link to="/proposals/advertiser/list">
                            <ListIcon className="mr-2 h-4 w-4" />
                            인플루언서 제안 목록 보기
                        </Link>
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {applications.map((application) => (
                        <Card key={application.application_id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-center justify-between mb-2">
                                    <Badge className={getStatusColor(application.proposal_application_status)}>
                                        {PROPOSAL_APPLICATION_STATUS_LABELS[application.proposal_application_status as keyof typeof PROPOSAL_APPLICATION_STATUS_LABELS]}
                                    </Badge>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <CalendarIcon className="h-4 w-4 mr-1" />
                                        {formatDate(application.applied_at || "")}
                                    </div>
                                </div>
                                <CardTitle className="line-clamp-1">{application.proposal.title}</CardTitle>
                                <CardDescription className="line-clamp-2">
                                    {application.proposal.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-medium">인플루언서</p>
                                        <div className="flex items-center mt-1">
                                            <Avatar className="h-8 w-8 mr-2">
                                                <AvatarFallback>
                                                    {application.proposal.influencer?.name?.charAt(0) || "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <p>{application.proposal.influencer?.name || "알 수 없음"}</p>
                                        </div>
                                    </div>
                                    {application.message && (
                                        <div>
                                            <p className="text-sm font-medium">내 메시지</p>
                                            <p className="text-sm mt-1 bg-muted p-2 rounded-md">{application.message}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button asChild variant="outline" className="w-full">
                                    <Link to={`/proposals/advertiser/applications/${application.application_id}`}>
                                        자세히 보기
                                        <ExternalLinkIcon className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}