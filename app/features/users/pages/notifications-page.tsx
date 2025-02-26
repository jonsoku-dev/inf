/**
 * @description 사용자 알림 페이지
 * @route /my/notifications
 */

import type { Route } from "./+types/notifications-page";
import { NotificationCard } from "../components/notification-card";

interface Notification {
  id: string;
  avatarUrl: string;
  username: string;
  message: string;
  createdAt: string;
  seen: boolean;
}

export const loader = ({ request }: Route.LoaderArgs) => {
  // 실제 구현에서는 서버에서 알림 데이터를 가져옵니다
  return {
    notifications: [
      {
        id: "1",
        avatarUrl: "https://github.com/shadcn.png",
        username: "John Doe",
        message: " followed you.",
        createdAt: "2 days ago",
        seen: false,
      },
    ] as Notification[],
  };
};

export const meta: Route.MetaFunction = () => {
  return [{ title: "알림 | Inf" }, { name: "description", content: "알림을 확인하세요." }];
};

export default function NotificationsPage({ loaderData }: Route.ComponentProps) {
  const notifications = loaderData?.notifications ?? [];

  return (
    <div className="space-y-20">
      <h1 className="text-4xl font-bold">알림</h1>
      <div className="flex flex-col items-start gap-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <NotificationCard
            key={index}
            id={index.toString()}
            avatarUrl="https://github.com/shadcn.png"
            username="John Doe"
            message=" followed you."
            createdAt="2 days ago"
            seen={false}
          />
        ))}
        {notifications.length === 0 && (
          <p className="text-muted-foreground">새로운 알림이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
