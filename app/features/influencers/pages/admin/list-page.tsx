import type { Database } from "database-generated.types";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import { Badge } from "~/common/components/ui/badge";
import { Button } from "~/common/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Input } from "~/common/components/ui/input";
import { Label } from "~/common/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/common/components/ui/select";
import { GENDER, GENDER_LABELS, INFLUENCER_CATEGORY, INFLUENCER_CATEGORY_LABELS, LOCATION, LOCATION_LABELS, SNS_TYPE, SNS_TYPE_LABELS } from "~/features/influencers/constants";
import { formatDate } from "~/lib/utils";
import { getServerClient } from "~/server";
import type { Route } from "./+types/list-page";

export async function loader({ request }: Route.LoaderArgs) {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

    // 사용자 프로필 정보 가져오기
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("profile_id", user.id)
        .single();

    // 관리자 권한 확인
    if (profile?.role !== "ADMIN") {
        throw new Error("관리자 권한이 필요합니다");
    }

    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);

    // 검색 필터 파라미터
    const category = searchParams.get("category") || "all";
    const platform = searchParams.get("platform") || "all";
    const location = searchParams.get("location") || "all";
    const gender = searchParams.get("gender") || "all";
    const minFollowers = parseInt(searchParams.get("minFollowers") || "0", 10);
    const searchTerm = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = 12;

    // 인플루언서 프로필 조회 쿼리 구성
    let query = supabase
        .from("influencer_profiles")
        .select(`
            *,
            profile:profiles (
                name,
                username
            )
        `);

    // 필터 적용
    if (category && category !== "all") {
        query = query.contains("categories", [category]);
    }

    if (location) {
        query = query.eq("location", location);
    }

    if (gender) {
        query = query.eq("gender", gender as NonNullable<"OTHER" | "MALE" | "FEMALE" | null>);
    }

    if (platform && platform !== "all") {
        // 플랫폼 필터링 (해당 플랫폼 핸들이 존재하는 경우)
        if (platform === SNS_TYPE.INSTAGRAM) {
            query = query.not("instagram_handle", "is", null);
        } else if (platform === SNS_TYPE.YOUTUBE) {
            query = query.not("youtube_handle", "is", null);
        } else if (platform === SNS_TYPE.TIKTOK) {
            query = query.not("tiktok_handle", "is", null);
        } else if (platform === SNS_TYPE.BLOG) {
            query = query.not("blog_url", "is", null);
        }
    }

    if (searchTerm) {
        // 이름 또는 사용자명으로 검색
        query = query.or(`profile.name.ilike.%${searchTerm}%,profile.username.ilike.%${searchTerm}%`);
    }

    // 페이지네이션 적용
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    // 데이터 조회
    const { data: influencers, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to)

    // 팔로워 수 필터링 (데이터베이스에서 필터링하기 어려운 경우 클라이언트에서 필터링)
    let filteredInfluencers = influencers || [];

    if (minFollowers > 0) {
        filteredInfluencers = filteredInfluencers.filter(influencer => {
            const followersCount = influencer.followers_count as Record<string, number>;
            const totalFollowers = Object.values(followersCount || {}).reduce((sum, count) => sum + (count || 0), 0);
            return totalFollowers >= minFollowers;
        });
    }

    return {
        influencers: filteredInfluencers,
        totalCount: count || 0,
        currentPage: page,
        totalPages: Math.ceil((count || 0) / perPage),
        filters: {
            category,
            platform,
            location,
            gender,
            minFollowers,
            search: searchTerm
        }
    };
}

export const meta: Route.MetaFunction = () => {
    return [
        { title: "인플루언서 관리 - 관리자 페이지" },
        { name: "description", content: "인플루언서 목록을 관리합니다" },
    ];
};

export default function ListPage({ loaderData }: Route.ComponentProps) {
    const { influencers, totalCount, currentPage, totalPages, filters } = loaderData || {};

    const [searchParams, setSearchParams] = useState({
        search: filters?.search || "",
        category: filters?.category || "all",
        platform: filters?.platform || "all",
        location: filters?.location || "",
        gender: filters?.gender || "all",
        minFollowers: filters?.minFollowers || 0,
        page: currentPage || 1
    });

    useEffect(() => {
        setSearchParams({
            search: filters?.search || "",
            category: filters?.category || "all",
            platform: filters?.platform || "all",
            location: filters?.location || "",
            gender: filters?.gender || "all",
            minFollowers: filters?.minFollowers || 0,
            page: currentPage || 1
        });
    }, [filters, currentPage]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchParams.search) params.set("search", searchParams.search);
        if (searchParams.category && searchParams.category !== "all") params.set("category", searchParams.category);
        if (searchParams.platform && searchParams.platform !== "all") params.set("platform", searchParams.platform);
        if (searchParams.location) params.set("location", searchParams.location);
        if (searchParams.gender) params.set("gender", searchParams.gender);
        if (searchParams.minFollowers > 0) params.set("minFollowers", searchParams.minFollowers.toString());
        params.set("page", "1");

        window.location.href = `${window.location.pathname}?${params.toString()}`;
    };

    const clearFilters = () => {
        setSearchParams({
            search: "",
            category: "all",
            platform: "all",
            location: "",
            gender: "all",
            minFollowers: 0,
            page: 1
        });

        window.location.href = window.location.pathname;
    };

    const getTotalFollowers = (influencer: Database["public"]["Tables"]["influencer_profiles"]["Row"]) => {
        const followersCount = influencer.followers_count as Record<string, number>;
        return Object.values(followersCount || {}).reduce((sum, count) => sum + (count || 0), 0);
    };

    const getPageUrl = (page: number) => {
        const params = new URLSearchParams();
        if (searchParams.search) params.set("search", searchParams.search);
        if (searchParams.category && searchParams.category !== "all") params.set("category", searchParams.category);
        if (searchParams.platform && searchParams.platform !== "all") params.set("platform", searchParams.platform);
        if (searchParams.location) params.set("location", searchParams.location);
        if (searchParams.gender) params.set("gender", searchParams.gender);
        if (searchParams.minFollowers && searchParams.minFollowers > 0) params.set("minFollowers", searchParams.minFollowers.toString());
        params.set("page", page.toString());
        return `/admin/influencers?${params.toString()}`;
    };

    if (!influencers) {
        return <div className="container py-8">데이터를 불러오는 중...</div>;
    }

    return (
        <div className="container py-8">
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>검색 필터</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="search">검색어</Label>
                            <div className="flex">
                                <Input
                                    id="search"
                                    placeholder="이름 또는 사용자명"
                                    value={searchParams.search}
                                    onChange={(e) => setSearchParams({ ...searchParams, search: e.target.value })}
                                    className="rounded-r-none"
                                />
                                <Button type="submit" className="rounded-l-none">검색</Button>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="category">카테고리</Label>
                            <Select
                                value={searchParams.category}
                                onValueChange={(value) => setSearchParams({ ...searchParams, category: value })}
                            >
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="모든 카테고리" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">모든 카테고리</SelectItem>
                                    {Object.entries(INFLUENCER_CATEGORY).map(([key, value]) => (
                                        <SelectItem key={key} value={value}>
                                            {INFLUENCER_CATEGORY_LABELS[value as keyof typeof INFLUENCER_CATEGORY_LABELS]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="platform">플랫폼</Label>
                            <Select
                                value={searchParams.platform}
                                onValueChange={(value) => setSearchParams({ ...searchParams, platform: value })}
                            >
                                <SelectTrigger id="platform">
                                    <SelectValue placeholder="모든 플랫폼" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">모든 플랫폼</SelectItem>
                                    {Object.entries(SNS_TYPE).map(([key, value]) => (
                                        <SelectItem key={key} value={value}>
                                            {SNS_TYPE_LABELS[value as keyof typeof SNS_TYPE_LABELS]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="location">지역</Label>
                            <Select
                                value={searchParams.location}
                                onValueChange={(value) => setSearchParams({ ...searchParams, location: value })}
                            >
                                <SelectTrigger id="location">
                                    <SelectValue placeholder="모든 지역" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">모든 지역</SelectItem>
                                    {Object.entries(LOCATION).map(([key, value]) => (
                                        <SelectItem key={key} value={value}>
                                            {LOCATION_LABELS[value as keyof typeof LOCATION_LABELS]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="gender">성별</Label>
                            <Select
                                value={searchParams.gender}
                                onValueChange={(value) => setSearchParams({ ...searchParams, gender: value })}
                            >
                                <SelectTrigger id="gender">
                                    <SelectValue placeholder="모든 성별" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">모든 성별</SelectItem>
                                    {Object.entries(GENDER).map(([key, value]) => (
                                        <SelectItem key={key} value={value}>
                                            {GENDER_LABELS[value as keyof typeof GENDER_LABELS]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="minFollowers">최소 팔로워 수</Label>
                            <Input
                                id="minFollowers"
                                type="number"
                                placeholder="0"
                                value={searchParams.minFollowers}
                                onChange={(e) => setSearchParams({ ...searchParams, minFollowers: parseInt(e.target.value) || 0 })}
                            />
                        </div>

                        <div className="md:col-span-3 flex justify-end">
                            <Button type="button" variant="outline" onClick={clearFilters} className="mr-2">
                                필터 초기화
                            </Button>
                            <Button type="submit">필터 적용</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="mb-4">
                <p className="text-gray-500">총 {totalCount}명의 인플루언서</p>
            </div>

            {influencers.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {influencers.map((influencer) => (
                            <Card key={influencer.profile_id} className="overflow-hidden">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={influencer.profile.username || ""} alt={influencer.profile.name} />
                                            <AvatarFallback>{influencer.profile.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-lg">{influencer.profile.name}</CardTitle>
                                            <p className="text-gray-500">@{influencer.profile.username}</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-gray-500">카테고리</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {influencer.categories.slice(0, 3).map((category: string) => (
                                                    <Badge key={category} variant="outline" className="text-xs">
                                                        {INFLUENCER_CATEGORY_LABELS[category as keyof typeof INFLUENCER_CATEGORY_LABELS]}
                                                    </Badge>
                                                ))}
                                                {influencer.categories.length > 3 && (
                                                    <Badge variant="outline" className="text-xs">+{influencer.categories.length - 3}</Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-500">플랫폼</p>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {influencer.instagram_handle && (
                                                    <Badge variant="secondary" className="text-xs">Instagram</Badge>
                                                )}
                                                {influencer.youtube_handle && (
                                                    <Badge variant="secondary" className="text-xs">YouTube</Badge>
                                                )}
                                                {influencer.tiktok_handle && (
                                                    <Badge variant="secondary" className="text-xs">TikTok</Badge>
                                                )}
                                                {influencer.blog_url && (
                                                    <Badge variant="secondary" className="text-xs">Blog</Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <p className="text-sm text-gray-500">총 팔로워</p>
                                                <p className="font-semibold">{getTotalFollowers(influencer).toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">가입일</p>
                                                <p className="font-semibold">{formatDate(influencer.created_at, 'YYYY-MM-DD')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button asChild className="w-full">
                                        <Link to={`/admin/influencers/${influencer.profile_id}`}>상세 정보</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2">
                            {currentPage > 1 && (
                                <Button variant="outline" asChild>
                                    <Link to={getPageUrl(currentPage - 1)}>이전</Link>
                                </Button>
                            )}

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    variant={page === currentPage ? "default" : "outline"}
                                    asChild
                                >
                                    <Link to={getPageUrl(page)}>{page}</Link>
                                </Button>
                            ))}

                            {currentPage < totalPages && (
                                <Button variant="outline" asChild>
                                    <Link to={getPageUrl(currentPage + 1)}>다음</Link>
                                </Button>
                            )}
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">검색 결과가 없습니다.</p>
                </div>
            )}
        </div>
    );
} 