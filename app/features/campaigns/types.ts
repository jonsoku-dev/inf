import type { Database } from "database-generated.types";

export interface Campaign {
    campaign_id: string;
    title: string;
    description: string;
    budget: number;
    campaign_type: string;
    target_market: string;
    requirements?: string[];
    start_date: string;
    end_date: string;
    campaign_status: string;
    is_negotiable: boolean;
    is_urgent: boolean;
    min_followers?: number;
    created_at: string;
    updated_at: string;
    advertiser_id: string;
    categories: string[];
    keywords: string[];
    preferred_gender?: string;
    location_requirements?: string;
    formatted_start_date?: string;
    formatted_end_date?: string;
    is_owner?: boolean;
    advertiser: {
        name: string;
        username: string;
    };
} 