import { Link, Outlet } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Separator } from "~/common/components/ui/separator";
import { cn } from "~/lib/utils";
import { ListIcon, PlusIcon, UserIcon, BriefcaseIcon, InboxIcon } from "lucide-react";
import type { Route } from "./+types/advertiser-layout";
import { Tabs, TabsList, TabsTrigger } from "~/common/components/ui/tabs";

export const loader = async ({ request }: Route.LoaderArgs) => {
    const url = new URL(request.url);
    const currentPath = url.pathname;

    return {
        currentPath,
    };
};

const menuItems = [
    {
        to: "/proposals/advertiser/list",
        label: "인플루언서 제안",
        icon: InboxIcon,
        description: "인플루언서가 제안한 협업 아이디어"
    },
    {
        to: "/proposals/advertiser/applications",
        label: "내 신청 목록",
        icon: ListIcon,
        description: "내가 신청한 인플루언서 제안"
    },
    {
        to: "/proposals/advertiser/direct",
        label: "내 직접 제안",
        icon: BriefcaseIcon,
        description: "내가 인플루언서에게 직접 제안한 협업"
    },
];

export default function AdvertiserLayout({ loaderData }: Route.ComponentProps) {
    const { currentPath } = loaderData;

    // 현재 활성화된 탭 결정 - 경로 패턴 매칭 개선
    const getActiveTab = () => {
        // 정확한 경로 매칭을 위해 패턴 정의
        if (currentPath.startsWith("/proposals/advertiser/applications")) {
            return "/proposals/advertiser/applications";
        } else if (currentPath.startsWith("/proposals/advertiser/direct")) {
            return "/proposals/advertiser/direct";
        } else if (currentPath === "/proposals/advertiser" || currentPath.startsWith("/proposals/advertiser/list")) {
            return "/proposals/advertiser/list";
        }

        // 기본값
        return menuItems[0].to;
    };

    const activeTab = getActiveTab();

    return (
        <div className="container max-w-5xl py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">인플루언서 제안 관리</h1>
                    <p className="text-muted-foreground mt-1">인플루언서가 제안한 협업 아이디어를 검토하고 관리하세요</p>
                </div>
            </div>

            <Tabs value={activeTab} className="w-full mb-6">
                <TabsList className="grid grid-cols-3 w-full">
                    {menuItems.map((item) => (
                        <TabsTrigger
                            key={item.to}
                            value={item.to}
                            className="flex items-center"
                            asChild
                        >
                            <Link to={item.to}>
                                <item.icon className="mr-2 h-4 w-4" />
                                {item.label}
                            </Link>
                        </TabsTrigger>
                    ))}
                </TabsList>
                <div className="mt-2 text-sm text-muted-foreground">
                    {menuItems.find(item => item.to === activeTab)?.description}
                </div>
            </Tabs>

            <Separator className="my-4" />

            <Outlet />
        </div>
    );
} 