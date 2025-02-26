export const CAMPAIGN_STATUS = {
    DRAFT: "draft",
    PUBLISHED: "published",
    CLOSED: "closed",
    CANCELLED: "cancelled",
    COMPLETED: "completed",
} as const;

export const CAMPAIGN_STATUS_LABELS = {
    [CAMPAIGN_STATUS.DRAFT]: "임시저장",
    [CAMPAIGN_STATUS.PUBLISHED]: "모집중",
    [CAMPAIGN_STATUS.CLOSED]: "모집마감",
    [CAMPAIGN_STATUS.CANCELLED]: "취소",
    [CAMPAIGN_STATUS.COMPLETED]: "완료",
} as const; 