import { Link, Outlet } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Separator } from "~/common/components/ui/separator";
import { cn } from "~/lib/utils";

interface LoaderData {
    currentPath: string;
}

export const loader = async ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    const currentPath = url.pathname;

    return {
        currentPath,
    };
};

const menuItems = [
    {
        to: "/influencer/my",
        label: "개요",
    },
    {
        to: "/influencer/my/stats",
        label: "통계",
    },
    {
        to: "/influencer/my/verifications",
        label: "계정 인증",
    },
    {
        to: "/influencer/my/settings",
        label: "설정",
    },
];

interface Props {
    loaderData: LoaderData;
}

export default function InfluencerProfileLayout({ loaderData }: Props) {
    const { currentPath } = loaderData;

    return (
        <div className="container py-10 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">인플루언서 프로필</h1>
                <p className="text-muted-foreground text-sm">인플루언서 프로필을 관리하세요</p>
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