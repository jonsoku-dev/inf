import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { PROPOSAL_APPLICATION_STATUS_LABELS } from "../constants";
import { formatDate } from "~/common/utils/date";

interface ApplicationStatusProps {
    application: any; // 타입은 실제 데이터 구조에 맞게 정의 필요
}

export function ApplicationStatus({ application }: ApplicationStatusProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>신청 현황</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">신청 상태</p>
                        <Badge>
                            {PROPOSAL_APPLICATION_STATUS_LABELS[application.proposal_application_status]}
                        </Badge>
                    </div>
                    <div className="space-y-1 text-right">
                        <p className="text-sm text-muted-foreground">신청일</p>
                        <p>{formatDate(application.applied_at)}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">신청 메시지</p>
                    <p className="whitespace-pre-wrap">{application.message}</p>
                </div>
            </CardContent>
        </Card>
    );
} 