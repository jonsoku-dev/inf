import type { Database } from "database-generated.types";
import { useState } from "react";
import { Link } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import { Badge } from "~/common/components/ui/badge";
import { Button } from "~/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Input } from "~/common/components/ui/input";
import { Label } from "~/common/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/common/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/common/components/ui/tabs";
import { INFLUENCER_CATEGORY_LABELS, SNS_TYPE, SNS_TYPE_LABELS } from "~/features/influencers/constants";
import { formatDate } from "~/lib/utils";
import { getServerClient } from "~/server";
import type { Route } from "./+types/verification-page";

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

    // 대기 중인 인증 요청 (is_valid가 null인 경우)
    const pendingVerifications = verifications?.filter(v => v.is_valid === null) || [];

    // 완료된 인증 요청 (is_valid가 true 또는 false인 경우)
    const completedVerifications = verifications?.filter(v => v.is_valid !== null) || [];

    return {
        influencer: influencer,
        verifications: completedVerifications,
        pendingVerifications: pendingVerifications
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
        if (action === "approve") {
            const verificationId = formData.get("verification_id") as string;

            if (!verificationId) {
                return { error: "인증 ID가 필요합니다" };
            }

            // 인증 정보 가져오기
            const { data: verification } = await supabase
                .from("influencer_verifications")
                .select("*")
                .eq("verification_id", verificationId)
                .single();

            if (!verification) {
                return { error: "인증 정보를 찾을 수 없습니다" };
            }

            // 인증 승인
            await supabase
                .from("influencer_verifications")
                .update({
                    is_valid: true,
                    verified_at: new Date().toISOString(),
                    next_verification_due: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90일 후
                })
                .eq("verification_id", verificationId);

            // 인플루언서 팔로워 수 업데이트
            const { data: influencer } = await supabase
                .from("influencer_profiles")
                .select("followers_count")
                .eq("profile_id", influencerId)
                .single();

            if (influencer) {
                const followersCountData = influencer.followers_count as Record<string, number> || {};
                const updatedFollowersCount = {
                    ...followersCountData,
                    [verification.platform]: verification.followers_count
                };

                await supabase
                    .from("influencer_profiles")
                    .update({
                        followers_count: updatedFollowersCount
                    })
                    .eq("profile_id", influencerId);
            }

            return { success: "인증이 승인되었습니다" };
        } else if (action === "reject") {
            const verificationId = formData.get("verification_id") as string;

            if (!verificationId) {
                return { error: "인증 ID가 필요합니다" };
            }

            // 인증 거부
            await supabase
                .from("influencer_verifications")
                .update({
                    is_valid: false,
                    verified_at: new Date().toISOString()
                })
                .eq("verification_id", verificationId);

            return { success: "인증이 거부되었습니다" };
        } else if (action === "delete") {
            const verificationId = formData.get("verification_id") as string;

            if (!verificationId) {
                return { error: "인증 ID가 필요합니다" };
            }

            // 인증 삭제
            await supabase
                .from("influencer_verifications")
                .delete()
                .eq("verification_id", verificationId);

            return { success: "인증 요청이 삭제되었습니다" };
        } else if (action === "add") {
            const platform = formData.get("platform") as Database["public"]["Enums"]["sns_type"];
            const followersCount = parseInt(formData.get("followers_count") as string, 10);
            const engagementRate = parseFloat(formData.get("engagement_rate") as string);

            if (!platform || isNaN(followersCount)) {
                return { error: "유효하지 않은 입력입니다" };
            }

            // 현재 날짜로부터 90일 후 날짜 계산
            const nextVerificationDue = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

            // 인증 정보 추가 - is_valid를 undefined로 설정하여 데이터베이스 기본값 사용
            await supabase
                .from("influencer_verifications")
                .insert({
                    profile_id: influencerId,
                    platform,
                    followers_count: followersCount,
                    engagement_rate: isNaN(engagementRate) ? null : engagementRate,
                    next_verification_due: nextVerificationDue
                });

            return { success: "인증 요청이 추가되었습니다" };
        }

        return { error: "지원하지 않는 작업입니다" };
    } catch (error) {
        return { error: "작업 중 오류가 발생했습니다" };
    }
}

export const meta: Route.MetaFunction = ({ data }) => {
    if (!data?.influencer) {
        return [
            { title: "인플루언서 인증 관리 - 관리자 페이지" },
            { name: "description", content: "인플루언서 인증 정보를 관리합니다" },
        ];
    }

    return [
        { title: `${data.influencer.profile.name} - 인증 관리` },
        { name: "description", content: `인플루언서 ${data.influencer.profile.name}의 인증 정보를 관리합니다` },
    ];
};

export default function VerificationPage({ loaderData, actionData }: Route.ComponentProps) {
    const { influencer, verifications, pendingVerifications } = loaderData || {};
    const [activeTab, setActiveTab] = useState("pending");
    const [formData, setFormData] = useState({
        platform: SNS_TYPE.INSTAGRAM,
        followers_count: "",
        engagement_rate: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (!influencer) {
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
                <h1 className="text-2xl font-bold">인플루언서 인증 관리</h1>
                <div className="flex gap-2">
                    <Link to={`/admin/influencers/${influencer.profile_id}`}>
                        <Button variant="outline">상세 정보로 돌아가기</Button>
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
                                <AvatarImage src={influencer.profile.name || ""} alt={influencer.profile.name} />
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

                            <div className="mt-6 w-full space-y-4">
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
                    </CardContent>
                </Card>

                <div className="lg:col-span-3">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid grid-cols-2 mb-6">
                            <TabsTrigger value="pending">대기 중인 인증 ({pendingVerifications?.length || 0})</TabsTrigger>
                            <TabsTrigger value="history">인증 이력 ({verifications?.length || 0})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="pending">
                            <Card>
                                <CardHeader>
                                    <CardTitle>대기 중인 인증 요청</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {pendingVerifications && pendingVerifications.length > 0 ? (
                                        <div className="space-y-4">
                                            {pendingVerifications.map((verification) => (
                                                <div key={verification.verification_id} className="border rounded-lg p-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="text-lg font-medium">
                                                                {SNS_TYPE_LABELS[verification.platform as keyof typeof SNS_TYPE_LABELS]}
                                                            </h3>
                                                            <p className="text-sm text-gray-500">요청일: {formatDate(verification.verified_at)}</p>
                                                            <div className="mt-2">
                                                                <p><span className="font-medium">팔로워 수:</span> {verification.followers_count.toLocaleString()}</p>
                                                                {verification.engagement_rate !== null && (
                                                                    <p><span className="font-medium">참여율:</span> {verification.engagement_rate.toFixed(2)}%</p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex gap-2">
                                                            <form method="post">
                                                                <input type="hidden" name="action" value="approve" />
                                                                <input type="hidden" name="verification_id" value={verification.verification_id} />
                                                                <Button type="submit" size="sm" className="bg-green-500 hover:bg-green-600">승인</Button>
                                                            </form>

                                                            <form method="post">
                                                                <input type="hidden" name="action" value="reject" />
                                                                <input type="hidden" name="verification_id" value={verification.verification_id} />
                                                                <Button type="submit" size="sm" className="bg-red-500 hover:bg-red-600">거부</Button>
                                                            </form>

                                                            <form method="post">
                                                                <input type="hidden" name="action" value="delete" />
                                                                <input type="hidden" name="verification_id" value={verification.verification_id} />
                                                                <Button type="submit" size="sm" variant="outline">삭제</Button>
                                                            </form>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center py-4 text-gray-500">대기 중인 인증 요청이 없습니다.</p>
                                    )}

                                    <div className="mt-8">
                                        <h3 className="text-lg font-medium mb-4">새 인증 요청 추가</h3>

                                        <form method="post" className="space-y-4">
                                            <input type="hidden" name="action" value="add" />

                                            <div>
                                                <Label htmlFor="platform">플랫폼</Label>
                                                <Select
                                                    name="platform"
                                                    value={formData.platform}
                                                    onValueChange={(value) => handleSelectChange("platform", value)}
                                                >
                                                    <SelectTrigger id="platform">
                                                        <SelectValue placeholder="플랫폼 선택" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(SNS_TYPE).map(([key, value]) => (
                                                            <SelectItem key={key} value={value}>
                                                                {SNS_TYPE_LABELS[value as keyof typeof SNS_TYPE_LABELS]}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label htmlFor="followers_count">팔로워 수</Label>
                                                <Input
                                                    id="followers_count"
                                                    name="followers_count"
                                                    type="number"
                                                    value={formData.followers_count}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="engagement_rate">참여율 (%)</Label>
                                                <Input
                                                    id="engagement_rate"
                                                    name="engagement_rate"
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.engagement_rate}
                                                    onChange={handleInputChange}
                                                />
                                            </div>

                                            <Button type="submit">인증 요청 추가</Button>
                                        </form>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="history">
                            <Card>
                                <CardHeader>
                                    <CardTitle>인증 이력</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {verifications && verifications.length > 0 ? (
                                        <div className="space-y-4">
                                            {verifications.map((verification) => (
                                                <div key={verification.verification_id} className="border rounded-lg p-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="text-lg font-medium">
                                                                {SNS_TYPE_LABELS[verification.platform as keyof typeof SNS_TYPE_LABELS]}
                                                                {verification.is_valid ? (
                                                                    <Badge className="ml-2 bg-green-500">승인됨</Badge>
                                                                ) : (
                                                                    <Badge className="ml-2 bg-red-500">거부됨</Badge>
                                                                )}
                                                            </h3>
                                                            <p className="text-sm text-gray-500">인증일: {formatDate(verification.verified_at)}</p>
                                                            <div className="mt-2">
                                                                <p><span className="font-medium">팔로워 수:</span> {verification.followers_count.toLocaleString()}</p>
                                                                {verification.engagement_rate !== null && (
                                                                    <p><span className="font-medium">참여율:</span> {verification.engagement_rate.toFixed(2)}%</p>
                                                                )}
                                                            </div>
                                                            {verification.is_valid && verification.next_verification_due && (
                                                                <p className="text-sm text-gray-500 mt-1">다음 인증 예정일: {formatDate(verification.next_verification_due)}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center py-4 text-gray-500">인증 이력이 없습니다.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
