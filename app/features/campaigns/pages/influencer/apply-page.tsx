import { Form, redirect } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Textarea } from "~/common/components/ui/textarea";
import { getServerClient } from "~/server";
import type { Route } from "./+types/apply-page";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/auth/login");
    }

    const { data: campaign } = await supabase
        .from("campaigns")
        .select(`
            campaign_id,
            title,
            description,
            budget,
            campaign_status,
            target_market,
            advertiser:profiles!advertiser_id (
                name,
                username
            )
        `)
        .eq("campaign_id", params.campaignId)
        .single();

    return {
        campaign,
    };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/auth/login");
    }

    const formData = await request.formData();
    const message = formData.get("message") as string;

    const { error } = await supabase
        .from("applications")
        .insert({
            campaign_id: params.campaignId,
            influencer_id: user.id,
            message,
            application_status: "PENDING",
        });

    if (error) {
        return {
            ok: false,
            error: "지원서 제출 중 오류가 발생했습니다.",
        };
    }

    return redirect(`/campaigns/influencer/${params.campaignId}`);
};

export const meta: Route.MetaFunction = () => {
    return [
        { title: "캠페인 지원 | Inf" },
        { name: "description", content: "캠페인에 지원하세요" },
    ];
};

export default function ApplyPage({ loaderData }: Route.ComponentProps) {
    const { campaign } = loaderData;

    return (
        <div className="container py-10 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">캠페인 지원</h1>
                <p className="text-muted-foreground text-sm">{campaign.title}에 지원하세요</p>
            </div>

            <Form method="post" className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                        지원 메시지
                    </label>
                    <Textarea
                        id="message"
                        name="message"
                        placeholder="광고주에게 전달할 메시지를 작성해주세요"
                        required
                        rows={10}
                    />
                </div>

                <div className="flex justify-end">
                    <Button type="submit">지원하기</Button>
                </div>
            </Form>
        </div>
    );
} 