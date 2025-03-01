import { getServerClient } from "~/server";
import { InfluencerProfileView } from "../../components/influencer-profile-view";
import { Button } from "~/common/components/ui/button";
import { Link } from "react-router";
import { PlusCircle } from "lucide-react";

export const loader = async ({ request }) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

    const { data: profile } = await supabase
        .from("influencer_profiles")
        .select(`
            *,
            profile:profiles (
                name,
                username,
                avatar_url
            ),
            verifications:influencer_verifications (
                platform,
                followers_count,
                engagement_rate,
                is_valid,
                verified_at
            ),
            stats:influencer_stats (
                platform,
                followers_count,
                engagement_rate,
                avg_likes,
                avg_comments,
                avg_views,
                recorded_at
            )
        `)
        .eq("profile_id", user.id)
        .single();

    return { profile };
};

export default function OverviewPage({ loaderData }) {
    const { profile } = loaderData;

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-12">
                <p className="text-lg text-muted-foreground">인플루언서 프로필이 없습니다</p>
                <Button asChild>
                    <Link to="/influencer/my/edit">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        프로필 생성하기
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">프로필 개요</h2>
                    <p className="text-muted-foreground text-sm">프로필 정보를 확인하세요</p>
                </div>
                <Button variant="outline" asChild>
                    <Link to="/influencer/my/edit">프로필 수정</Link>
                </Button>
            </div>

            <InfluencerProfileView profile={profile} />
        </div>
    );
} 