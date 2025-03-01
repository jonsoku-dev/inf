import { Form, redirect } from "react-router";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/common/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/common/components/ui/table";
import { APPLICATION_STATUS, APPLICATION_STATUS_LABELS } from "~/features/campaigns/constants";
import { getServerClient } from "~/server";
import type { Route } from "./+types/applications-page";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/auth/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("profile_id", user.id)
        .single();

    if (profile?.role !== "ADVERTISER") {
        return redirect("/campaigns");
    }

    const { data: campaign } = await supabase
        .from("campaigns")
        .select(`
            *,
            applications (
                application_id,
                influencer_id,
                application_status,
                message,
                applied_at,
                updated_at,
                influencer:profiles!influencer_id (
                    name,
                    username
                )
            )
        `)
        .eq("campaign_id", params.campaignId)
        .single();

    if (!campaign || campaign.advertiser_id !== user.id) {
        return redirect("/campaigns");
    }

    return {
        campaign,
        applications: campaign.applications || [],
    };
};

export const action = async ({ request }: Route.ActionArgs) => {
    const { supabase } = getServerClient(request);
    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "update-status") {
        const applicationId = formData.get("applicationId") as string;
        const status = formData.get("status") as keyof typeof APPLICATION_STATUS;

        const { error } = await supabase
            .from("applications")
            .update({ application_status: status })
            .eq("application_id", applicationId);

        if (error) {
            return { ok: false, error: "상태 변경에 실패했습니다." };
        }

        return { ok: true };
    }

    return { ok: false, error: "잘못된 요청입니다." };
};

export const meta: Route.MetaFunction = () => {
    return [
        { title: "지원자 관리 | Inf" },
        { name: "description", content: "캠페인 지원자를 관리하세요" },
    ];
};

export default function ApplicationsPage({ loaderData }: Route.ComponentProps) {
    const { applications } = loaderData;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">지원자 관리</h1>
                <p className="text-muted-foreground text-sm">캠페인 지원자를 관리하세요</p>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>인플루언서</TableHead>
                            <TableHead>지원 메시지</TableHead>
                            <TableHead>지원일</TableHead>
                            <TableHead>상태</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {applications.map((application) => (
                            <TableRow key={application.application_id}>
                                <TableCell>
                                    <div>
                                        <p className="font-medium">{application.influencer.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            @{application.influencer.username}
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell className="max-w-md">
                                    <p className="truncate">{application.message}</p>
                                </TableCell>
                                <TableCell>
                                    {new Date(application.applied_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <Form method="post" className="w-[140px]">
                                        <input type="hidden" name="intent" value="update-status" />
                                        <input type="hidden" name="applicationId" value={application.application_id} />
                                        <Select
                                            name="status"
                                            defaultValue={application.application_status}
                                            onValueChange={(value) => {
                                                const form = document.createElement('form');
                                                form.method = 'post';
                                                form.innerHTML = `
                                                    <input type="hidden" name="intent" value="update-status" />
                                                    <input type="hidden" name="applicationId" value="${application.application_id}" />
                                                    <input type="hidden" name="status" value="${value}" />
                                                `;
                                                document.body.appendChild(form);
                                                form.submit();
                                                document.body.removeChild(form);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue>
                                                    {APPLICATION_STATUS_LABELS[application.application_status]}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(APPLICATION_STATUS).map(([key, value]) => (
                                                    <SelectItem key={value} value={value}>
                                                        {APPLICATION_STATUS_LABELS[value]}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Form>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
} 