import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import { Card, CardContent, CardHeader } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { Button } from "~/common/components/ui/button";
import { Link } from "react-router";
import { Pencil } from "lucide-react";
import type { InfluencerProfile } from "../types";
import { INFLUENCER_CATEGORY_LABELS, SNS_TYPE_LABELS } from "../constants";

interface InfluencerProfileViewProps {
    profile: InfluencerProfile;
}

export function InfluencerProfileView({ profile }: InfluencerProfileViewProps) {
    console.log("프로필 뷰 렌더링:", profile);

    // followers_count가 Json 타입이므로 안전하게 처리
    const followersCount = profile.followers_count as Record<string, number>;

    // 카테고리가 배열인지 확인
    const categories = Array.isArray(profile.categories) ? profile.categories : [];

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                    <Avatar className="size-16">
                        <AvatarImage src={profile.profile?.avatar_url ?? undefined} />
                        <AvatarFallback>{profile.profile?.name?.[0] ?? '?'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-2xl font-semibold">{profile.profile?.name}</h2>
                        <p className="text-muted-foreground">@{profile.profile?.username}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {profile.introduction && (
                    <div>
                        <h3 className="text-sm font-medium mb-2">소개</h3>
                        <p className="text-muted-foreground">{profile.introduction}</p>
                    </div>
                )}

                <div>
                    <h3 className="text-sm font-medium mb-2">카테고리</h3>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <Badge key={category} variant="secondary">
                                {INFLUENCER_CATEGORY_LABELS[category as keyof typeof INFLUENCER_CATEGORY_LABELS]}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-medium mb-2">팔로워 수</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(followersCount || {}).map(([platform, count]) => (
                            <div key={platform} className="flex items-center gap-2">
                                <span className="text-muted-foreground">
                                    {SNS_TYPE_LABELS[platform as keyof typeof SNS_TYPE_LABELS] || platform}:
                                </span>
                                <span>{typeof count === 'number' ? count.toLocaleString() : '0'}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-medium mb-2">SNS 계정</h3>
                    <div className="space-y-2">
                        {profile.instagram_handle && (
                            <p className="text-sm">
                                Instagram: {profile.instagram_handle}
                            </p>
                        )}
                        {profile.youtube_handle && (
                            <p className="text-sm">
                                YouTube: {profile.youtube_handle}
                            </p>
                        )}
                        {profile.tiktok_handle && (
                            <p className="text-sm">
                                TikTok: {profile.tiktok_handle}
                            </p>
                        )}
                        {profile.blog_url && (
                            <p className="text-sm">
                                Blog: {profile.blog_url}
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 