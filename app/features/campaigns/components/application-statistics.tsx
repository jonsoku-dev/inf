import { Card, CardContent } from "~/common/components/ui/card";
import { Avatar, AvatarFallback } from "~/common/components/ui/avatar";
import { Badge } from "~/common/components/ui/badge";
import { Separator } from "~/common/components/ui/separator";
import { APPLICATION_STATUS } from "../constants";

interface ApplicationStatisticsProps {
    applications: Array<{
        application_id: string;
        application_status: typeof APPLICATION_STATUS[keyof typeof APPLICATION_STATUS];
        influencer: {
            name: string;
            username: string;
        };
    }>;
}

export function ApplicationStatistics({ applications }: ApplicationStatisticsProps) {
    const applicationCounts = {
        total: applications.length,
        pending: applications.filter(app => app.application_status === APPLICATION_STATUS.PENDING).length,
        approved: applications.filter(app => app.application_status === APPLICATION_STATUS.ACCEPTED).length,
        rejected: applications.filter(app => app.application_status === APPLICATION_STATUS.REJECTED).length,
        completed: applications.filter(app => app.application_status === APPLICATION_STATUS.COMPLETED).length,
    };

    return (
        <Card>
            <CardContent className="py-6 space-y-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">지원 현황</h3>
                    <div className="grid grid-cols-5 gap-4">
                        <div className="space-y-1">
                            <p className="text-2xl font-bold">{applicationCounts.total}</p>
                            <p className="text-sm text-muted-foreground">총 지원자</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-bold">{applicationCounts.pending}</p>
                            <p className="text-sm text-muted-foreground">검토중</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-bold">{applicationCounts.approved}</p>
                            <p className="text-sm text-muted-foreground">승인됨</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-bold">{applicationCounts.rejected}</p>
                            <p className="text-sm text-muted-foreground">거절됨</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-bold">{applicationCounts.completed}</p>
                            <p className="text-sm text-muted-foreground">완료됨</p>
                        </div>
                    </div>
                </div>

                {applications.length > 0 && (
                    <>
                        <Separator />
                        <div className="space-y-4">
                            <h4 className="font-medium">최근 지원자</h4>
                            <div className="space-y-2">
                                {applications.slice(0, 5).map((application) => (
                                    <div key={application.application_id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <Avatar>
                                                <AvatarFallback>{application.influencer.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{application.influencer.name}</p>
                                                <p className="text-sm text-muted-foreground">@{application.influencer.username}</p>
                                            </div>
                                        </div>
                                        <Badge>
                                            {application.application_status === APPLICATION_STATUS.PENDING && "검토중"}
                                            {application.application_status === APPLICATION_STATUS.ACCEPTED && "승인됨"}
                                            {application.application_status === APPLICATION_STATUS.REJECTED && "거절됨"}
                                            {application.application_status === APPLICATION_STATUS.COMPLETED && "완료됨"}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
} 