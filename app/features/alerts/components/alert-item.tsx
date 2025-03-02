import { Link } from "react-router";
import { Badge } from "~/common/components/ui/badge";
import { Button } from "~/common/components/ui/button";
import { Card } from "~/common/components/ui/card";
import { ALERT_STATUS, ALERT_TYPE_LABELS } from "../constants";
import type { Alert } from "../types";
import { Form } from "react-router";
import { CheckIcon, ArchiveIcon, BellIcon, BellRingIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface AlertItemProps {
    alert: Alert;
    isArchived?: boolean;
}

export function AlertItem({ alert, isArchived = false }: AlertItemProps) {
    const isUnread = alert.alert_status === ALERT_STATUS.UNREAD;
    const formattedTime = formatDistanceToNow(new Date(alert.created_at), {
        addSuffix: true,
        locale: ko
    });

    return (
        <Card className={`p-4 ${isUnread ? 'border-primary/20 bg-primary/5' : ''}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className={`mt-1 ${isUnread ? 'text-primary' : 'text-muted-foreground'}`}>
                        {alert.is_important ? <BellRingIcon className="h-5 w-5" /> : <BellIcon className="h-5 w-5" />}
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h4 className="font-medium">{alert.title}</h4>
                            {alert.is_important && <Badge variant="destructive" className="text-xs">중요</Badge>}
                            <Badge variant="outline" className="text-xs">
                                {ALERT_TYPE_LABELS[alert.alert_type]}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.content}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formattedTime}</span>
                        </div>
                        {alert.link && (
                            <div className="pt-1">
                                <Button variant="link" className="h-auto p-0 text-sm" asChild>
                                    <Link to={alert.link}>자세히 보기</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isUnread && (
                        <Form method="post" className="inline">
                            <input type="hidden" name="intent" value="mark-read" />
                            <input type="hidden" name="alertId" value={alert.alert_id} />
                            <Button
                                variant="ghost"
                                size="icon"
                                type="submit"
                                title="읽음으로 표시"
                            >
                                <CheckIcon className="h-4 w-4" />
                            </Button>
                        </Form>
                    )}
                    {!isArchived && (
                        <Form method="post" className="inline">
                            <input type="hidden" name="intent" value="archive" />
                            <input type="hidden" name="alertId" value={alert.alert_id} />
                            <Button
                                variant="ghost"
                                size="icon"
                                type="submit"
                                title="보관하기"
                            >
                                <ArchiveIcon className="h-4 w-4" />
                            </Button>
                        </Form>
                    )}
                </div>
            </div>
        </Card>
    );
} 