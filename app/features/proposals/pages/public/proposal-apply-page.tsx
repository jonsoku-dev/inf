import { Link, data, redirect } from "react-router";
import { Button } from "~/common/components/ui/button";
import { ProposalDetail } from "../../components/proposal-detail";
import { getServerClient } from "~/server";
import type { Route } from "./+types/proposal-apply-page";
import { Form } from "react-router";
import { Textarea } from "~/common/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { z } from "zod";

const applyFormSchema = z.object({
    message: z.string().min(1, "메시지를 입력해주세요"),
});

export const loader = async ({ request, params }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

    // 광고주 권한 확인
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("profile_id", user.id)
        .single();

    if (profile?.role !== "ADVERTISER") {
        throw new Error("광고주만 제안에 신청할 수 있습니다");
    }

    const { data: proposal } = await supabase
        .from("influencer_proposals")
        .select(`
            *,
            influencer:profiles!influencer_id (
                name,
                username
            )
        `)
        .eq("proposal_id", params.proposalId)
        .eq("proposal_status", "PUBLISHED")
        .single();

    if (!proposal) {
        throw new Error("제안을 찾을 수 없습니다");
    }

    // 이미 신청했는지 확인
    const { data: existingApplication } = await supabase
        .from("proposal_applications")
        .select("application_id")
        .eq("proposal_id", params.proposalId)
        .eq("advertiser_id", user.id)
        .single();

    if (existingApplication) {
        throw new Error("이미 신청한 제안입니다");
    }

    return {
        proposal,
    };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

    try {
        const formData = await request.formData();
        const rawData = {
            message: formData.get("message"),
        };

        const validatedData = applyFormSchema.parse(rawData);

        const { error: supabaseError } = await supabase
            .from("proposal_applications")
            .insert({
                proposal_id: params.proposalId,
                advertiser_id: user.id,
                message: validatedData.message,
                proposal_application_status: "PENDING",
            });

        if (supabaseError) throw supabaseError;

        return redirect("/my/proposal-applications");
    } catch (error) {
        if (error instanceof Error) {
            return data({ errors: { form: error.message } }, { status: 400 });
        }
        if (error instanceof z.ZodError) {
            const fieldErrors = error.errors.reduce((acc: Record<string, string>, curr) => {
                if (curr.path[0]) {
                    acc[curr.path[0].toString()] = curr.message;
                }
                return acc;
            }, {});
            return data({ errors: fieldErrors }, { status: 400 });
        }
        return data({ errors: { form: "알 수 없는 오류가 발생했습니다" } }, { status: 500 });
    }
};

export const meta: Route.MetaFunction = () => {
    return [
        { title: "제안 신청 | Inf" },
        { name: "description", content: "인플루언서의 제안에 신청하세요" },
    ];
};

export default function ProposalApplyPage({ loaderData, actionData }: Route.ComponentProps) {
    const { proposal } = loaderData;
    const errors = actionData?.errors;

    return (
        <div className="container py-10 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">제안 신청</h1>
                    <p className="text-muted-foreground text-sm">인플루언서의 제안에 신청하세요</p>
                </div>
                <Button variant="outline" asChild>
                    <Link to={`/proposals/${proposal.proposal_id}`}>돌아가기</Link>
                </Button>
            </div>

            <ProposalDetail proposal={proposal} />

            <Card>
                <CardHeader>
                    <CardTitle>신청 메시지</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form method="post" className="space-y-4">
                        <div>
                            <Textarea
                                name="message"
                                placeholder="인플루언서에게 전달할 메시지를 입력하세요"
                                className="min-h-[120px]"
                            />
                            {errors?.message && (
                                <p className="text-destructive text-sm mt-1">{errors.message}</p>
                            )}
                        </div>
                        {errors?.form && (
                            <p className="text-destructive text-sm">{errors.form}</p>
                        )}
                        <div className="flex justify-end">
                            <Button type="submit">신청하기</Button>
                        </div>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
} 