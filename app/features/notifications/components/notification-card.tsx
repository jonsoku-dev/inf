import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/common/components/ui/card";
import { formatDate } from "~/common/utils/date";
import type { Notification } from "../types";

interface NotificationCardProps {
    notification: Notification;
    onClick?: () => void;
}

export function NotificationCard({ notification, onClick }: NotificationCardProps) {
    const { title, content, notification_type, is_important, publish_date, admin_name } = notification;

    return (
        <Card
            className={`mb-4 cursor-pointer hover:bg-accent/50 transition-colors ${is_important ? 'border-destructive' : ''}`}
            onClick={onClick}
        >
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{title}</CardTitle>
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
            </CardHeader>
            <CardContent className="pb-2">
                <p className="line-clamp-2 text-sm">{content}</p>
            </CardContent>
            <CardFooter className="pt-0 text-xs text-muted-foreground">
                {notification.is_read !== undefined && (
                    <span>{notification.is_read ? "읽음" : "읽지 않음"}</span>
                )}
            </CardFooter>
        </Card>
    );
} 