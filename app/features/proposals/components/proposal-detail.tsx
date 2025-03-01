import { Badge } from "~/common/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/common/components/ui/card";
import { PROPOSAL_STATUS_LABELS, TARGET_MARKET_LABELS, CONTENT_TYPE_LABELS, INDUSTRY_LABELS } from "../constants";
import type { Database } from "database-generated.types";
import { formatDate } from "~/common/utils/date";

interface ProposalDetailProps {
    proposal: Database["public"]["Tables"]["influencer_proposals"]["Row"] & {
        influencer?: {
            name: string;
            username: string;
        };
    };
}

export function ProposalDetail({ proposal }: ProposalDetailProps) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">{proposal.title}</CardTitle>
                            <CardDescription className="mt-2">
                                <div className="flex gap-2">
                                    <Badge variant={proposal.proposal_status === "published" ? "default" : "secondary"}>
                                        {PROPOSAL_STATUS_LABELS[proposal.proposal_status as keyof typeof PROPOSAL_STATUS_LABELS]}
                                    </Badge>
                                    <Badge variant="outline">{TARGET_MARKET_LABELS[proposal.target_market]}</Badge>
                                    <Badge variant="outline">{CONTENT_TYPE_LABELS[proposal.content_type]}</Badge>
                                </div>
                            </CardDescription>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {formatDate(proposal.created_at)}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <h3 className="font-semibold mb-2">예산 정보</h3>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">희망 예산</p>
                                    <p className="font-medium">{proposal.desired_budget.toLocaleString()}원</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">협의 가능 여부</p>
                                    <p className="font-medium">{proposal.is_negotiable ? "가능" : "불가능"}</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">활동 기간</h3>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">시작일</p>
                                    <p className="font-medium">{formatDate(proposal.available_period_start)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">종료일</p>
                                    <p className="font-medium">{formatDate(proposal.available_period_end)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">제안 설명</h3>
                        <p className="whitespace-pre-wrap">{proposal.description}</p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">예상 결과물</h3>
                        <ul className="list-disc list-inside space-y-1">
                            {(proposal.expected_deliverables as string[]).map((deliverable) => (
                                <li key={deliverable}>{deliverable}</li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">카테고리</h3>
                        <div className="flex flex-wrap gap-2">
                            {(proposal.categories as string[]).map((category) => (
                                <Badge key={category} variant="outline">
                                    {category}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">선호 산업</h3>
                        <div className="flex flex-wrap gap-2">
                            {(proposal.preferred_industry as string[])?.map((industry) => (
                                <Badge key={industry} variant="outline">
                                    {INDUSTRY_LABELS[industry as keyof typeof INDUSTRY_LABELS]}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">키워드</h3>
                        <div className="flex flex-wrap gap-2">
                            {(proposal.keywords as string[]).map((keyword) => (
                                <Badge key={keyword} variant="secondary">
                                    {keyword}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {proposal.portfolio_samples && proposal.portfolio_samples.length > 0 && (
                        <div>
                            <h3 className="font-semibold mb-2">포트폴리오 샘플</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {(proposal.portfolio_samples as string[]).map((sample) => (
                                    <a
                                        key={sample}
                                        href={sample}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:underline break-all"
                                    >
                                        {sample}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 