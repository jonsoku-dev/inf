/**
 * 사용자의 온라인/오프라인 상태를 표시하는 컴포넌트
 *
 * @component OnlineStatus
 * @description 사용자의 현재 접속 상태를 시각적으로 표시하는 컴포넌트
 *
 * @param {Object} props
 * @param {boolean} props.isOnline - 사용자의 온라인 상태
 * @param {string} [props.className] - 추가적인 스타일링을 위한 클래스
 */

import { cn } from "~/lib/utils";

interface OnlineStatusProps {
  isOnline: boolean;
  className?: string;
}

export function OnlineStatus({ isOnline, className }: OnlineStatusProps) {
  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "border-background absolute right-0 bottom-0 size-2.5 rounded-full border-2",
          isOnline ? "bg-green-500" : "bg-gray-400"
        )}
      />
    </div>
  );
}
