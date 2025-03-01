import type { GENDER, SNS_TYPE, INFLUENCER_CATEGORY } from "./constants";
import type { Database } from "database-generated.types";

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

export type InfluencerProfile = {
    birth_year: number | null;
    blog_url: string | null;
    categories: Database["public"]["Enums"]["influencer_category"][];
    created_at: string;
    followers_count: Database["public"]["Tables"]["influencer_profiles"]["Row"]["followers_count"];
    gender: Database["public"]["Enums"]["gender"] | null;
    instagram_handle: string | null;
    introduction: string | null;
    is_public: boolean;
    location: string | null;
    portfolio_urls: string[] | null;
    profile_id: string;
    tiktok_handle: string | null;
    updated_at: string;
    youtube_handle: string | null;
    profile: {
        name: string;
        username: string;
        avatar_url: string | null;
    };
    verifications: {
        platform: Database["public"]["Enums"]["sns_type"];
        followers_count: number;
        engagement_rate: number | null;
        is_valid: boolean;
        verified_at: string;
    }[];
    stats: {
        platform: Database["public"]["Enums"]["sns_type"];
        followers_count: number;
        engagement_rate: number | null;
        avg_likes: number | null;
        avg_comments: number | null;
        avg_views: number | null;
        recorded_at: string;
    }[];
};

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