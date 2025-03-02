export const NOTIFICATION_TYPE = {
    ANNOUNCEMENT: "ANNOUNCEMENT", // 공지사항
    SYSTEM: "SYSTEM", // 시스템 알림
    CAMPAIGN: "CAMPAIGN", // 캠페인 관련 알림
    PROPOSAL: "PROPOSAL", // "proposal"에서 "PROPOSAL"로 수정
} as const;

export const NOTIFICATION_TARGET = {
    ALL: "ALL", // 모든 사용자
    ADVERTISERS: "ADVERTISERS", // 광고주만
    INFLUENCERS: "INFLUENCERS", // 인플루언서만
} as const; 