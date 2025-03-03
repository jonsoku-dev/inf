import { useState } from "react";
import { Link } from "react-router";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import { Badge } from "~/common/components/ui/badge";
import { Button } from "~/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/common/components/ui/tabs";
import { GENDER_LABELS, INFLUENCER_CATEGORY_LABELS, SNS_TYPE, SNS_TYPE_LABELS } from "~/features/influencers/constants";
import { getServerClient } from "~/server";
import { formatDate } from "~/lib/utils";
import type { Database } from "database-generated.types";
import type { Route } from "./+types/detail-page";

type InfluencerStat = Database["public"]["Tables"]["influencer_stats"]["Row"];

export async function loader({ request, params }: Route.LoaderArgs) {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

    // 사용자 프로필 정보 가져오기
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("profile_id", user.id)
        .single();

    // 관리자 권한 확인
    if (profile?.role !== "ADMIN") {
        throw new Error("관리자 권한이 필요합니다");
    }

    const influencerId = params.id;

    if (!influencerId) {
        throw new Error("인플루언서 ID가 필요합니다");
    }

    // 인플루언서 정보 조회
    const { data: influencer, error } = await supabase
        .from("influencer_profiles")
        .select(`
            *,
            profile:profiles (
                profile_id,
                name,
                username,
                created_at
            )
        `)
        .eq("profile_id", influencerId)
        .single();

    if (error || !influencer) {
        throw new Error("인플루언서 정보를 찾을 수 없습니다");
    }

    // 인플루언서 인증 정보 조회
    const { data: verifications } = await supabase
        .from("influencer_verifications")
        .select("*")
        .eq("profile_id", influencerId)
        .order("verified_at", { ascending: false });

    // 인플루언서 통계 정보 조회
    const { data: stats } = await supabase
        .from("influencer_stats")
        .select("*")
        .eq("profile_id", influencerId)
        .order("recorded_at", { ascending: false });

    return {
        influencer: influencer,
        verifications: verifications || [],
        stats: stats || []
    };
}

export async function action({ request, params }: Route.ActionArgs) {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

    // 사용자 프로필 정보 가져오기
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("profile_id", user.id)
        .single();

    // 관리자 권한 확인
    if (profile?.role !== "ADMIN") {
        throw new Error("관리자 권한이 필요합니다");
    }

    const formData = await request.formData();
    const action = formData.get("action") as string;
    const influencerId = params.id;

    if (!influencerId) {
        return { error: "인플루언서 ID가 필요합니다" };
    }

    try {
        if (action === "add_verification") {
            const platform = formData.get("platform") as Database["public"]["Enums"]["sns_type"];
            const followersCount = parseInt(formData.get("followers_count") as string, 10);
            const engagementRate = parseFloat(formData.get("engagement_rate") as string);

            if (!platform || isNaN(followersCount)) {
                return { error: "유효하지 않은 입력입니다" };
            }

            // 90일 후 날짜 계산
            const nextVerificationDue = new Date();
            nextVerificationDue.setDate(nextVerificationDue.getDate() + 90);

            await supabase
                .from("influencer_verifications")
                .insert({
                    profile_id: influencerId,
                    platform,
                    followers_count: followersCount,
                    engagement_rate: isNaN(engagementRate) ? null : engagementRate,
                    is_valid: true,
                    next_verification_due: nextVerificationDue.toISOString()
                });

            // 인플루언서 팔로워 수 업데이트
            const { data: influencer } = await supabase
                .from("influencer_profiles")
                .select("followers_count")
                .eq("profile_id", influencerId)
                .single();

            if (influencer) {
                const followersCountData = influencer.followers_count as Record<string, number>;
                const updatedFollowersCount = {
                    ...followersCountData,
                    [platform]: followersCount
                };

                await supabase
                    .from("influencer_profiles")
                    .update({
                        followers_count: updatedFollowersCount
                    })
                    .eq("profile_id", influencerId);
            }

            return { success: "인증이 추가되었습니다" };
        }

        return { error: "지원하지 않는 작업입니다" };
    } catch (error) {
        return { error: "작업 중 오류가 발생했습니다" };
    }
}

export const meta: Route.MetaFunction = ({ data }) => {
    return [
        { title: "인플루언서 정보 - 관리자 페이지" },
        { name: "description", content: "인플루언서 정보를 관리합니다" },
    ];
}

export default function DetailPage({ loaderData, actionData }: Route.ComponentProps) {
    const { influencer, verifications, stats } = loaderData;
    const [activeTab, setActiveTab] = useState("profile");

    const getLatestVerification = (platform: string) => {
        return verifications?.find((v) => v.platform === platform && v.is_valid);
    };

    const getLatestStats = (platform: string) => {
        return stats?.filter((s) => s.platform === platform).slice(0, 10).reverse();
    };

    const getTotalFollowers = () => {
        if (!stats) return 0;

        const latestStats: Record<string, InfluencerStat> = {};

        stats.forEach((stat) => {
            if (!latestStats[stat.platform] || new Date(stat.recorded_at) > new Date(latestStats[stat.platform].recorded_at)) {
                latestStats[stat.platform] = stat;
            }
        });

        return Object.values(latestStats).reduce((sum, stat) => sum + stat.followers_count, 0);
    };

    const getAverageEngagementRate = () => {
        if (!stats) return 0;

        const latestStats: Record<string, InfluencerStat> = {};

        stats.forEach((stat) => {
            if (!latestStats[stat.platform] || new Date(stat.recorded_at) > new Date(latestStats[stat.platform].recorded_at)) {
                latestStats[stat.platform] = stat;
            }
        });

        const validStats = Object.values(latestStats).filter(stat => stat.engagement_rate !== null);

        if (validStats.length === 0) return 0;

        return validStats.reduce((sum, stat) => sum + (stat.engagement_rate || 0), 0) / validStats.length;
    };

    const formatStatsForChart = (platformStats: InfluencerStat[] | undefined) => {
        if (!platformStats) return [];

        return platformStats.map(stat => ({
            date: formatDate(stat.recorded_at, 'MM/DD'),
            followers: stat.followers_count,
            engagement: stat.engagement_rate || 0
        }));
    };

    if (!influencer || !verifications || !stats) {
        return <div className="container py-8">데이터를 불러오는 중...</div>;
    }

    return (
        <div className="container py-8">
            {actionData?.success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {actionData.success}
                </div>
            )}

            {actionData?.error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {actionData.error}
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">인플루언서 상세 정보</h1>
                <div className="flex gap-2">
                    <Link to={`/admin/influencers/${influencer.profile_id}/verification`}>
                        <Button variant="outline">인증 관리</Button>
                    </Link>
                    <Link to="/admin/influencers">
                        <Button variant="outline">목록으로 돌아가기</Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-1">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center">
                            <Avatar className="h-24 w-24 mb-4">
                                <AvatarImage src={influencer.profile.username || ""} alt={influencer.profile.name} />
                                <AvatarFallback>{influencer.profile.name.charAt(0)}</AvatarFallback>
                            </Avatar>

                            <h2 className="text-xl font-bold">{influencer.profile.name}</h2>
                            <p className="text-gray-500">@{influencer.profile.username}</p>

                            <div className="mt-4 flex flex-wrap gap-2 justify-center">
                                {influencer.categories.map((category: string) => (
                                    <Badge key={category} variant="outline">
                                        {INFLUENCER_CATEGORY_LABELS[category as keyof typeof INFLUENCER_CATEGORY_LABELS] || category}
                                    </Badge>
                                ))}
                            </div>

                            <div className="mt-6 w-full">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">기본 정보</h3>
                                        <div className="space-y-2">
                                            {influencer.gender && (
                                                <div className="flex items-center">
                                                    <span className="font-medium">성별:</span>
                                                    <span className="ml-2">{GENDER_LABELS[influencer.gender as keyof typeof GENDER_LABELS]}</span>
                                                </div>
                                            )}

                                            {influencer.birth_year && (
                                                <div className="flex items-center">
                                                    <span className="font-medium">출생년도:</span>
                                                    <span className="ml-2">{influencer.birth_year}년</span>
                                                </div>
                                            )}

                                            {influencer.location && (
                                                <div className="flex items-center">
                                                    <span className="font-medium">위치:</span>
                                                    <span className="ml-2">{influencer.location}</span>
                                                </div>
                                            )}

                                            <div className="flex items-center">
                                                <span className="font-medium">가입일:</span>
                                                <span className="ml-2">{formatDate(influencer.profile.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">소셜 미디어</h3>
                                        <div className="space-y-2">
                                            {influencer.instagram_handle && (
                                                <div className="flex items-center">
                                                    <span className="font-medium">Instagram:</span>
                                                    <a href={`https://instagram.com/${influencer.instagram_handle}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:underline">
                                                        @{influencer.instagram_handle}
                                                    </a>
                                                </div>
                                            )}

                                            {influencer.youtube_handle && (
                                                <div className="flex items-center">
                                                    <span className="font-medium">YouTube:</span>
                                                    <a href={`https://youtube.com/${influencer.youtube_handle}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:underline">
                                                        {influencer.youtube_handle}
                                                    </a>
                                                </div>
                                            )}

                                            {influencer.tiktok_handle && (
                                                <div className="flex items-center">
                                                    <span className="font-medium">TikTok:</span>
                                                    <a href={`https://tiktok.com/@${influencer.tiktok_handle}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:underline">
                                                        @{influencer.tiktok_handle}
                                                    </a>
                                                </div>
                                            )}

                                            {influencer.blog_url && (
                                                <div className="flex items-center">
                                                    <span className="font-medium">블로그:</span>
                                                    <a href={influencer.blog_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:underline truncate max-w-[150px]">
                                                        {influencer.blog_url}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="lg:col-span-3">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid grid-cols-3 mb-6">
                            <TabsTrigger value="profile">프로필</TabsTrigger>
                            <TabsTrigger value="stats">통계</TabsTrigger>
                            <TabsTrigger value="verifications">인증</TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile">
                            <Card>
                                <CardHeader>
                                    <CardTitle>인플루언서 프로필</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium mb-2">소개</h3>
                                            <p className="text-gray-700">{influencer.introduction || "소개 정보가 없습니다."}</p>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-medium mb-2">카테고리</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {influencer.categories.map((category: string) => (
                                                    <Badge key={category}>
                                                        {INFLUENCER_CATEGORY_LABELS[category as keyof typeof INFLUENCER_CATEGORY_LABELS] || category}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        {influencer.portfolio_urls && influencer.portfolio_urls.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-medium mb-2">포트폴리오</h3>
                                                <ul className="list-disc pl-5 space-y-1">
                                                    {influencer.portfolio_urls.map((url: string, index: number) => (
                                                        <li key={index}>
                                                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                                                {url}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="stats">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle>총 팔로워</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">{getTotalFollowers().toLocaleString()}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle>평균 참여율</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">{getAverageEngagementRate().toFixed(2)}%</div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-6">
                                {Object.values(SNS_TYPE).map((platform) => {
                                    const platformStats = getLatestStats(platform);
                                    if (!platformStats || platformStats.length === 0) return null;

                                    return (
                                        <Card key={platform}>
                                            <CardHeader>
                                                <CardTitle>{SNS_TYPE_LABELS[platform as keyof typeof SNS_TYPE_LABELS]} 통계</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="h-64">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <LineChart data={formatStatsForChart(platformStats)}>
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis dataKey="date" />
                                                            <YAxis yAxisId="left" />
                                                            <YAxis yAxisId="right" orientation="right" />
                                                            <Tooltip />
                                                            <Line yAxisId="left" type="monotone" dataKey="followers" stroke="#8884d8" name="팔로워 수" />
                                                            <Line yAxisId="right" type="monotone" dataKey="engagement" stroke="#82ca9d" name="참여율 (%)" />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </TabsContent>

                        <TabsContent value="verifications">
                            <Card>
                                <CardHeader>
                                    <CardTitle>인증 상태</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {Object.values(SNS_TYPE).map((platform) => {
                                            const verification = getLatestVerification(platform);

                                            return (
                                                <div key={platform} className="border rounded-lg p-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="text-lg font-medium">{SNS_TYPE_LABELS[platform as keyof typeof SNS_TYPE_LABELS]}</h3>
                                                            {verification ? (
                                                                <>
                                                                    <Badge className="bg-green-500">인증됨</Badge>
                                                                    <p className="text-sm text-gray-500 mt-1">인증일: {formatDate(verification.verified_at)}</p>
                                                                    <p className="text-sm text-gray-500">다음 인증 예정일: {formatDate(verification.next_verification_due)}</p>
                                                                </>
                                                            ) : (
                                                                <Badge className="bg-yellow-500">미인증</Badge>
                                                            )}
                                                        </div>

                                                        <div>
                                                            {verification ? (
                                                                <div className="text-right">
                                                                    <p className="text-sm text-gray-500">팔로워 수</p>
                                                                    <p className="font-semibold">{verification.followers_count.toLocaleString()}</p>

                                                                    {verification.engagement_rate !== null && (
                                                                        <>
                                                                            <p className="text-sm text-gray-500 mt-2">참여율</p>
                                                                            <p className="font-semibold">{verification.engagement_rate.toFixed(2)}%</p>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <Button size="sm" asChild>
                                                                    <Link to={`/admin/influencers/${influencer.profile_id}/verification`}>인증 추가</Link>
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-6">
                                        <h3 className="text-lg font-medium mb-4">인증 이력</h3>

                                        {verifications.length > 0 ? (
                                            <div className="space-y-4">
                                                {verifications.map((verification) => (
                                                    <div key={verification.verification_id} className="border rounded-lg p-4">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="font-medium">
                                                                    {SNS_TYPE_LABELS[verification.platform as keyof typeof SNS_TYPE_LABELS]}
                                                                    {verification.is_valid ? (
                                                                        <Badge className="ml-2 bg-green-500">유효함</Badge>
                                                                    ) : (
                                                                        <Badge className="ml-2 bg-red-500">유효하지 않음</Badge>
                                                                    )}
                                                                </h4>
                                                                <p className="text-sm text-gray-500">인증일: {formatDate(verification.verified_at)}</p>
                                                            </div>

                                                            <div className="text-right">
                                                                <p className="text-sm text-gray-500">팔로워 수</p>
                                                                <p className="font-semibold">{verification.followers_count.toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-center py-4">인증 이력이 없습니다.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
} 