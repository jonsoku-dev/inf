export const GENDER = {
    MALE: "MALE",
    FEMALE: "FEMALE",
    OTHER: "OTHER"
} as const;

export const GENDER_LABELS: Record<keyof typeof GENDER, string> = {
    MALE: "남성",
    FEMALE: "여성",
    OTHER: "기타"
};

export const SNS_TYPE = {
    INSTAGRAM: "INSTAGRAM",
    YOUTUBE: "YOUTUBE",
    TIKTOK: "TIKTOK",
    BLOG: "BLOG",
} as const;

export const SNS_TYPE_LABELS = {
    [SNS_TYPE.INSTAGRAM]: "인스타그램",
    [SNS_TYPE.YOUTUBE]: "유튜브",
    [SNS_TYPE.TIKTOK]: "틱톡",
    [SNS_TYPE.BLOG]: "블로그",
} as const;

export const INFLUENCER_CATEGORY = {
    FASHION: "FASHION",
    BEAUTY: "BEAUTY",
    FOOD: "FOOD",
    TRAVEL: "TRAVEL",
    TECH: "TECH",
    GAME: "GAME",
    ENTERTAINMENT: "ENTERTAINMENT",
    LIFESTYLE: "LIFESTYLE",
    PARENTING: "PARENTING",
    PETS: "PETS",
    OTHER: "OTHER"
} as const;

export const INFLUENCER_CATEGORY_LABELS: Record<keyof typeof INFLUENCER_CATEGORY, string> = {
    FASHION: "패션",
    BEAUTY: "뷰티",
    FOOD: "음식",
    TRAVEL: "여행",
    TECH: "테크",
    GAME: "게임",
    ENTERTAINMENT: "엔터테인먼트",
    LIFESTYLE: "라이프스타일",
    PARENTING: "육아",
    PETS: "반려동물",
    OTHER: "기타"
};

// 한국, 일본, 한국/일본

export const LOCATION = {
    KOREA: "KOREA",
    JAPAN: "JAPAN",
    KOREA_JAPAN: "KOREA_JAPAN",
};

export const LOCATION_LABELS: Record<keyof typeof LOCATION, string> = {
    KOREA: "한국",
    JAPAN: "일본",
    KOREA_JAPAN: "한국/일본",
};