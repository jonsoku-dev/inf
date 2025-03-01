import type { GENDER, SNS_TYPE, INFLUENCER_CATEGORY } from "./constants";

export interface InfluencerVerification {
    verification_id: string;
    profile_id: string;
    platform: keyof typeof SNS_TYPE;
    verified_at: string;
    followers_count: number;
    engagement_rate: number;
    is_valid: boolean;
    next_verification_due: string;
}

export interface InfluencerStats {
    stat_id: string;
    profile_id: string;
    platform: keyof typeof SNS_TYPE;
    recorded_at: string;
    followers_count: number;
    engagement_rate: number;
    avg_likes?: number;
    avg_comments?: number;
    avg_views?: number;
}

export const CATEGORIES = [
    "FASHION",
    "BEAUTY",
    "FOOD",
    "TRAVEL",
    "TECH",
    "GAME",
    "ENTERTAINMENT",
    "LIFESTYLE",
    "PARENTING",
    "PETS",
    "OTHER",
] as const;

export type Category = typeof CATEGORIES[number];

export interface InfluencerProfile {
    profile_id: string;
    categories: Category[];
    instagram_handle: string | null;
    youtube_handle: string | null;
    tiktok_handle: string | null;
    blog_url: string | null;
    followers_count: number;
    gender: string | null;
    birth_year: number | null;
    location: string | null;
    introduction: string | null;
    portfolio_urls: string[];
    is_public: boolean;
    profile: {
        name: string;
        username: string;
        avatar_url: string | null;
    };
    verifications: {
        platform: string;
        followers_count: number;
        engagement_rate: number;
        is_valid: boolean;
        verified_at: string;
    }[];
    stats: {
        platform: string;
        followers_count: number;
        engagement_rate: number;
        avg_likes: number;
        avg_comments: number;
        avg_views: number;
        recorded_at: string;
    }[];
}

export interface InfluencerSearchParams {
    category?: keyof typeof INFLUENCER_CATEGORY;
    minFollowers?: number;
    maxFollowers?: number;
    platform?: keyof typeof SNS_TYPE;
    location?: string;
    gender?: keyof typeof GENDER;
    minEngagementRate?: number;
    isVerified?: boolean;
}

export interface InfluencerMetrics {
    totalFollowers: number;
    avgEngagementRate: number;
    platformPresence: Array<keyof typeof SNS_TYPE>;
    verificationStatus: {
        isVerified: boolean;
        lastVerifiedAt?: string;
        nextVerificationDue?: string;
    };
    performance: {
        avgLikes?: number;
        avgComments?: number;
        avgViews?: number;
    };
} 