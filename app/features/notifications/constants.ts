export const NOTIFICATION_TYPES = {
    CAMPAIGN_APPLIED: "campaign_applied",
    APPLICATION_STATUS_CHANGED: "application_status_changed",
    CAMPAIGN_COMPLETED: "campaign_completed",
} as const;

export const NOTIFICATION_TYPE_LABELS = {
    [NOTIFICATION_TYPES.CAMPAIGN_APPLIED]: "캠페인 지원",
    [NOTIFICATION_TYPES.APPLICATION_STATUS_CHANGED]: "지원 상태 변경",
    [NOTIFICATION_TYPES.CAMPAIGN_COMPLETED]: "캠페인 완료",
} as const; 