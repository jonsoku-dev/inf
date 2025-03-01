import { Badge } from "~/common/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/common/components/ui/card";
import { PROPOSAL_STATUS_LABELS, TARGET_MARKET_LABELS, CONTENT_TYPE_LABELS } from "../constants";
import type { Proposal } from "../types";
import { formatDate } from "~/common/utils/date";
import type { Database } from "database-generated.types";

interface ProposalCardProps {
    proposal: Database["public"]["Tables"]["influencer_proposals"]["Row"] & {
        influencer?: {
            name: string;
            username: string;
        };
    };
}

export function ProposalCard({ proposal }: ProposalCardProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{proposal.title}</CardTitle>
                    <Badge variant={proposal.proposal_status === "published" ? "default" : "secondary"}>
                        {PROPOSAL_STATUS_LABELS[proposal.proposal_status as keyof typeof PROPOSAL_STATUS_LABELS]}
                    </Badge>
                </div>
                <CardDescription>
                    <div className="flex gap-2 text-sm">
                        <span>{TARGET_MARKET_LABELS[proposal.target_market]}</span>
                        <span>•</span>
                        <span>{CONTENT_TYPE_LABELS[proposal.content_type]}</span>
                        <span>•</span>
                        <span>{formatDate(proposal.created_at)}</span>
                    </div>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground">희망 예산</p>
                        <p className="font-medium">{proposal.desired_budget.toLocaleString()}원</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">활동 가능 기간</p>
                        <p className="font-medium">
                            {formatDate(proposal.available_period_start)} ~ {formatDate(proposal.available_period_end)}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {(proposal.categories as string[]).map((category) => (
                            <Badge key={category} variant="outline">
                                {category}
                            </Badge>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 