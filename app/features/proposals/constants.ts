export const PROPOSAL_STATUS = {
    DRAFT: "DRAFT",
    PUBLISHED: "PUBLISHED",
    CLOSED: "CLOSED",
    REJECTED: "REJECTED",
} as const;

export const PROPOSAL_STATUS_LABELS = {
    [PROPOSAL_STATUS.DRAFT]: "임시저장",
    [PROPOSAL_STATUS.PUBLISHED]: "공개",
    [PROPOSAL_STATUS.CLOSED]: "마감",
    [PROPOSAL_STATUS.REJECTED]: "거절됨",
} as const;

export const TARGET_MARKET = {
    KR: "KR",
    JP: "JP",
    BOTH: "BOTH",
} as const;

export const TARGET_MARKET_LABELS = {
    [TARGET_MARKET.KR]: "한국",
    [TARGET_MARKET.JP]: "일본",
    [TARGET_MARKET.BOTH]: "양국",
} as const;

export const CONTENT_TYPE = {
    INSTAGRAM_POST: "INSTAGRAM_POST",
    INSTAGRAM_REEL: "INSTAGRAM_REEL",
    INSTAGRAM_STORY: "INSTAGRAM_STORY",
    YOUTUBE_SHORT: "YOUTUBE_SHORT",
    YOUTUBE_VIDEO: "YOUTUBE_VIDEO",
    TIKTOK_VIDEO: "TIKTOK_VIDEO",
    BLOG_POST: "BLOG_POST",
} as const;

export const CONTENT_TYPE_LABELS = {
    [CONTENT_TYPE.INSTAGRAM_POST]: "인스타그램 포스트",
    [CONTENT_TYPE.INSTAGRAM_REEL]: "인스타그램 릴스",
    [CONTENT_TYPE.INSTAGRAM_STORY]: "인스타그램 스토리",
    [CONTENT_TYPE.YOUTUBE_SHORT]: "유튜브 쇼츠",
    [CONTENT_TYPE.YOUTUBE_VIDEO]: "유튜브 영상",
    [CONTENT_TYPE.TIKTOK_VIDEO]: "틱톡 영상",
    [CONTENT_TYPE.BLOG_POST]: "블로그 포스트",
} as const;

export const INDUSTRY = {
    FASHION: "FASHION",
    BEAUTY: "BEAUTY",
    FOOD: "FOOD",
    TRAVEL: "TRAVEL",
    TECH: "TECH",
    GAME: "GAME",
    ENTERTAINMENT: "ENTERTAINMENT",
    EDUCATION: "EDUCATION",
    FINANCE: "FINANCE",
    HEALTH: "HEALTH",
    SPORTS: "SPORTS",
    LIFESTYLE: "LIFESTYLE",
    PARENTING: "PARENTING",
    PETS: "PETS",
    OTHER: "OTHER",
} as const;

export const INDUSTRY_LABELS = {
    [INDUSTRY.FASHION]: "패션",
    [INDUSTRY.BEAUTY]: "뷰티",
    [INDUSTRY.FOOD]: "음식",
    [INDUSTRY.TRAVEL]: "여행",
    [INDUSTRY.TECH]: "테크",
    [INDUSTRY.GAME]: "게임",
    [INDUSTRY.ENTERTAINMENT]: "엔터테인먼트",
    [INDUSTRY.EDUCATION]: "교육",
    [INDUSTRY.FINANCE]: "금융",
    [INDUSTRY.HEALTH]: "건강",
    [INDUSTRY.SPORTS]: "스포츠",
    [INDUSTRY.LIFESTYLE]: "라이프스타일",
    [INDUSTRY.PARENTING]: "육아",
    [INDUSTRY.PETS]: "반려동물",
    [INDUSTRY.OTHER]: "기타",
} as const;

export const PROPOSAL_APPLICATION_STATUS = {
    PENDING: "PENDING",
    ACCEPTED: "ACCEPTED",
    REJECTED: "REJECTED",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
} as const;

export const PROPOSAL_APPLICATION_STATUS_LABELS = {
    [PROPOSAL_APPLICATION_STATUS.PENDING]: "검토중",
    [PROPOSAL_APPLICATION_STATUS.ACCEPTED]: "승인됨",
    [PROPOSAL_APPLICATION_STATUS.REJECTED]: "거절됨",
    [PROPOSAL_APPLICATION_STATUS.COMPLETED]: "완료",
    [PROPOSAL_APPLICATION_STATUS.CANCELLED]: "취소",
} as const;

export const ADVERTISER_PROPOSAL_STATUS = {
    DRAFT: "DRAFT",        // 초안 (아직 보내지 않음)
    SENT: "SENT",          // 인플루언서에게 전송됨
    ACCEPTED: "ACCEPTED",  // 인플루언서가 수락함
    REJECTED: "REJECTED",  // 인플루언서가 거절함
    COMPLETED: "COMPLETED", // 협업 완료
    CANCELLED: "CANCELLED", // 취소됨
} as const;

export const ADVERTISER_PROPOSAL_STATUS_LABELS = {
    DRAFT: "초안",
    SENT: "전송됨",
    ACCEPTED: "수락됨",
    REJECTED: "거절됨",
    COMPLETED: "완료됨",
    CANCELLED: "취소됨",
} as const; 