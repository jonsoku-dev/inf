import { Form } from "react-router";
import { Badge } from "~/common/components/ui/badge";
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
import { APPLICATION_STATUS, APPLICATION_STATUS_LABELS } from "~/features/applications/constants";
import { getServerClient } from "~/server";
import type { Route } from "./+types/campaign-applications-page";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
    const supabase = getServerClient(request)
    // 세션 체크
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        throw new Error("인증이 필요합니다");
    }

    // 사용자 역할 조회
    const { data: userProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("profile_id", session.user.id)
        .single();

    // 캠페인 조회
    const { data: campaign, error: campaignError } = await supabase
        .from("campaigns")
        .select(`
            *,
            advertiser:profiles!advertiser_id (
                name,
                username,
                role
            )
        `)
        .eq("campaign_id", params.campaignId)
        .single();

    if (campaignError || !campaign) {
        throw new Error("캠페인을 찾을 수 없습니다");
    }

    const isOwner = campaign.advertiser_id === session.user.id;
    const isAdmin = userProfile?.role === "admin";

    // 접근 권한 체크 (관리자 또는 소유자만 접근 가능)
    if (!isAdmin && !isOwner) {
        throw new Error("접근 권한이 없습니다");
    }

    // 지원 내역 조회
    const { data: applications, error: applicationsError } = await supabase
        .from("applications")
        .select(`
            application_id,
            campaign_id,
            influencer_id,
            application_status,
            message,
            applied_at,
            updated_at,
            influencer:profiles!influencer_id (
                profile_id,
                name,
                username
            )
        `)
        .eq("campaign_id", params.campaignId)
        .order("applied_at", { ascending: false });

    if (applicationsError) {
        throw new Error("지원자 목록을 불러오는데 실패했습니다");
    }

    return {
        campaign,
        applications: applications || [],
        isOwner,
        isAdmin
    };
};

export const meta: Route.MetaFunction = () => {
    return [
        { title: "캠페인 지원자 | Inf" },
        { name: "description", content: "캠페인 지원자 목록을 확인하세요" },
    ];
};

export const action = async ({ request, params }: Route.ActionArgs) => {
    const supabase = getServerClient(request)
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        return { ok: false, error: "인증이 필요합니다" };
    }

    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "update-status") {
        const applicationId = formData.get("applicationId") as string;
        const status = formData.get("status") as keyof typeof APPLICATION_STATUS;

        const { error } = await supabase
            .from("applications")
            .update({ application_status: status as any })
            .eq("application_id", applicationId);

        if (error) {
            return { ok: false, error: "상태 변경 중 오류가 발생했습니다" };
        }

        return { ok: true };
    }

    return { ok: false, error: "잘못된 요청입니다" };
};

export default function CampaignApplicationsPage({ loaderData }: Route.ComponentProps) {
    const { campaign, applications, isOwner, isAdmin } = loaderData;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">캠페인 지원자</h1>
                <p className="text-muted-foreground text-sm">캠페인 지원자 목록을 확인하세요</p>
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
                                            {application.influencer.username}
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
                                    {(isOwner || isAdmin) ? (
                                        <Form method="post" className="w-[140px]">
                                            <input type="hidden" name="intent" value="update-status" />
                                            <input type="hidden" name="applicationId" value={application.application_id} />
                                            <Select
                                                name="status"
                                                defaultValue={application.application_status || APPLICATION_STATUS.PENDING}
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
                                                        {APPLICATION_STATUS_LABELS[application.application_status as keyof typeof APPLICATION_STATUS_LABELS]}
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(APPLICATION_STATUS).map(([key, value]) => (
                                                        <SelectItem key={value} value={value}>
                                                            {APPLICATION_STATUS_LABELS[value as keyof typeof APPLICATION_STATUS_LABELS]}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </Form>
                                    ) : (
                                        <Badge
                                            variant={application.application_status === APPLICATION_STATUS.APPROVED ? "success" : "secondary"}
                                        >
                                            {APPLICATION_STATUS_LABELS[application.application_status as keyof typeof APPLICATION_STATUS_LABELS]}
                                        </Badge>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
} 