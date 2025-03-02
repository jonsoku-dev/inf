import { useState } from "react";
import { Dialog, DialogContent } from "~/common/components/ui/dialog";
import type { Notification } from "../types";
import { NotificationCard } from "./notification-card";
import { NotificationDetail } from "./notification-detail";

interface NotificationListProps {
    notifications: Notification[];
}

export function NotificationList({ notifications }: NotificationListProps) {
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

    return (
        <div>
            {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    표시할 공지사항이 없습니다.
                </div>
            ) : (
                notifications.map((notification) => (
                    <NotificationCard
                        key={notification.notification_id}
                        notification={notification}
                        onClick={() => setSelectedNotification(notification)}
                    />
                ))
            )}

            <Dialog open={!!selectedNotification} onOpenChange={(open) => !open && setSelectedNotification(null)}>
                <DialogContent className="sm:max-w-3xl p-0">
                    {selectedNotification && (
                        <NotificationDetail
                            notification={selectedNotification}
                            onClose={() => setSelectedNotification(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
} 