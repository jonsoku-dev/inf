import type { PROPOSAL_STATUS, TARGET_MARKET } from "./constants";

export interface Proposal {
    proposal_id: string;
    influencer_id: string;
    title: string;
    description: string;
    desired_budget: number;
    target_market: keyof typeof TARGET_MARKET;
    content_type: string;
    expected_deliverables: string[];
    available_period_start: string;
    available_period_end: string;
    categories: string[];
    keywords: string[];
    portfolio_samples?: string[];
    is_negotiable: boolean;
    preferred_industry?: string[];
    status: keyof typeof PROPOSAL_STATUS;
    created_at: string;
    updated_at: string;
    influencer?: {
        name: string;
        username: string;
    };
}

export interface ProposalApplication {
    application_id: string;
    proposal_id: string;
    advertiser_id: string;
    message: string;
    status: keyof typeof PROPOSAL_STATUS;
    applied_at: string;
    updated_at: string;
    advertiser?: {
        name: string;
        username: string;
    };
} 