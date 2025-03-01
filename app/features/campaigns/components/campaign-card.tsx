import { Link } from "react-router";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { Button } from "~/common/components/ui/button";
import type { Campaign } from "../types";
import { CAMPAIGN_STATUS, CAMPAIGN_STATUS_LABELS } from "../constants";
import { Form } from "react-router";
import { ROLES } from "~/features/users/constants";

interface CampaignCardProps {
    campaign_id: string;
    title: string;
    description: string;
    budget: number;
    campaign_status: Campaign["campaign_status"];
    target_market: string;
    requirements: string;
    period_start: string;
    period_end: string;
    advertiser_id: string;
    profiles?: {
        name: string;
        username: string;
        role: string;
    } | null;
    currentUserRole?: string;
    currentUserId?: string;
}

export function CampaignCard({
    campaign_id,
    title,
    description,
    budget,
    campaign_status,
    target_market,
    period_start,
    period_end,
    advertiser_id,
    profiles,
    currentUserRole,
    currentUserId,
}: CampaignCardProps) {
    console.log(currentUserRole, currentUserId, advertiser_id);
    const isOwner = currentUserId === advertiser_id;
    const isAdmin = currentUserRole === "admin";
    const isInfluencer = currentUserRole === "influencer";
    const isAdvertiser = currentUserRole === "advertiser";
    const isClosed = campaign_status === CAMPAIGN_STATUS.CLOSED as keyof typeof CAMPAIGN_STATUS;
    const isPublished = campaign_status === CAMPAIGN_STATUS.PUBLISHED as keyof typeof CAMPAIGN_STATUS;
    const isCancelled = campaign_status === CAMPAIGN_STATUS.CANCELLED as keyof typeof CAMPAIGN_STATUS;

    const cardContent = (
        <>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">
                        <Link to={`/campaigns/${currentUserRole?.toLocaleLowerCase()}/${campaign_id}`}>
                            {title}
                        </Link>
                    </CardTitle>
                    <Badge>{CAMPAIGN_STATUS_LABELS[campaign_status as keyof typeof CAMPAIGN_STATUS_LABELS]}</Badge>
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
                        <span className="text-muted-foreground text-sm">대상 시장</span>
                        <Badge variant="outline">
                            {target_market === "KR" ? "한국" : target_market === "JP" ? "일본" : "한국/일본"}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">기간</span>
                        <span className="text-sm">
                            {period_start} ~ {period_end}
                        </span>
                    </div>
                    {profiles && (
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">광고주</span>
                            <span className="text-sm">{profiles.name}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </>
    );

    // 관리자용 Footer
    const AdminFooter = () => (
        <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" size="sm" asChild>
                <Link to={`/my/campaigns/${campaign_id}/applications`}>지원자</Link>
            </Button>
            {isPublished && (
                <Form method="post">
                    <input type="hidden" name="intent" value="update-status" />
                    <input type="hidden" name="campaignId" value={campaign_id} />
                    <input type="hidden" name="status" value={CAMPAIGN_STATUS.CLOSED} />
                    <Button variant="outline" size="sm" type="submit">종료</Button>
                </Form>
            )}
            <Button size="sm" asChild>
                <Link to={`/my/campaigns/${campaign_id}`}>상세</Link>
            </Button>
        </CardFooter>
    );

    // 인플루언서용 Footer
    const InfluencerFooter = () => (
        <CardFooter className="flex justify-end gap-2">
            {isPublished && (
                <Form method="post">
                    <input type="hidden" name="intent" value="update-status" />
                    <input type="hidden" name="campaignId" value={campaign_id} />
                    <input type="hidden" name="status" value={CAMPAIGN_STATUS.CANCELLED} />
                    <Button variant="outline" size="sm" type="submit">취소</Button>
                </Form>
            )}
            {isCancelled && (
                <Form method="post">
                    <input type="hidden" name="intent" value="update-status" />
                    <input type="hidden" name="campaignId" value={campaign_id} />
                    <input type="hidden" name="status" value={CAMPAIGN_STATUS.PUBLISHED} />
                    <Button variant="outline" size="sm" type="submit">재신청</Button>
                </Form>
            )}
            <Button size="sm" asChild>
                <Link to={`/my/campaigns/${campaign_id}`}>상세</Link>
            </Button>
        </CardFooter>
    );

    // 광고주용 Footer
    const AdvertiserFooter = () => (
        <CardFooter className="flex justify-end gap-2">
            {isOwner && (
                <>
                    <Button variant="outline" size="sm" asChild>
                        <Link to={`/my/campaigns/${campaign_id}/applications`}>지원자</Link>
                    </Button>
                    {isPublished && (
                        <Form method="post">
                            <input type="hidden" name="intent" value="update-status" />
                            <input type="hidden" name="campaignId" value={campaign_id} />
                            <input type="hidden" name="status" value={CAMPAIGN_STATUS.CLOSED} />
                            <Button variant="outline" size="sm" type="submit">종료</Button>
                        </Form>
                    )}
                </>
            )}
            <Button size="sm" asChild>
                <Link to={`/my/campaigns/${campaign_id}`}>상세</Link>
            </Button>
        </CardFooter>
    );

    // 종료된 캠페인이면서 소유자가 아닌 경우
    if (isClosed && !isOwner) {
        return (
            <Card className="opacity-40">
                {cardContent}
            </Card>
        );
    }

    return (
        <Card>
            {cardContent}
            {isAdmin && <AdminFooter />}
            {isInfluencer && <InfluencerFooter />}
            {isAdvertiser && <AdvertiserFooter />}
        </Card>
    );
} 