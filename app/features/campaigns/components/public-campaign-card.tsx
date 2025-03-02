import { Link } from "react-router";
import { Badge } from "~/common/components/ui/badge";
import { Button } from "~/common/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/common/components/ui/card";
import { formatCurrency } from "~/lib/utils";

interface PublicCampaignCardProps {
    campaign_id: string;
    title: string;
    description: string;
    budget: number;
    campaign_type: string;
    is_negotiable: boolean;
    is_urgent: boolean;
    formatted_start_date?: string;
    formatted_end_date?: string;
    advertiser: {
        name: string;
        username: string;
    };
    isOwner?: boolean;
}

export function PublicCampaignCard({
    campaign_id,
    title,
    description,
    budget,
    campaign_type,
    is_negotiable,
    is_urgent,
    formatted_start_date,
    formatted_end_date,
    advertiser,
    isOwner
}: PublicCampaignCardProps) {
    const campaignTypeLabel = {
        INSTAGRAM: "인스타그램",
        YOUTUBE: "유튜브",
        TIKTOK: "틱톡",
        BLOG: "블로그"
    }[campaign_type] || campaign_type;

    // 설명 텍스트 길이 제한
    const truncatedDescription = description.length > 100
        ? description.substring(0, 100) + "..."
        : description;

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2">{title}</CardTitle>
                    {is_urgent && (
                        <Badge variant="destructive" className="ml-2 shrink-0">긴급</Badge>
                    )}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                    <span>{advertiser.name}</span>
                    <span className="mx-1">•</span>
                    <Badge variant="outline" className="font-normal">{campaignTypeLabel}</Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{truncatedDescription}</p>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">예산</span>
                        <span className="font-medium">
                            {formatCurrency(budget)}
                            {is_negotiable && <span className="text-xs ml-1">(협의 가능)</span>}
                        </span>
                    </div>
                    {formatted_start_date && formatted_end_date && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">기간</span>
                            <span className="font-medium">{formatted_start_date} ~ {formatted_end_date}</span>
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="pt-2">
                <Button asChild className="w-full">
                    <Link to={isOwner
                        ? `/campaigns/advertiser/${campaign_id}`
                        : `/campaigns/${campaign_id}`
                    }>
                        {isOwner ? '관리하기' : '자세히 보기'}
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
} 