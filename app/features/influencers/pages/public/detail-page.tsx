import type { Route } from "./+types/detail-page";
import { getServerClient } from "~/server";
import { InfluencerProfileView } from "../../components/influencer-profile-view";
import { Button } from "~/common/components/ui/button";
import { Link } from "react-router";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);

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
        .eq("profile_id", params.influencerId)
        .eq("is_public", true)
        .single();

    if (!profile) {
        throw new Error("인플루언서를 찾을 수 없습니다");
    }

    return { profile };
};

export default function DetailPage({ loaderData }: Route.ComponentProps) {
    const { profile } = loaderData;

    return (
        <div className="container py-10 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">인플루언서 프로필</h1>
                    <p className="text-muted-foreground text-sm">인플루언서의 상세 정보를 확인하세요</p>
                </div>
                <Button variant="outline" asChild>
                    <Link to="/influencer/public">목록으로</Link>
                </Button>
            </div>

            <InfluencerProfileView profile={profile} />
        </div>
    );
} 