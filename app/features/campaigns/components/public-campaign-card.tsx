import { Link } from "react-router";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { Button } from "~/common/components/ui/button";
import type { Campaign } from "../types";
import { CAMPAIGN_STATUS, CAMPAIGN_STATUS_LABELS } from "../constants";

interface PublicCampaignCardProps extends Omit<Campaign, 'advertiser'> {
    advertiser?: {
        name: string;
        username: string;
        role: string;
    };
    currentUserRole?: string | null;
    currentUserId?: string | null;
}

export function PublicCampaignCard({
    campaign_id,
    title,
    description,
    budget,
    campaign_status,
    target_market,
    requirements,
    period_start,
    period_end,
    advertiser_id,
    advertiser,
    currentUserRole,
    currentUserId,
}: PublicCampaignCardProps) {
    const isOwner = currentUserId === advertiser_id;
    const isAdmin = currentUserRole === "admin";
    const isAdvertiser = currentUserRole === "advertiser";
    const isInfluencer = currentUserRole === "influencer";
    const isClosed = campaign_status === CAMPAIGN_STATUS.CLOSED as keyof typeof CAMPAIGN_STATUS;
    const isPublished = campaign_status === CAMPAIGN_STATUS.PUBLISHED as keyof typeof CAMPAIGN_STATUS;

    const cardContent = (
        <>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg">
                            {title}
                        </CardTitle>
                        {advertiser && (
                            <p className="text-sm text-muted-foreground">
                                by {advertiser.name}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Badge>{CAMPAIGN_STATUS_LABELS[campaign_status as keyof typeof CAMPAIGN_STATUS_LABELS]}</Badge>
                        <Badge variant="outline">
                            {target_market === "KR" ? "한국" : target_market === "JP" ? "일본" : "한국/일본"}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm line-clamp-2">{description}</p>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">예산</span>
                        <span className="font-medium">{budget.toLocaleString()}원</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">기간</span>
                        <span className="text-sm">
                            {period_start} ~ {period_end}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">지원 요건</span>
                        <span className="text-sm line-clamp-1 text-right max-w-[200px]">
                            {requirements}
                        </span>
                    </div>
                </div>
            </CardContent>
        </>
    );

    return (
        <Card className={isClosed ? "opacity-40" : undefined}>
            {cardContent}
            <CardFooter className="flex justify-end gap-2">
                {/* 인플루언서이고 캠페인이 진행중일 때만 지원하기 버튼 표시 */}
                {isInfluencer && isPublished && (
                    <Button asChild>
                        <Link to={`/campaigns/${campaign_id}`}>지원하기</Link>
                    </Button>
                )}
                {/* 관리자나 소유자는 관리 페이지로 이동 */}
                {(isAdmin || isOwner) && (
                    <Button variant="outline" asChild>
                        <Link to={`/my/campaigns/${campaign_id}`}>관리</Link>
                    </Button>
                )}
                {/* 그 외의 경우 (비로그인 포함) 상세보기만 표시 */}
                {!isInfluencer && !isAdmin && !isOwner && (
                    <Button variant="outline" asChild>
                        <Link to={`/campaigns/${campaign_id}`}>상세보기</Link>
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
} 