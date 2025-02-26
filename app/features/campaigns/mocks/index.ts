import type { Campaign } from "../types";
import { CAMPAIGN_STATUS } from "../constants";

export const mockCampaigns: Campaign[] = [
    {
        campaign_id: "1",
        advertiser_id: "user1",
        title: "일본 뷰티 제품 홍보",
        description: "일본의 인기 스킨케어 제품을 한국 시장에 소개하는 캠페인입니다.",
        budget: 1000000,
        status: "PUBLISHED",
        target_market: "KR",
        requirements: "뷰티/화장품 분야 팔로워 10,000명 이상",
        period_start: "2024-03-01",
        period_end: "2024-03-31",
        created_at: "2024-02-25T09:00:00Z",
        updated_at: "2024-02-25T09:00:00Z",
    },
    {
        campaign_id: "2",
        advertiser_id: "user2",
        title: "한국 식품 브랜드 일본 진출",
        description: "한국의 대표 과자 브랜드의 일본 시장 진출 프로모션",
        budget: 2000000,
        status: "DRAFT",
        target_market: "JP",
        requirements: "식품/먹방 분야 팔로워 20,000명 이상",
        period_start: "2024-04-01",
        period_end: "2024-04-30",
        created_at: "2024-02-26T09:00:00Z",
        updated_at: "2024-02-26T09:00:00Z",
    },
]; 