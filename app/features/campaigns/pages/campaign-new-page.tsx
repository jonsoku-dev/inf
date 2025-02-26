import type { Route } from "./+types/campaign-new-page";
import { Form } from "react-router";
import { CampaignForm } from "../components/campaign-form";
import { campaignFormSchema } from "../components/campaign-form";

export const loader = ({ request }: Route.LoaderArgs) => {
    return {};
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

    // Mock: 캠페인 생성 액션
    console.log("Create campaign:", result.data);
    return { ok: true };
};

export const meta: Route.MetaFunction = () => {
    return [
        { title: "새 캠페인 | Inf" },
        { name: "description", content: "새로운 캠페인을 등록하세요" },
    ];
};

export default function CampaignNewPage({ loaderData, actionData }: Route.ComponentProps) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">새 캠페인</h1>
                <p className="text-muted-foreground text-sm">새로운 캠페인을 등록하세요</p>
            </div>
            <Form method="post" className="space-y-8">
                <CampaignForm />
            </Form>
        </div>
    );
} 