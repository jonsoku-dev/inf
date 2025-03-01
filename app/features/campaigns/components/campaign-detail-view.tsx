import { Avatar, AvatarFallback } from "~/common/components/ui/avatar";
import { Badge } from "~/common/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { CAMPAIGN_STATUS_LABELS } from "../constants";

interface CampaignDetailViewProps {
    campaign: {
        title: string;
        description: string;
        campaign_status: "DRAFT" | "PUBLISHED" | "CLOSED" | "CANCELLED" | "COMPLETED";
        target_market: string;
        budget: number;
        start_date: string;
        end_date: string;
        requirements: string[] | null;
        is_negotiable?: boolean | null;
        min_followers?: number | null;
        preferred_gender?: string | null;
        location_requirements?: string | null;
        campaign_type?: string;
        advertiser: {
            name: string;
            username: string;
        };
    };
    renderActions?: () => React.ReactNode;
}

export function CampaignDetailView({ campaign, renderActions }: CampaignDetailViewProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <CardTitle className="text-2xl">{campaign.title}</CardTitle>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Avatar>
                                    <AvatarFallback>{campaign.advertiser.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{campaign.advertiser.name}</p>
                                    <p className="text-sm text-muted-foreground">@{campaign.advertiser.username}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Badge>{CAMPAIGN_STATUS_LABELS[campaign.campaign_status as keyof typeof CAMPAIGN_STATUS_LABELS]}</Badge>
                                <Badge variant="outline">
                                    {campaign.target_market === "KR" ? "한국" : campaign.target_market === "JP" ? "일본" : "한국/일본"}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    {renderActions && renderActions()}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="prose max-w-none">
                        <p>{campaign.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h3 className="font-medium">예산</h3>
                            <p className="text-lg font-semibold">
                                {campaign.budget.toLocaleString()}원
                                {campaign.is_negotiable && <span className="text-sm text-muted-foreground ml-2">(협의 가능)</span>}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-medium">캠페인 기간</h3>
                            <p>{campaign.start_date} ~ {campaign.end_date}</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-medium">지원 요건</h3>
                            <div className="space-y-1">
                                {campaign.requirements?.map((req, index) => (
                                    <p key={index}>{req}</p>
                                ))}
                                {campaign.min_followers && (
                                    <p>최소 팔로워 수: {campaign.min_followers.toLocaleString()}명</p>
                                )}
                                {campaign.preferred_gender && (
                                    <p>선호 성별: {campaign.preferred_gender === "MALE" ? "남성" : campaign.preferred_gender === "FEMALE" ? "여성" : "무관"}</p>
                                )}
                                {campaign.location_requirements && (
                                    <p>지역 요건: {campaign.location_requirements}</p>
                                )}
                            </div>
                        </div>
                        {campaign.campaign_type && (
                            <div className="space-y-2">
                                <h3 className="font-medium">캠페인 유형</h3>
                                <p>{campaign.campaign_type === "INSTAGRAM" ? "인스타그램" :
                                    campaign.campaign_type === "YOUTUBE" ? "유튜브" :
                                        campaign.campaign_type === "TIKTOK" ? "틱톡" : "블로그"}</p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 