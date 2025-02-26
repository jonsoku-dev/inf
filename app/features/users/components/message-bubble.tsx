/**
 * 메시지 버블 컴포넌트
 *
 * @component MessageBubble
 * @description 채팅 메시지를 표시하는 버블 컴포넌트. 발신자와 수신자의 메시지를 구분하여 표시
 *
 * @param {Object} props
 * @param {string} props.message - 메시지 내용
 * @param {string} props.avatarUrl - 사용자의 아바타 이미지 URL
 * @param {string} props.fallback - 아바타 이미지가 없을 때 표시될 텍스트
 * @param {boolean} props.isSender - 현재 사용자가 발신자인지 여부
 * @param {string} [props.timestamp] - 메시지 전송 시간
 */

import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import { cn } from "~/lib/utils";

interface MessageBubbleProps {
  message: string;
  avatarUrl: string;
  fallback: string;
  isSender: boolean;
  timestamp?: string;
}

export function MessageBubble({
  message,
  avatarUrl,
  fallback,
  isSender,
  timestamp,
}: MessageBubbleProps) {
  return (
    <div
      className={cn("flex items-end gap-4", {
        "flex-row-reverse": isSender,
      })}
    >
      <Avatar className="size-14 shrink-0">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      <div
        className={cn("flex max-w-[40%] flex-col gap-1", {
          "items-end": isSender,
        })}
      >
        <div
          className={cn("bg-accent rounded-md p-4 text-sm", {
            "bg-accent rounded-br-none": isSender,
            "bg-primary text-primary-foreground rounded-bl-none": !isSender,
          })}
        >
          <p>{message}</p>
        </div>
        {timestamp && <span className="text-muted-foreground text-xs">{timestamp}</span>}
      </div>
    </div>
  );
}
