import { Link, Outlet } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Separator } from "~/common/components/ui/separator";
import { cn } from "~/lib/utils";
import { ListIcon, PlusIcon } from "lucide-react";
import type { Route } from "./+types/advertiser-layout";

export const loader = async ({ request }: Route.LoaderArgs) => {
    const url = new URL(request.url);
    const currentPath = url.pathname;

    return {
        currentPath,
    };
};

const menuItems = [
    {
        to: "/proposals/advertiser/applications",
        label: "신청 목록",
        icon: ListIcon,
    },
];

export default function AdvertiserLayout({ loaderData }: Route.ComponentProps) {
    const { currentPath } = loaderData;

    return (
        <div className="container max-w-5xl py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">인플루언서 제안 관리</h1>
                    <p className="text-muted-foreground mt-1">인플루언서 제안을 관리하세요</p>
                </div>
            </div>

            <Separator className="my-4" />

            <Outlet />
        </div>
    );
} 