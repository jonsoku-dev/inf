import type { profiles } from "~/features/users/schema";

export interface Campaign {
    campaign_id: string;
    advertiser_id: string;
    title: string;
    description: string;
    budget: number;
    requirements: string;
    target_market: "KR" | "JP" | "BOTH";
    period_start: string;
    period_end: string;
    status: "DRAFT" | "PUBLISHED" | "CLOSED" | "COMPLETED";
    created_at: string;
    updated_at: string;
    profiles?: {
        name: string;
        username: string;
        role: string;
    } | null;
} 