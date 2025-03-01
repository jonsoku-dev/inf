import { getServerClient } from "~/server";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { Button } from "~/common/components/ui/button";
import { Form } from "react-router";
import type { Route } from "./+types/verifications-page";
import type { Database } from "database-generated.types";

export const loader = async ({ request }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

    const { data: profile } = await supabase
        .from("influencer_profiles")
        .select("*")
        .eq("profile_id", user.id)
        .single();

    if (!profile) {
        return { profile: null, verifications: null };
    }

    const { data: verifications } = await supabase
        .from("influencer_verifications")
        .select("*")
        .eq("profile_id", user.id)
        .order("verified_at", { ascending: false });

    return { verifications, profile };
};

export const action = async ({ request }: Route.ActionArgs) => {
    const { supabase } = getServerClient(request);
    const formData = await request.formData();
    const { data: { user } } = await supabase.auth.getUser();
    const platform = formData.get("platform") as Database["public"]["Enums"]["sns_type"];

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

    // 다음 인증 예정일 계산 (30일 후)
    const nextVerificationDue = new Date();
    nextVerificationDue.setDate(nextVerificationDue.getDate() + 30);

    // 실제 구현에서는 여기서 SNS 계정 인증 로직을 구현해야 합니다
    const { error } = await supabase
        .from("influencer_verifications")
        .insert({
            profile_id: user.id,
            platform,
            followers_count: 0,
            engagement_rate: 0,
            is_valid: true,
            verified_at: new Date().toISOString(),
            next_verification_due: nextVerificationDue.toISOString(),
        });

    if (error) throw error;

    return { success: true };
};

export default function VerificationsPage({ loaderData }: Route.ComponentProps) {
    const { verifications, profile } = loaderData;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Instagram 인증 카드 */}
                <Card>
                    <CardHeader>
                        <CardTitle>Instagram 인증</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p>계정: {profile?.instagram_handle || "미설정"}</p>
                            {verifications?.find(v => v.platform === "INSTAGRAM") ? (
                                <Badge>인증됨</Badge>
                            ) : (
                                <Form method="post">
                                    <input type="hidden" name="platform" value="INSTAGRAM" />
                                    <Button type="submit" disabled={!profile?.instagram_handle}>
                                        인증하기
                                    </Button>
                                </Form>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* YouTube 인증 카드 */}
                <Card>
                    <CardHeader>
                        <CardTitle>YouTube 인증</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p>계정: {profile?.youtube_handle || "미설정"}</p>
                            {verifications?.find(v => v.platform === "YOUTUBE") ? (
                                <Badge>인증됨</Badge>
                            ) : (
                                <Form method="post">
                                    <input type="hidden" name="platform" value="YOUTUBE" />
                                    <Button type="submit" disabled={!profile?.youtube_handle}>
                                        인증하기
                                    </Button>
                                </Form>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* TikTok 인증 카드 */}
                <Card>
                    <CardHeader>
                        <CardTitle>TikTok 인증</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p>계정: {profile?.tiktok_handle || "미설정"}</p>
                            {verifications?.find(v => v.platform === "TIKTOK") ? (
                                <Badge>인증됨</Badge>
                            ) : (
                                <Form method="post">
                                    <input type="hidden" name="platform" value="TIKTOK" />
                                    <Button type="submit" disabled={!profile?.tiktok_handle}>
                                        인증하기
                                    </Button>
                                </Form>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 인증 이력 */}
            {verifications && verifications.length > 0 ? (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">인증 이력</h2>
                    <div className="grid gap-4">
                        {verifications.map((verification) => (
                            <Card key={verification.verification_id}>
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{verification.platform}</p>
                                            <p className="text-sm text-muted-foreground">
                                                인증일: {new Date(verification.verified_at).toLocaleDateString()}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                다음 인증 예정일: {new Date(verification.next_verification_due).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Badge variant={verification.is_valid ? "default" : "destructive"}>
                                            {verification.is_valid ? "유효" : "만료"}
                                        </Badge>
                                    </div>
                                    <div className="mt-4 space-y-1">
                                        <p className="text-sm">팔로워: {verification.followers_count.toLocaleString()}</p>
                                        <p className="text-sm">참여율: {verification.engagement_rate}%</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-6">
                    <p className="text-muted-foreground">인증 이력이 없습니다. SNS 계정을 인증해보세요.</p>
                </div>
            )}
        </div>
    );
} 