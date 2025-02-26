export type CampaignApplication = {
    id: string;
    campaign_id: string;
    influencer_id: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    message?: string;
    created_at: string;
    updated_at: string;
} 