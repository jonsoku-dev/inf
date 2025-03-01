import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Button } from "~/common/components/ui/button";
import { Badge } from "~/common/components/ui/badge";
import { Link } from "react-router";
import { APPLICATION_STATUS } from "../constants";

interface CampaignApplicationStatusProps {
    campaignId: string;
    hasApplied: boolean;
    application: {
        application_id: string;
        application_status: typeof APPLICATION_STATUS[keyof typeof APPLICATION_STATUS];
        message: string;
        applied_at: string;
        campaign_id: string;
        influencer_id: string;
        updated_at: string;
    } | null;
}

export function CampaignApplicationStatus({ campaignId, hasApplied, application }: CampaignApplicationStatusProps) {
    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case APPLICATION_STATUS.PENDING: return "bg-yellow-500";
            case APPLICATION_STATUS.ACCEPTED: return "bg-green-500";
            case APPLICATION_STATUS.REJECTED: return "bg-red-500";
            case APPLICATION_STATUS.COMPLETED: return "bg-blue-500";
            default: return "";
        }
    };

    if (!hasApplied) {
        return (
            <Card>
                <CardContent className="py-6">
                    <div className="text-center space-y-4">
                        <h3 className="text-lg font-medium">이 캠페인에 참여하시겠습니까?</h3>
                        <p className="text-muted-foreground">
                            캠페인 내용을 꼼꼼히 확인하신 후 지원해주세요.
                        </p>
                        <Button asChild>
                            <Link to={`/campaigns/${campaignId}/apply`}>
                                지원하기
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>지원 현황</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">지원 상태</p>
                        <Badge className={getStatusBadgeColor(application?.application_status || "")}>
                            {application?.application_status === APPLICATION_STATUS.PENDING && "검토중"}
                            {application?.application_status === APPLICATION_STATUS.ACCEPTED && "승인됨"}
                            {application?.application_status === APPLICATION_STATUS.REJECTED && "거절됨"}
                            {application?.application_status === APPLICATION_STATUS.COMPLETED && "완료됨"}
                        </Badge>
                    </div>
                    <div className="space-y-1 text-right">
                        <p className="text-sm text-muted-foreground">지원일</p>
                        <p>{new Date(application?.applied_at || "").toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">지원 메시지</p>
                    <p className="text-sm">{application?.message}</p>
                </div>

                {application?.application_status === APPLICATION_STATUS.ACCEPTED && (
                    <div className="pt-4">
                        <Button className="w-full" asChild>
                            <Link to={`/my/applications/${application.application_id}`}>
                                캠페인 진행하기
                            </Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 