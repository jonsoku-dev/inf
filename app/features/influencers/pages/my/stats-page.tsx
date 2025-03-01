import { getServerClient } from "~/server";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { SNS_TYPE_LABELS } from "../../constants";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export const loader = async ({ request }) => {
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
        if (!acc[stat.platform]) {
            acc[stat.platform] = [];
        }
        acc[stat.platform].push({
            date: new Date(stat.recorded_at).toLocaleDateString(),
            followers: stat.followers_count,
            engagement: stat.engagement_rate,
            likes: stat.avg_likes,
            comments: stat.avg_comments,
            views: stat.avg_views,
        });
        return acc;
    }, {});

    return { statsByPlatform };
};

export default function StatsPage({ loaderData }) {
    const { statsByPlatform } = loaderData;

    return (
        <div className="space-y-6">
            {Object.entries(statsByPlatform).map(([platform, data]) => (
                <Card key={platform}>
                    <CardHeader>
                        <CardTitle>
                            {SNS_TYPE_LABELS[platform]} 통계
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
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