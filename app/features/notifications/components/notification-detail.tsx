import { Form } from "react-router";
import { X } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/common/components/ui/card";
import { formatDate } from "~/common/utils/date";
import type { Notification } from "../types";

interface NotificationDetailProps {
    notification: Notification;
    onClose?: () => void;
}

export function NotificationDetail({ notification, onClose }: NotificationDetailProps) {
    const { notification_id, title, content, notification_type, is_important, publish_date, admin_name, admin_id } = notification;

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="relative pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="pr-8">{title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                            <span>{formatDate(publish_date.toISOString())}</span>
                            {admin_name && <span>• {admin_name}</span>}
                            {is_important && <span className="text-destructive font-medium">• 중요</span>}
                        </CardDescription>
                    </div>
                    <div className="px-2 py-1 text-xs rounded-full bg-muted">
                        {notification_type === "ANNOUNCEMENT" && "공지사항"}
                        {notification_type === "SYSTEM" && "시스템"}
                        {notification_type === "CAMPAIGN" && "캠페인"}
                        {notification_type === "proposal" && "제안"}
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">닫기</span>
                </button>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="prose max-w-none dark:prose-invert">
                    <p className="whitespace-pre-wrap">{content}</p>
                </div>
            </CardContent>
            <CardFooter className="border-t pt-4 text-sm text-muted-foreground">
                {notification.is_read === false && (
                    <Form method="post">
                        <input type="hidden" name="intent" value="mark-as-read" />
                        <input type="hidden" name="notificationId" value={notification_id} />
                        <input type="hidden" name="userId" value={admin_id} />
                        <button type="submit" className="text-primary underline text-xs">
                            읽음으로 표시
                        </button>
                    </Form>
                )}
            </CardFooter>
        </Card>
    );
} 