/**
 * 메시지 사이드바에 표시되는 사용자 아이템 컴포넌트
 *
 * @component MessageUserItem
 * @description 사용자의 아바타, 이름, 마지막 접속 시간을 표시하는 사이드바 메뉴 아이템
 *
 * @param {Object} props
 * @param {string} props.avatarUrl - 사용자의 아바타 이미지 URL
 * @param {string} props.fallback - 아바타 이미지가 없을 때 표시될 텍스트
 * @param {string} props.name - 사용자 이름
 * @param {string} props.lastSeen - 마지막 접속 시간 텍스트
 * @param {boolean} props.isOnline - 사용자의 온라인 상태
 * @param {React.ReactNode} props.children - 추가적인 자식 요소
 */

import { Link, useLocation } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import { SidebarMenuItem, SidebarMenuButton } from "~/common/components/ui/sidebar";
import { OnlineStatus } from "./online-status";

interface MessageUserItemProps {
  id: string;
  avatarUrl: string;
  fallback: string;
  name: string;
  lastSeen: string;
  isOnline?: boolean;
  children?: React.ReactNode;
}

export function MessageUserItem({
  id,
  avatarUrl,
  fallback,
  name,
  lastSeen,
  isOnline = false,
  children,
}: MessageUserItemProps) {
  const location = useLocation();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className="h-18"
        asChild
        isActive={location.pathname === `/my/messages/${id}`}
      >
        <Link to={`/my/messages/${id}`}>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Avatar>
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>{fallback}</AvatarFallback>
              </Avatar>
              <OnlineStatus isOnline={isOnline} className="absolute -right-0.5 -bottom-0.5" />
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-medium">{name}</p>
              <p className="text-muted-foreground text-xs">{lastSeen}</p>
            </div>
            {children}
          </div>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
