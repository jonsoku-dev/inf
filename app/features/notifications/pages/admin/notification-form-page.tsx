import { useState } from "react";
import { Form, redirect } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Checkbox } from "~/common/components/ui/checkbox";
import { Input } from "~/common/components/ui/input";
import { Label } from "~/common/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/common/components/ui/radio-group";
import { Textarea } from "~/common/components/ui/textarea";
import { getServerClient } from "~/server";
import { createNotification, deleteNotification, getNotificationById, updateNotification } from "../../api";
import { notificationSchema } from "../../schema";
import type { Route } from "./+types/notification-form-page";
import type { NotificationType, NotificationTarget } from "../../types";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/auth/login");
    }

    // 관리자 권한 확인
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("profile_id", user.id)
        .single();

    if (profile?.role !== "ADMIN") {
        return redirect("/notifications");
    }

    let notification = null;
    const isNew = params.id === "new";

    if (!isNew) {
        notification = await getNotificationById(request, params.id as string);
        if (!notification) {
            return redirect("/admin/notifications");
        }
    }

    return {
        notification,
        isNew,
        adminId: user.id
    };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
    const { supabase } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/auth/login");
    }

    // 관리자 권한 확인
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("profile_id", user.id)
        .single();

    if (profile?.role !== "ADMIN") {
        return redirect("/notifications");
    }

    const formData = await request.formData();
    const intent = formData.get("intent") as string;

    if (intent === "delete") {
        // 삭제 처리
        const id = params.id as string;
        await deleteNotification(request, id);
        return redirect("/admin/notifications");
    }

    try {
        // 데이터 유효성 검사
        const validatedData = notificationSchema.parse({
            ...Object.fromEntries(formData),
            is_important: formData.get("is_important") === "on",
            is_published: intent === "publish"
        });

        const isNew = params.id === "new";

        if (isNew) {
            // 새 공지사항 생성
            await createNotification(request, {
                ...validatedData,
                notification_type: validatedData.notification_type as NotificationType,
                target_audience: validatedData.target_audience as NotificationTarget,
                admin_id: user.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                publish_date: new Date(validatedData.publish_date),
                expiry_date: validatedData.expiry_date ? new Date(validatedData.expiry_date) : undefined
            });
        } else {
            // 기존 공지사항 수정
            await updateNotification(request, params.id as string, {
                ...validatedData,
                notification_type: validatedData.notification_type as NotificationType,
                target_audience: validatedData.target_audience as NotificationTarget,
                updated_at: new Date().toISOString(),
                publish_date: new Date(validatedData.publish_date),
                expiry_date: validatedData.expiry_date ? new Date(validatedData.expiry_date) : undefined
            });
        }

        return redirect("/admin/notifications");
    } catch (error) {
        return { error };
    }
};

export function meta({ data }: Route.MetaArgs) {
    const isNew = data?.isNew;
    return [
        { title: `${isNew ? "새 공지사항 작성" : "공지사항 수정"} - 인플루언서 마케팅 플랫폼` },
        { name: "description", content: `${isNew ? "새 공지사항을 작성" : "기존 공지사항을 수정"}합니다.` },
    ];
}

// 날짜 포맷 유틸리티 함수
function formatDateForInput(date?: Date | string | null): string {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toISOString().split("T")[0];
}

export default function NotificationFormPage({ loaderData }: Route.ComponentProps) {
    const { notification, isNew, adminId } = loaderData;
    const [error, setError] = useState<string | null>(null);

    const title = isNew ? "새 공지사항 작성" : "공지사항 수정";

    return (
        <div className="container py-8 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>
                        {isNew
                            ? "새로운 공지사항을 작성합니다. 공지사항은 관리자 검토 후 게시됩니다."
                            : "기존 공지사항을 수정합니다."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form method="post">
                        {error && (
                            <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div>
                                <Label htmlFor="title">제목</Label>
                                <Input
                                    type="text"
                                    id="title"
                                    name="title"
                                    defaultValue={notification?.title || ""}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="content">내용</Label>
                                <Textarea
                                    id="content"
                                    name="content"
                                    rows={8}
                                    defaultValue={notification?.content || ""}
                                    required
                                />
                            </div>

                            <div>
                                <Label>공지사항 유형</Label>
                                <RadioGroup
                                    defaultValue={notification?.notification_type || "ANNOUNCEMENT"}
                                    name="notification_type"
                                    className="flex flex-col space-y-1 mt-2"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="ANNOUNCEMENT" id="type-announcement" />
                                        <Label htmlFor="type-announcement" className="font-normal">공지사항</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="SYSTEM" id="type-system" />
                                        <Label htmlFor="type-system" className="font-normal">시스템 알림</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="CAMPAIGN" id="type-campaign" />
                                        <Label htmlFor="type-campaign" className="font-normal">캠페인 관련</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div>
                                <Label>대상 사용자</Label>
                                <RadioGroup
                                    defaultValue={notification?.target_audience || "ALL"}
                                    name="target_audience"
                                    className="flex flex-col space-y-1 mt-2"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="ALL" id="audience-all" />
                                        <Label htmlFor="audience-all" className="font-normal">모든 사용자</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="ADVERTISERS" id="audience-advertisers" />
                                        <Label htmlFor="audience-advertisers" className="font-normal">광고주만</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="INFLUENCERS" id="audience-influencers" />
                                        <Label htmlFor="audience-influencers" className="font-normal">인플루언서만</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="publish_date">게시일</Label>
                                    <Input
                                        type="date"
                                        id="publish_date"
                                        name="publish_date"
                                        defaultValue={formatDateForInput(notification?.publish_date) || formatDateForInput(new Date())}
                                        required
                                    />
                                    <p className="text-sm text-muted-foreground mt-1">
                                        이 날짜부터 공지사항이 표시됩니다.
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="expiry_date">만료일 (선택사항)</Label>
                                    <Input
                                        type="date"
                                        id="expiry_date"
                                        name="expiry_date"
                                        defaultValue={formatDateForInput(notification?.expiry_date)}
                                    />
                                    <p className="text-sm text-muted-foreground mt-1">
                                        이 날짜 이후에는 공지사항이 표시되지 않습니다.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_important"
                                    name="is_important"
                                    defaultChecked={notification?.is_important ?? false}
                                />
                                <Label htmlFor="is_important" className="font-normal">
                                    중요 공지사항으로 표시
                                </Label>
                            </div>
                        </div>

                        <CardFooter className="flex justify-between px-0 mt-6">
                            <div className="flex space-x-2">
                                <Button variant="outline" asChild>
                                    <a href="/admin/notifications">취소</a>
                                </Button>

                                {!isNew && (
                                    <Button variant="destructive" type="submit" name="intent" value="delete">
                                        삭제
                                    </Button>
                                )}
                            </div>

                            <div className="flex space-x-2">
                                <Button variant="outline" type="submit" name="intent" value="save">
                                    임시저장
                                </Button>
                                <Button type="submit" name="intent" value="publish">
                                    {notification?.is_published ? "업데이트" : "게시하기"}
                                </Button>
                            </div>
                        </CardFooter>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
} 