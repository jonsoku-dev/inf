import { getServerClient } from "~/server";
import { Form } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Label } from "~/common/components/ui/label";
import { Switch } from "~/common/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";

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

    const { error } = await supabase
        .from("influencer_profiles")
        .update({
            instagram_handle: formData.get("instagram_handle"),
            youtube_handle: formData.get("youtube_handle"),
            tiktok_handle: formData.get("tiktok_handle"),
            blog_url: formData.get("blog_url"),
            is_public: formData.get("is_public") === "on",
        })
        .eq("profile_id", user.id);

    if (error) throw error;

    return { success: true };
};

export default function SettingsPage({ loaderData }) {
    const { profile } = loaderData;

    return (
        <div className="space-y-6">
            <Form method="post" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>SNS 계정 설정</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="instagram_handle">Instagram 계정</Label>
                            <Input
                                id="instagram_handle"
                                name="instagram_handle"
                                placeholder="@username"
                                defaultValue={profile?.instagram_handle}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="youtube_handle">YouTube 채널</Label>
                            <Input
                                id="youtube_handle"
                                name="youtube_handle"
                                placeholder="@channel"
                                defaultValue={profile?.youtube_handle}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tiktok_handle">TikTok 계정</Label>
                            <Input
                                id="tiktok_handle"
                                name="tiktok_handle"
                                placeholder="@username"
                                defaultValue={profile?.tiktok_handle}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="blog_url">블로그 URL</Label>
                            <Input
                                id="blog_url"
                                name="blog_url"
                                type="url"
                                placeholder="https://..."
                                defaultValue={profile?.blog_url}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>프로필 설정</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="is_public"
                                name="is_public"
                                defaultChecked={profile?.is_public}
                            />
                            <Label htmlFor="is_public">프로필 공개</Label>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit">저장</Button>
                </div>
            </Form>
        </div>
    );
} 