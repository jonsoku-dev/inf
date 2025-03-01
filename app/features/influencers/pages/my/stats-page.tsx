import { getServerClient } from "~/server";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { SNS_TYPE_LABELS } from "../../constants";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
} from "recharts";
import type { Route } from "./+types/stats-page";
import type { Database } from "database-generated.types";
import { Button } from "~/common/components/ui/button";
import { Link } from "react-router";

type PlatformType = Database["public"]["Enums"]["sns_type"];
type StatsData = {
    date: string;
    followers: number;
    engagement: number | null;
    likes: number | null;
    comments: number | null;
    views: number | null;
};

export const loader = async ({ request }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

    // 최근 30일간의 통계 데이터 조회
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: stats } = await supabase
        .from("influencer_stats")
        .select("*")
        .eq("profile_id", user.id)
        .gte("recorded_at", thirtyDaysAgo.toISOString())
        .order("recorded_at", { ascending: true });

    // 플랫폼별로 데이터 그룹화
    const statsByPlatform = (stats || []).reduce((acc, stat) => {
        const platform = stat.platform as PlatformType;
        if (!acc[platform]) {
            acc[platform] = [];
        }
        acc[platform].push({
            date: new Date(stat.recorded_at).toLocaleDateString(),
            followers: stat.followers_count,
            engagement: stat.engagement_rate,
            likes: stat.avg_likes,
            comments: stat.avg_comments,
            views: stat.avg_views,
        });
        return acc;
    }, {} as Record<PlatformType, StatsData[]>);

    return { statsByPlatform };
};

export default function StatsPage({ loaderData }: Route.ComponentProps) {
    const { statsByPlatform } = loaderData;

    if (Object.keys(statsByPlatform).length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-muted-foreground">통계 데이터가 없습니다. SNS 계정을 인증하고 통계를 수집해보세요.</p>
                <Button className="mt-4" asChild>
                    <Link to="/influencer/my/verifications">계정 인증하기</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {Object.entries(statsByPlatform).map(([platform, data]) => (
                <Card key={platform}>
                    <CardHeader>
                        <CardTitle>
                            {SNS_TYPE_LABELS[platform as keyof typeof SNS_TYPE_LABELS] || platform} 통계
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="followers"
                                        name="팔로워"
                                        stroke="#8884d8"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="engagement"
                                        name="참여율"
                                        stroke="#82ca9d"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">평균 좋아요</p>
                                <p className="text-2xl font-semibold">
                                    {data[data.length - 1]?.likes?.toLocaleString() || "-"}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">평균 댓글</p>
                                <p className="text-2xl font-semibold">
                                    {data[data.length - 1]?.comments?.toLocaleString() || "-"}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">평균 조회수</p>
                                <p className="text-2xl font-semibold">
                                    {data[data.length - 1]?.views?.toLocaleString() || "-"}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">참여율</p>
                                <p className="text-2xl font-semibold">
                                    {data[data.length - 1]?.engagement?.toFixed(2) || "-"}%
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}