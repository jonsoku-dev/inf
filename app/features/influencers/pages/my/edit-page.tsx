import { getServerClient } from "~/server";
import { InfluencerProfileForm } from "../../components/influencer-profile-form";

export const loader = async ({ request }) => {
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

export const action = async ({ request }) => {
    const { supabase } = getServerClient(request);
    const formData = await request.formData();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

    const data = {
        profile_id: user.id,
        introduction: formData.get("introduction"),
        categories: formData.getAll("categories"),
        gender: formData.get("gender"),
        birth_year: parseInt(formData.get("birth_year")),
        location: formData.get("location"),
        is_public: formData.get("is_public") === "on",
    };

    const { error } = await supabase
        .from("influencer_profiles")
        .upsert(data);

    if (error) throw error;

    return { success: true };
};

export default function EditPage({ loaderData }) {
    const { profile } = loaderData;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold tracking-tight">프로필 {profile ? "수정" : "생성"}</h2>
                <p className="text-muted-foreground text-sm">프로필 정보를 {profile ? "수정" : "입력"}하세요</p>
            </div>

            <InfluencerProfileForm defaultValues={profile} />
        </div>
    );
} 