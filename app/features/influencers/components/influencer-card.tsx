import { Link } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import { Card, CardContent, CardHeader } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import type { InfluencerProfile } from "../types";
import { INFLUENCER_CATEGORY_LABELS, SNS_TYPE, SNS_TYPE_LABELS } from "../constants";
import { CheckCircle2, XCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/common/components/ui/tooltip";

interface InfluencerCardProps {
    influencer: InfluencerProfile;
}

export function InfluencerCard({ influencer }: InfluencerCardProps) {
    // 가장 최근의 검증 정보를 플랫폼별로 가져옴
    const latestVerifications = influencer.verifications?.reduce((acc, ver) => {
        if (!acc[ver.platform] || new Date(ver.verified_at) > new Date(acc[ver.platform].verified_at)) {
            acc[ver.platform] = ver;
        }
        return acc;
    }, {} as Record<string, typeof influencer.verifications[0]>);

    // 가장 최근의 통계 정보를 플랫폼별로 가져옴
    const latestStats = influencer.stats?.reduce((acc, stat) => {
        if (!acc[stat.platform] || new Date(stat.recorded_at) > new Date(acc[stat.platform].recorded_at)) {
            acc[stat.platform] = stat;
        }
        return acc;
    }, {} as Record<string, typeof influencer.stats[0]>);

    return (
        <Card className="hover:bg-muted/50 transition-colors">
            <Link to={`/influencers/${influencer.profile_id}`}>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="size-12">
                        <AvatarImage src={influencer.profile.avatar_url} />
                        <AvatarFallback>{influencer.profile.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-semibold">{influencer.profile.name}</h3>
                        <p className="text-sm text-muted-foreground">@{influencer.profile.username}</p>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {influencer.introduction && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {influencer.introduction}
                        </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                        {influencer.categories.map((category) => (
                            <Badge key={category} variant="secondary">
                                {INFLUENCER_CATEGORY_LABELS[category as keyof typeof INFLUENCER_CATEGORY_LABELS]}
                            </Badge>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(influencer.followers_count).map(([platform, count]) => {
                            const verification = latestVerifications?.[platform];
                            const stats = latestStats?.[platform];
                            const snsType = platform as keyof typeof SNS_TYPE;

                            return (
                                <div key={platform} className="flex items-center gap-2">
                                    <span className="text-muted-foreground">
                                        {SNS_TYPE_LABELS[snsType]}:
                                    </span>
                                    <span>{count?.toLocaleString()}</span>
                                    {verification && (
                                        <Tooltip>
                                            <TooltipTrigger>
                                                {verification.is_valid ? (
                                                    <CheckCircle2 className="size-4 text-green-500" />
                                                ) : (
                                                    <XCircle className="size-4 text-red-500" />
                                                )}
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>검증일: {new Date(verification.verified_at).toLocaleDateString()}</p>
                                                <p>참여율: {verification.engagement_rate}%</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Link>
        </Card>
    );
} 