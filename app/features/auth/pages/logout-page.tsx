import { redirect } from "react-router";
import { getServerClient } from "~/server";
import type { Route } from "./+types/logout-page";

export const loader = async ({ request }: Route.LoaderArgs) => {
    const supabase = getServerClient(request)
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("로그아웃 중 오류가 발생했습니다:", error.message);
    }

    // 로그아웃 후 홈페이지로 리다이렉트
    return redirect("/");
};

// 이 컴포넌트는 실제로 렌더링되지 않습니다 (리다이렉트 되기 때문)
export default function LogoutPage() {
    return null;
} 