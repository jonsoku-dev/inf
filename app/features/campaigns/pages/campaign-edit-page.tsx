import type { Route } from "./+types/campaign-edit-page";
import { Form } from "react-router";
import { CampaignForm } from "../components/campaign-form";
import { mockCampaigns } from "../mocks";
import { campaignFormSchema } from "../components/campaign-form";

export const loader = ({ request, params }: Route.LoaderArgs) => {
    const campaign = mockCampaigns.find(
        (campaign) => campaign.campaign_id === params.campaignId
    );

    if (!campaign) {
        throw new Error("Campaign not found");
    }

    return {
        campaign,
    };
};

export const action = async ({ request }: Route.ActionArgs) => {
    const formData = await request.formData();
    const result = campaignFormSchema.safeParse({
        title: formData.get("title"),
        description: formData.get("description"),
        budget: Number(formData.get("budget")),
        target_market: formData.get("target_market"),
        requirements: formData.get("requirements"),
        period_start: formData.get("period_start"),
        period_end: formData.get("period_end"),
    });

    if (!result.success) {
        return {
            ok: false,
            errors: result.error.flatten(),
        };
    }

    // Mock: 캠페인 수정 액션
    console.log("Update campaign:", result.data);
    return { ok: true };
};

export const meta: Route.MetaFunction = () => {
    return [
        { title: "캠페인 수정 | Inf" },
        { name: "description", content: "캠페인 정보를 수정하세요" },
    ];
};

export default function CampaignEditPage({ loaderData, actionData }: Route.ComponentProps) {
    const { campaign } = loaderData;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">캠페인 수정</h1>
                <p className="text-muted-foreground text-sm">캠페인 정보를 수정하세요</p>
            </div>
            <Form method="post" className="space-y-8">
                <CampaignForm defaultValues={campaign} />
            </Form>
        </div>
    );
} 