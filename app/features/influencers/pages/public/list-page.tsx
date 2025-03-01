import type { Route } from "./+types/list-page";
import { getServerClient } from "~/server";
import { InfluencerCard } from "../../components/influencer-card";
import { INFLUENCER_CATEGORY_LABELS } from "../../constants";
import { Badge } from "~/common/components/ui/badge";
import { Link } from "react-router";
import type { InfluencerProfile } from "../../types";

export const loader = async ({ request }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const url = new URL(request.url);
    const category = url.searchParams.get("category");

    let query = supabase
        .from("influencer_profiles")
        .select(`
            *,
            profile:profiles (
                name,
                username
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
        .eq("is_public", true);

    if (category) {
        query = query.contains("categories", [category]);
    }

    const { data: influencers, error } = await query.order("created_at", { ascending: false });
    console.log({ influencers, error });
    return {
        influencers: influencers || [],
        category,
    };
};

export default function ListPage({ loaderData }: Route.ComponentProps) {
    const { influencers, category } = loaderData;

    console.log("렌더링 중인 인플루언서 목록:", influencers);

    return (
        <div className="container py-10 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">인플루언서</h1>
                <p className="text-muted-foreground text-sm">등록된 인플루언서들을 확인하세요</p>
            </div>

            <div className="flex flex-wrap gap-2">
                <Badge
                    key="all"
                    variant={!category ? "default" : "outline"}
                    className="cursor-pointer"
                >
                    <Link to="/influencer/public">
                        전체
                    </Link>
                </Badge>
                {Object.entries(INFLUENCER_CATEGORY_LABELS).map(([value, label]) => (
                    <Badge
                        key={value}
                        variant={category === value ? "default" : "outline"}
                        className="cursor-pointer"
                    >
                        <Link to={category === value ? "/influencer/public" : `/influencer/public?category=${value}`}>
                            {label}
                        </Link>
                    </Badge>
                ))}
            </div>

            {influencers.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">등록된 인플루언서가 없습니다.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {influencers.map((influencer) => (
                        <div key={influencer.profile_id}>
                            <Link to={`/influencer/public/${influencer.profile_id}`}>
                                <InfluencerCard influencer={influencer as unknown as InfluencerProfile} />
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 