import { Link } from "react-router";
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
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";
import {
  DropdownMenuItem,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  BarChart3Icon,
  BellIcon,
  LogOutIcon,
  MessageCircleIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";
// import { useSupabaseAuth } from "~/hooks/use-supabase";
const menus = [
  {
    name: "캠페인",
    to: "/campaigns",
    items: [
      {
        name: "모든 캠페인",
        description: "진행중인 모든 캠페인을 확인하세요",
        to: "/campaigns",
      },
      {
        name: "내 캠페인",
        description: "내가 등록한 캠페인을 관리하세요",
        to: "/my/campaigns",
      },
      {
        name: "지원 현황",
        description: "내가 지원한 캠페인을 확인하세요",
        to: "/my/applications",
      },
      {
        name: "새 캠페인",
        description: "새로운 캠페인을 등록하세요",
        to: "/my/campaigns/new",
      },
    ],
  },
  {
    name: "대시보드",
    to: "/my/dashboard",
    items: [
      {
        name: "개요",
        description: "전체 현황을 한눈에 확인하세요",
        to: "/my/dashboard",
      },
      {
        name: "아이디어",
        description: "내 아이디어를 관리하세요",
        to: "/my/dashboard/ideas",
      },
      {
        name: "제품 분석",
        description: "제품 성과를 분석하세요",
        to: "/my/dashboard/products/1",
      },
    ],
  },
  {
    name: "메시지",
    to: "/my/messages",
    items: [
      {
        name: "받은 메시지",
        description: "받은 메시지를 확인하세요",
        to: "/my/messages",
      },
      {
        name: "알림",
        description: "알림을 확인하세요",
        to: "/my/notifications",
      },
    ],
  },
];

interface NavigationProps {
  isLoggedIn: boolean;
  hasNotifications: boolean;
  hasMessages: boolean;
}

const userMenuItems = [
  {
    icon: BarChart3Icon,
    label: "대시보드",
    to: "/my/dashboard",
  },
  {
    icon: UserIcon,
    label: "프로필",
    to: "/my/profile",
  },
  {
    icon: SettingsIcon,
    label: "설정",
    to: "/my/settings",
  },
  {
    icon: BellIcon,
    label: "알림",
    to: "/my/notifications",
  },
  {
    icon: MessageCircleIcon,
    label: "메시지",
    to: "/my/messages",
  },
  {
    icon: LogOutIcon,
    label: "로그아웃",
    to: "/auth/logout",
  },
];

export function Navigation({ isLoggedIn, hasNotifications, hasMessages }: NavigationProps) {
  // const { user, isLoading } = useSupabaseAuth()
  return (
    <nav className="bg-background/50 fixed top-0 right-0 left-0 z-50 flex h-16 items-center justify-between px-20 backdrop-blur-sm">
      <div className="flex items-center">
        <Link to="/" className="text-lg font-bold tracking-tighter">
          Inf
        </Link>
        <Separator className="mx-4 h-6" orientation="vertical" />
        <NavigationMenu>
          <NavigationMenuList>
            {menus.map((menu) => (
              <NavigationMenuItem key={menu.name} className="">
                {menu.items ? (
                  <>
                    <Link to={menu.to} prefetch="intent">
                      <NavigationMenuTrigger>{menu.name}</NavigationMenuTrigger>
                    </Link>
                    <NavigationMenuContent>
                      <ul className="grid w-[500px] grid-cols-2 gap-3 p-4 font-light">
                        {menu.items?.map((item) => (
                          <NavigationMenuItem
                            key={item.name}
                            className={cn(
                              "focus:bg-accent hover:bg-accent rounded-md transition-colors select-none",
                              item.to === "/products/promote" &&
                              "bg-primary/10 hover:bg-primary/20 focus:bg-primary/20 col-span-2",
                              item.to === "/jobs/submit" &&
                              "bg-primary/10 hover:bg-primary/20 focus:bg-primary/20 col-span-2"
                            )}
                          >
                            <NavigationMenuLink asChild key={item.name}>
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
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      {isLoggedIn ? (
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" asChild className="relative">
            <Link to="/my/notifications">
              <BellIcon className="size-4" />
              {hasNotifications && (
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500" />
              )}
            </Link>
          </Button>

          <Button size="icon" variant="ghost" asChild className="relative">
            <Link to="/my/messages">
              <MessageCircleIcon className="size-4" />
              {hasMessages && (
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500" />
              )}
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar>
                <AvatarImage src="https://avatars.githubusercontent.com/u/51524954?s=96&v=4" />
                <AvatarFallback>
                  <span className="text-xs">R</span>
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel className="flex flex-col">
                <span className="font-medium">John Doe</span>
                <span className="text-muted-foreground text-xs">@username</span>
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
            <Link to="/auth/login">Login</Link>
          </Button>
          <Button asChild>
            <Link to="/auth/join">Join</Link>
          </Button>
        </div>
      )}
    </nav>
  );
}
