import { useState } from "react";
import { Link } from "react-router";
import { Badge } from "~/common/components/ui/badge";
import { Button } from "~/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/common/components/ui/tabs";
import { ALERT_STATUS, ALERT_TYPE_LABELS } from "../constants";
import type { Alert } from "../types";
import { AlertItem } from "./alert-item";
import { Form } from "react-router";
import { BellIcon, CheckIcon, ArchiveIcon } from "lucide-react";

interface AlertListProps {
    alerts: Alert[];
}

export function AlertList({ alerts }: AlertListProps) {
    const [activeTab, setActiveTab] = useState<string>("unread");

    const unreadAlerts = alerts.filter(alert => alert.alert_status === ALERT_STATUS.UNREAD);
    const readAlerts = alerts.filter(alert => alert.alert_status === ALERT_STATUS.READ);
    const archivedAlerts = alerts.filter(alert => alert.alert_status === ALERT_STATUS.ARCHIVED);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>알림</CardTitle>
                {unreadAlerts.length > 0 && (
                    <Form method="post">
                        <input type="hidden" name="intent" value="mark-all-read" />
                        <Button
                            variant="outline"
                            size="sm"
                            type="submit"
                            className="text-xs"
                        >
                            <CheckIcon className="h-3.5 w-3.5 mr-1" />
                            모두 읽음으로 표시
                        </Button>
                    </Form>
                )}
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="unread" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-3 mb-4">
                        <TabsTrigger value="unread" className="relative">
                            읽지 않음
                            {unreadAlerts.length > 0 && (
                                <Badge variant="destructive" className="ml-1">
                                    {unreadAlerts.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="read">읽음</TabsTrigger>
                        <TabsTrigger value="archived">보관됨</TabsTrigger>
                    </TabsList>

                    <TabsContent value="unread">
                        {unreadAlerts.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                읽지 않은 알림이 없습니다.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {unreadAlerts.map(alert => (
                                    <AlertItem
                                        key={alert.alert_id}
                                        alert={alert}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="read">
                        {readAlerts.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                읽은 알림이 없습니다.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {readAlerts.map(alert => (
                                    <AlertItem
                                        key={alert.alert_id}
                                        alert={alert}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="archived">
                        {archivedAlerts.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                보관된 알림이 없습니다.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {archivedAlerts.map(alert => (
                                    <AlertItem
                                        key={alert.alert_id}
                                        alert={alert}
                                        isArchived
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
} 