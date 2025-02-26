import { Link, redirect } from "react-router";
import { Badge } from "~/common/components/ui/badge";
import { Button } from "~/common/components/ui/button";
import { Card, CardContent } from "~/common/components/ui/card";
import { getServerClient } from "~/server";
import { APPLICATION_STATUS, APPLICATION_STATUS_LABELS } from "../constants";
import type { Route } from "./+types/application-list-page";

export const loader = async ({ request }: Route.LoaderArgs) => {
    const supabase = getServerClient(request)
    // 로그인 체크
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        return redirect("/auth/login");
    }

    // 내 지원 목록 조회
    const { data: applications } = await supabase
        .from("applications")
        .select(`
            application_id,
            application_status,
            message,
            applied_at,
            campaign:campaigns (
                campaign_id,
                title,
                target_market,
                budget,
                period_start,
                period_end
            )
        `)
        .eq("influencer_id", session.user.id)
        .order("applied_at", { ascending: false });

    return {
        applications: applications || [],
    };
};

export const meta: Route.MetaFunction = () => {
    return [
        { title: "지원 현황 | Inf" },
        { name: "description", content: "캠페인 지원 현황을 확인하세요" },
    ];
};

export default function ApplicationListPage({ loaderData }: Route.ComponentProps) {
    const { applications } = loaderData;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">지원 현황</h1>
                <p className="text-muted-foreground text-sm">캠페인 지원 현황을 확인하세요</p>
            </div>

            {applications.length === 0 ? (
                <Card>
                    <CardContent className="py-8">
                        <div className="text-center text-muted-foreground">
                            <p>아직 지원한 캠페인이 없습니다</p>
                            <Button variant="outline" asChild className="mt-4">
                                <Link to="/campaigns">캠페인 둘러보기</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {applications.map((application) => (
                        <Card key={application.application_id}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <h3 className="font-medium">
                                            <Link
                                                to={`/campaigns/${application.campaign.campaign_id}`}
                                                className="hover:underline"
                                            >
                                                {application.campaign.title}
                                            </Link>
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Badge variant="outline">
                                                {application.campaign.target_market === "KR" ? "한국" :
                                                    application.campaign.target_market === "JP" ? "일본" : "한국/일본"}
                                            </Badge>
                                            <span>•</span>
                                            <span>{application.campaign.budget.toLocaleString()}원</span>
                                            <span>•</span>
                                            <span>
                                                {application.campaign.period_start} ~ {application.campaign.period_end}
                                            </span>
                                        </div>
                                    </div>
                                    <Badge variant={application.application_status === APPLICATION_STATUS.APPROVED ? "success" : "secondary"}>
                                        {APPLICATION_STATUS_LABELS[application.application_status as keyof typeof APPLICATION_STATUS_LABELS]}
                                    </Badge>
                                </div>
                                <div className="mt-4 space-y-2">
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">지원 메시지: </span>
                                        {application.message}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        지원일: {new Date(application.applied_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
} 