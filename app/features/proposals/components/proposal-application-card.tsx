import { Badge } from "~/common/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/common/components/ui/card";
import { PROPOSAL_APPLICATION_STATUS_LABELS } from "../constants";
import { formatDate } from "~/common/utils/date";

interface ProposalApplicationCardProps {
    application: any; // 타입은 실제 데이터 구조에 맞게 정의 필요
}

export function ProposalApplicationCard({ application }: ProposalApplicationCardProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{application.proposal.title}</CardTitle>
                    <Badge>
                        {PROPOSAL_APPLICATION_STATUS_LABELS[application.proposal_application_status]}
                    </Badge>
                </div>
                <CardDescription>
                    <div className="flex gap-2 text-sm">
                        <span>{application.proposal.influencer.name}</span>
                        <span>•</span>
                        <span>{formatDate(application.applied_at)}</span>
                    </div>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground">신청 메시지</p>
                        <p className="line-clamp-2">{application.message}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">희망 예산</p>
                        <p className="font-medium">{application.proposal.desired_budget.toLocaleString()}원</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 