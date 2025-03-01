import { getServerClient } from "~/server";
import { InfluencerProfileForm } from "../../components/influencer-profile-form";
import type { Route } from "./+types/edit-page";
import type { Database } from "database-generated.types";

export const loader = async ({ request }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

    const { data: profile } = await supabase
        .from("influencer_profiles")
        .select("*")
        .eq("profile_id", user.id)
        .single();

    return { profile };
};

export const action = async ({ request }: Route.ActionArgs) => {
    const { supabase } = getServerClient(request);
    const formData = await request.formData();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

    // 카테고리 타입 안전하게 처리
    const categories = formData.getAll("categories").map(
        category => category as Database["public"]["Enums"]["influencer_category"]
    );

    // birth_year 안전하게 처리
    const birthYearValue = formData.get("birth_year");
    const birthYear = birthYearValue ? parseInt(birthYearValue as string) : null;

    const data = {
        profile_id: user.id,
        introduction: formData.get("introduction") as string | null,
        categories,
        gender: formData.get("gender") as Database["public"]["Enums"]["gender"] | null,
        birth_year: birthYear,
        location: formData.get("location") as string | null,
        is_public: formData.get("is_public") === "on",
        followers_count: {}, // 필수 필드 추가
    };

    const { error } = await supabase
        .from("influencer_profiles")
        .upsert(data);

    if (error) throw error;

    return { success: true };
};

export default function EditPage({ loaderData }: Route.ComponentProps) {
    const { profile } = loaderData;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold tracking-tight">프로필 {profile ? "수정" : "생성"}</h2>
                <p className="text-muted-foreground text-sm">프로필 정보를 {profile ? "수정" : "입력"}하세요</p>
            </div>

            <InfluencerProfileForm defaultValues={profile || undefined} />
        </div>
    );
} 