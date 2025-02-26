import { CAMPAIGN_STATUS } from "../constants";

export interface Campaign {
    campaign_id: string;
    advertiser_id: string;
    title: string;
    description: string;
    budget: number;
    campaign_status: keyof typeof CAMPAIGN_STATUS;
    target_market: "KR" | "JP" | "BOTH";
    requirements: string;
    period_start: string;
    period_end: string;
    created_at: string;
    updated_at: string;
}

export interface CampaignApplication {
    application_id: string;
    campaign_id: string;
    influencer_id: string;
    application_status: string;
    message?: string;
    applied_at: string;
    updated_at: string;
    influencer?: {
        profile_id: string;
        name: string;
        email: string;
    };
}

export interface CampaignFormData {
    title: string;
    description: string;
    budget: number;
    target_market: "KR" | "JP" | "BOTH";
    requirements: string;
    period_start: string;
    period_end: string;
} 