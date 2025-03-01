import { Link, redirect } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Form } from "react-router";
import { Textarea } from "~/common/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { getServerClient } from "~/server";
import type { Route } from "./+types/apply-page";

/**
 * @description 광고주가 인플루언서의 제안에 신청하는 페이지
 * - 신청 메시지 작성
 * - 제안 상세 정보 표시
 * - 이미 신청한 경우 제안 상세 페이지로 리다이렉트
 */
export const loader = async ({ request, params }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

    // 이미 신청했는지 확인
    const { data: existingApplication } = await supabase
        .from("proposal_applications")
        .select("application_id")
        .eq("proposal_id", params.proposalId)
        .eq("advertiser_id", user.id)
        .single();

    if (existingApplication) {
        throw redirect(`/proposals/public/${params.proposalId}`);
    }

    return {};
};

export const action = async ({ request, params }: Route.ActionArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    const formData = await request.formData();

    if (!user) {
        throw new Error("인증이 필요합니다");
    }

    const { error } = await supabase
        .from("proposal_applications")
        .insert({
            proposal_id: params.proposalId,
            advertiser_id: user.id,
            message: formData.get("message") as string,
            proposal_application_status: "PENDING"
        });

    if (error) throw error;

    return redirect(`/proposals/public/${params.proposalId}`);
};

export default function ApplyPage() {
    return (
        <div className="container py-10 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">제안 신청</h1>
                    <p className="text-muted-foreground text-sm">제안에 신청하세요</p>
                </div>
                <Button variant="outline" asChild>
                    <Link to="/proposals/public">취소</Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>신청 메시지</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form method="post" className="space-y-4">
                        <div className="space-y-2">
                            <Textarea
                                name="message"
                                placeholder="인플루언서에게 전달할 메시지를 작성하세요"
                                rows={5}
                                required
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit">신청하기</Button>
                        </div>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
