import { Link, Outlet } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Separator } from "~/common/components/ui/separator";
import { cn } from "~/lib/utils";
import { getServerClient } from "~/server";
import { PlusCircle } from "lucide-react";

interface LoaderData {
    currentPath: string;
    profile: any | null;
}

export const loader = async ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    const currentPath = url.pathname;

    // 사용자 인증 확인
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

    // 인플루언서 프로필 확인
    const { data: profile } = await supabase
        .from("influencer_profiles")
        .select("*")
        .eq("profile_id", user.id)
        .single();

    return {
        currentPath,
        profile,
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
    {
        to: "/influencer/my/edit",
        label: "프로필 편집",
    },
];

interface Props {
    loaderData: LoaderData;
}

export default function InfluencerProfileLayout({ loaderData }: Props) {
    const { currentPath, profile } = loaderData;

    // 프로필 편집 페이지는 프로필이 없어도 접근 가능해야 함
    const isEditPage = currentPath === "/influencer/my/edit";

    // 프로필이 있거나 편집 페이지인 경우 정상적으로 표시
    if (profile || isEditPage) {
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
                                // 프로필이 없는 경우 편집 페이지만 활성화
                                disabled={!profile && item.to !== "/influencer/my/edit"}
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

    // 프로필이 없고 편집 페이지가 아닌 경우 프로필 생성 안내
    return (
        <div className="container py-10 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">인플루언서 프로필</h1>
                <p className="text-muted-foreground text-sm">인플루언서 프로필을 관리하세요</p>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 py-12">
                <p className="text-lg text-muted-foreground">인플루언서 프로필이 없습니다</p>
                <Button asChild>
                    <Link to="/influencer/my/edit">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        프로필 생성하기
                    </Link>
                </Button>
            </div>
        </div>
    );
} 