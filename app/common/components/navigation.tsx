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
  LogOutIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";
import { useSupabaseAuth } from "~/hooks/use-supabase";

const commonMenus = [
  {
    name: "캠페인",
    to: "/campaigns",
    items: [
      {
        name: "모든 캠페인",
        description: "진행중인 모든 캠페인을 확인하세요",
        to: "/campaigns",
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
    ],
  },
];

const influencerMenus = [
  {
    name: "인플루언서 메뉴",
    to: "/campaigns/influencer",
    items: [
      {
        name: "내 지원 현황",
        description: "지원한 캠페인을 확인하세요",
        to: "/campaigns/influencer",
      },
    ],
  },
];

interface NavigationProps {
  isLoggedIn: boolean;
}

const userMenuItems = [
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
    icon: LogOutIcon,
    label: "로그아웃",
    to: "/auth/logout",
  },
];

export function Navigation({ }: NavigationProps) {
  const { user, isLoggedIn } = useSupabaseAuth();
  const isAdvertiser = user?.role === "ADVERTISER";
  const isInfluencer = user?.role === "INFLUENCER";

  const renderMenuItems = (menu: typeof commonMenus[0]) => (
    <NavigationMenuItem key={menu.name}>
      {menu.items ? (
        <>
          <Link to={menu.to} prefetch="intent">
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
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {isLoggedIn ? (
        <div className="flex items-center gap-2">
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
