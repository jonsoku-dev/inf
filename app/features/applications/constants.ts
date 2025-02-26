export const APPLICATION_STATUS = {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
    COMPLETED: "completed",
} as const;

export const APPLICATION_STATUS_LABELS = {
    [APPLICATION_STATUS.PENDING]: "검토중",
    [APPLICATION_STATUS.APPROVED]: "승인됨",
    [APPLICATION_STATUS.REJECTED]: "거절됨",
} as const; 