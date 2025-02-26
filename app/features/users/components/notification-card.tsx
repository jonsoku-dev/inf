/**
 * @description 알림 카드 컴포넌트
 * @component NotificationCard
 * @param {NotificationCardProps} props
 * @param {string} props.id - 알림 ID
 * @param {string} props.avatarUrl - 사용자 아바타 URL
 * @param {string} props.username - 사용자 이름
 * @param {string} props.message - 알림 메시지
 * @param {string} props.createdAt - 알림 생성 시간
 * @param {boolean} props.seen - 읽음 상태
 * @param {(seen: boolean) => Promise<void> | void} props.onSeenChange - 읽음 상태 변경 핸들러 (비동기 가능)
 */

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import { Card, CardFooter, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Button } from "~/common/components/ui/button";
import { EyeIcon, Loader2Icon } from "lucide-react";
import { cn } from "~/lib/utils";
import { useControlledState } from "~/common/hooks/use-controlled-state";

interface NotificationCardProps {
  id: string;
  avatarUrl: string;
  username: string;
  message: string;
  createdAt: string;
  seen?: boolean;
  onSeenChange?: (seen: boolean) => Promise<void> | void;
}

export function NotificationCard({
  id,
  avatarUrl,
  username,
  message,
  createdAt,
  seen: seenProp = false,
  onSeenChange,
}: NotificationCardProps) {
  const [seen, setSeen] = useControlledState(seenProp, onSeenChange);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSeen = async () => {
    try {
      setIsUpdating(true);
      await setSeen(true);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card
      id={id}
      className={cn("min-w-[450px] transition-colors", !seen && "bg-muted/40 hover:bg-muted/50")}
    >
      <CardHeader className="flex flex-row items-center gap-5">
        <Avatar>
          <AvatarImage src={avatarUrl} alt={username} />
          <AvatarFallback>{username[0]}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-lg font-bold">
            <span>{username}</span>
            <span>{message}</span>
          </CardTitle>
          <small className="text-muted-foreground text-sm">{createdAt}</small>
        </div>
      </CardHeader>
      <CardFooter className="flex justify-end">
        <Button variant="outline" size="icon" onClick={handleSeen} disabled={seen || isUpdating}>
          {isUpdating ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <EyeIcon className="size-4" />
          )}
          <span className="sr-only">{isUpdating ? "처리 중..." : "읽음 표시"}</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
