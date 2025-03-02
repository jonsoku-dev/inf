import { Form } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Label } from "~/common/components/ui/label";
import { Switch } from "~/common/components/ui/switch";
import type { AlertSettings } from "../types";

interface AlertSettingsFormProps {
    settings: AlertSettings;
    isSubmitting?: boolean;
}

export function AlertSettingsForm({ settings, isSubmitting }: AlertSettingsFormProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>알림 설정</CardTitle>
                <CardDescription>알림을 받는 방법과 종류를 설정하세요</CardDescription>
            </CardHeader>
            <CardContent>
                <Form method="post" className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">알림 채널</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="email_notifications">이메일 알림</Label>
                                    <p className="text-muted-foreground text-sm">중요 알림을 이메일로 받습니다</p>
                                </div>
                                <Switch
                                    id="email_notifications"
                                    name="email_notifications"
                                    defaultChecked={settings.email_notifications}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="push_notifications">푸시 알림</Label>
                                    <p className="text-muted-foreground text-sm">웹 브라우저에서 푸시 알림을 받습니다</p>
                                </div>
                                <Switch
                                    id="push_notifications"
                                    name="push_notifications"
                                    defaultChecked={settings.push_notifications}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="line_notifications">LINE 알림</Label>
                                    <p className="text-muted-foreground text-sm">LINE 메시지로 알림을 받습니다</p>
                                </div>
                                <Switch
                                    id="line_notifications"
                                    name="line_notifications"
                                    defaultChecked={settings.line_notifications}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">알림 유형</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="campaign_alerts">캠페인 알림</Label>
                                    <p className="text-muted-foreground text-sm">새 캠페인 및 캠페인 업데이트 알림</p>
                                </div>
                                <Switch
                                    id="campaign_alerts"
                                    name="campaign_alerts"
                                    defaultChecked={settings.campaign_alerts}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="application_alerts">지원 알림</Label>
                                    <p className="text-muted-foreground text-sm">지원서 접수 및 상태 변경 알림</p>
                                </div>
                                <Switch
                                    id="application_alerts"
                                    name="application_alerts"
                                    defaultChecked={settings.application_alerts}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="proposal_alerts">제안 알림</Label>
                                    <p className="text-muted-foreground text-sm">새 제안 및 제안 상태 변경 알림</p>
                                </div>
                                <Switch
                                    id="proposal_alerts"
                                    name="proposal_alerts"
                                    defaultChecked={settings.proposal_alerts}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="system_alerts">시스템 알림</Label>
                                    <p className="text-muted-foreground text-sm">시스템 공지 및 중요 업데이트 알림</p>
                                </div>
                                <Switch
                                    id="system_alerts"
                                    name="system_alerts"
                                    defaultChecked={settings.system_alerts}
                                />
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "저장 중..." : "설정 저장"}
                    </Button>
                </Form>
            </CardContent>
        </Card>
    );
} 