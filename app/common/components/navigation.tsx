import type { Database } from "database.types";
import {
  BellIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";
import { Link } from "react-router";
import { AlertIndicator } from "~/features/alerts/components/alert-indicator";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu";
import { Separator } from "./ui/separator";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const commonMenus = [
  {
    name: "공지사항",
    to: "/notifications",
    items: [
      {
        name: "공지사항",
        description: "중요 공지사항 및 알림을 확인하세요",
        to: "/notifications",
      },
    ],
  },
];

const advertiserMenus = [
  {
    name: "광고주 메뉴",
    to: "/campaigns/advertiser",
    items: [
      {
        name: "내 캠페인",
        description: "등록한 캠페인을 관리하세요",
        to: "/campaigns/advertiser",
      },
      {
        name: "새 캠페인",
        description: "새로운 캠페인을 등록하세요",
        to: "/campaigns/advertiser/new",
      },
      {
        name: "제안 목록",
        description: "인플루언서 제안을 확인하세요",
        to: "/proposals/advertiser",
      },
      {
        name: "제안 신청 관리",
        description: "인플루언서들의 제안 신청을 관리하세요",
        to: "/proposals/advertiser/applications",
      },
    ],
  },
];

const influencerMenus = [
  {
    name: "인플루언서 메뉴",
    to: "/campaigns/influencer",
    items: [
      {
        name: "캠페인 지원 현황",
        description: "지원한 캠페인을 확인하세요",
        to: "/campaigns/influencer",
      },
      {
        name: "내 제안 관리",
        description: "등록한 제안을 관리하세요",
        to: "/proposals/influencer",
      },
      {
        name: "새 제안 등록",
        description: "새로운 제안을 등록하세요",
        to: "/proposals/influencer/new",
      },
      {
        name: "프로필 관리",
        description: "인플루언서 프로필을 관리하세요",
        to: "/influencer/my",
      },
    ],
  },
];

const adminMenus = [
  {
    name: "관리자 메뉴",
    to: "/admin",
    items: [
      {
        name: "공지사항 관리",
        description: "공지사항을 관리하세요",
        to: "/admin/notifications",
      },
    ],
  },
  {
    name: "인플루언서",
    to: "/influencer/public",
    items: [
      {
        name: "인플루언서 목록",
        description: "등록된 인플루언서들을 확인하세요",
        to: "/influencer/public",
      },
    ],
  },
];

const userMenuItems = [
  {
    icon: UserIcon,
    label: "프로필",
    to: "/influencer/my",
  },
  {
    icon: BellIcon,
    label: "공지사항",
    to: "/notifications",
  },
  {
    icon: SettingsIcon,
    label: "설정",
    to: "/influencer/my/settings",
  },
  {
    icon: LogOutIcon,
    label: "로그아웃",
    to: "/auth/logout",
  },
];

export default function Navigation({ unreadAlertCount, profile }: { unreadAlertCount: number, profile: Profile | null }) {
  const user = profile;
  const isLoggedIn = !!user;
  const isAdvertiser = user?.role === "ADVERTISER";
  const isInfluencer = user?.role === "INFLUENCER";
  const isAdmin = user?.role === "ADMIN";

  const renderMenuItems = (menu: typeof commonMenus[0]) => (
    <NavigationMenuItem key={menu.name}>
      {menu.items ? (
        <>
          <Link to={menu.to} prefetch="none">
            <NavigationMenuTrigger>{menu.name}</NavigationMenuTrigger>
          </Link>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 font-light">
              {menu.items.map((item) => (
                <NavigationMenuItem
                  key={item.name}
                  className="focus:bg-accent hover:bg-accent rounded-md transition-colors select-none"
                >
                  <NavigationMenuLink asChild>
                    <Link
                      className="block space-y-1 p-3 leading-none no-underline outline-none"
                      to={item.to}
                    >
                      <span className="text-sm leading-none font-medium">
                        {item.name}
                      </span>
                      <p className="leading-sung text-muted-foreground text-sm">
                        {item.description}
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </>
      ) : (
        <Link className={navigationMenuTriggerStyle()} to={menu.to}>
          {menu.name}
        </Link>
      )}
    </NavigationMenuItem>
  );

  return (
    <nav className="bg-background/50 fixed top-0 right-0 left-0 z-50 flex h-16 items-center justify-between px-20 backdrop-blur-sm">
      <div className="flex items-center">
        <Link to="/" className="text-lg font-bold tracking-tighter">
          Inf
        </Link>
        <Separator className="mx-4 h-6" orientation="vertical" />
        <NavigationMenu>
          <NavigationMenuList>
            {commonMenus.map(renderMenuItems)}
            {isLoggedIn && isAdvertiser && advertiserMenus.map(renderMenuItems)}
            {isLoggedIn && isInfluencer && influencerMenus.map(renderMenuItems)}
            {isLoggedIn && isAdmin && adminMenus.map(renderMenuItems)}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {isLoggedIn ? (
        <div className="flex items-center gap-2">
          <AlertIndicator unreadCount={unreadAlertCount} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar>
                <AvatarImage src={user?.profile_id} />
                <AvatarFallback>
                  <span className="text-xs">{user?.name?.[0]}</span>
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel className="flex flex-col">
                <span className="font-medium">{user?.name}</span>
                <span className="text-muted-foreground text-xs">@{user?.username}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {userMenuItems.map((item) => (
                  <DropdownMenuItem key={item.to} asChild className="cursor-pointer">
                    <Link to={item.to}>
                      <item.icon className="mr-2 size-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Button asChild variant="outline">
            <Link to="/auth/login">로그인</Link>
          </Button>
          <Button asChild>
            <Link to="/auth/join">회원가입</Link>
          </Button>
        </div>
      )}
    </nav>
  );
}
