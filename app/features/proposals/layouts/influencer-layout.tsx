import { Link, Outlet } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Separator } from "~/common/components/ui/separator";
import { cn } from "~/lib/utils";
import { PlusCircle, ListIcon } from "lucide-react";
import type { Route } from "./+types/influencer-layout";
export const loader = async ({ request }: Route.LoaderArgs) => {
    const url = new URL(request.url);
    const currentPath = url.pathname;

    return {
        currentPath,
    };
};

const menuItems = [
    {
        to: "/proposals/influencer",
        label: "제안 목록",
        icon: ListIcon,
    },
    {
        to: "/proposals/influencer/new",
        label: "새 제안",
        icon: PlusCircle,
    },
];

export default function InfluencerLayout({ loaderData }: Route.ComponentProps) {
    const { currentPath } = loaderData;

    return (
        <div className="container py-10 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">제안 관리</h1>
                <p className="text-muted-foreground text-sm">제안을 관리하세요</p>
            </div>

            <div className="space-y-4">
                <nav className="flex items-center space-x-4">
                    {menuItems.map((item) => (
                        <Button
                            key={item.to}
                            variant="ghost"
                            asChild
                            className={cn(
                                "px-4",
                                currentPath === item.to && "bg-muted"
                            )}
                        >
                            <Link to={item.to}>
                                <item.icon className="w-4 h-4 mr-2" />
                                {item.label}
                            </Link>
                        </Button>
                    ))}
                </nav>
                <Separator />
            </div>

            <Outlet />
        </div>
    );
} 