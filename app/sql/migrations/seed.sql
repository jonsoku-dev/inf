-- 인플루언서 프로필 데이터 삽입
INSERT INTO influencer_profiles (
    profile_id,
    categories,
    instagram_handle,
    youtube_handle,
    tiktok_handle,
    blog_url,
    followers_count,
    gender,
    birth_year,
    location,
    introduction,
    portfolio_urls,
    is_public
) VALUES (
    '5aab23d6-6fca-421d-adcb-404549b4f295',
    ARRAY['FASHION', 'BEAUTY', 'LIFESTYLE']::influencer_category[],
    '@style_influencer_kr',
    'StyleKR',
    '@stylekr',
    'https://blog.naver.com/stylekr',
    '{"INSTAGRAM": 50000, "YOUTUBE": 100000, "TIKTOK": 30000}'::jsonb,
    'FEMALE',
    1995,
    'Seoul, Korea',
    '패션과 뷰티 콘텐츠를 제작하는 크리에이터입니다.',
    ARRAY['https://portfolio1.com', 'https://portfolio2.com'],
    true
);

-- 인플루언서 검증 데이터
INSERT INTO influencer_verifications (
    verification_id,
    profile_id,
    platform,
    followers_count,
    engagement_rate,
    is_valid,
    next_verification_due
) VALUES (
    gen_random_uuid(),
    '5aab23d6-6fca-421d-adcb-404549b4f295',
    'INSTAGRAM',
    50000,
    4.5,
    true,
    NOW() + INTERVAL '3 months'
);

-- 인플루언서 통계 데이터
INSERT INTO influencer_stats (
    stat_id,
    profile_id,
    platform,
    followers_count,
    engagement_rate,
    avg_likes,
    avg_comments,
    avg_views
) VALUES (
    gen_random_uuid(),
    '5aab23d6-6fca-421d-adcb-404549b4f295',
    'INSTAGRAM',
    50000,
    4.5,
    2000,
    100,
    5000
);

-- 캠페인 데이터
INSERT INTO campaigns (
    campaign_id,
    advertiser_id,
    title,
    description,
    budget,
    campaign_type,
    requirements,
    start_date,
    end_date,
    campaign_status,
    target_market,
    categories,
    keywords
) VALUES (
    gen_random_uuid(),
    'f3f3f5dd-c532-44a4-8a80-bc15a6b7fda9',
    '2024 봄 신상품 홍보 캠페인',
    '새로운 봄 시즌 패션 아이템 홍보를 위한 인플루언서를 찾습니다.',
    1000000,
    'INSTAGRAM',
    ARRAY['제품 리뷰 포스트 1회', '스토리 3회'],
    NOW(),
    NOW() + INTERVAL '30 days',
    'PUBLISHED',
    'KR',
    '["패션", "뷰티", "라이프스타일"]'::jsonb,
    '["봄패션", "신상", "트렌드"]'::jsonb
);

-- 인플루언서 제안(proposals) 데이터 삽입
INSERT INTO influencer_proposals (
    proposal_id,
    influencer_id,
    title,
    description,
    desired_budget,
    target_market,
    content_type,
    expected_deliverables,
    available_period_start,
    available_period_end,
    categories,
    keywords,
    portfolio_samples,
    is_negotiable,
    preferred_industry,
    proposal_status
) VALUES 
(
    'b2d7c3e4-9f8a-4b1d-8e2f-123456789abc',
    '5aab23d6-6fca-421d-adcb-404549b4f295',
    '인스타그램 패션 콘텐츠 제작 제안',
    '10만 팔로워를 보유한 패션 인플루언서의 스타일리시한 콘텐츠 제작 제안',
    500000,
    'KR',
    'INSTAGRAM_POST',
    ARRAY['인스타그램 피드 포스트 2개', '스토리 3개', '릴스 1개'],
    NOW(),
    NOW() + INTERVAL '30 days',
    ARRAY['패션', '뷰티', '라이프스타일'],
    ARRAY['패션스타일', '데일리룩', '트렌드'],
    ARRAY['https://example.com/portfolio1', 'https://example.com/portfolio2'],
    true,
    ARRAY['패션', '뷰티'],
    'PUBLISHED'
),
(
    'c3e4d5f6-a1b2-4c3d-9e8f-987654321def',
    '5aab23d6-6fca-421d-adcb-404549b4f295',
    '유튜브 뷰티 제품 리뷰 제안',
    '전문적인 뷰티 제품 리뷰 및 메이크업 튜토리얼 제작',
    800000,
    'BOTH',
    'YOUTUBE_VIDEO',
    ARRAY['10분 이상 상세 리뷰 영상', '숏폼 하이라이트 2개'],
    NOW() + INTERVAL '5 days',
    NOW() + INTERVAL '45 days',
    ARRAY['뷰티', '메이크업'],
    ARRAY['뷰티리뷰', '메이크업튜토리얼'],
    ARRAY['https://example.com/beauty1', 'https://example.com/beauty2'],
    true,
    ARRAY['화장품', '스킨케어'],
    'DRAFT'
);

-- 제안 신청(proposal applications) 데이터 삽입
INSERT INTO proposal_applications (
    application_id,
    proposal_id,
    advertiser_id,
    message,
    proposal_application_status,
    applied_at,
    updated_at
) VALUES 
(
    '0732e631-9f50-493f-b5cc-154fd617c159',
    'e4ab53f8-5739-482c-88bd-67d792a493b9',
    'f3f3f5dd-c532-44a4-8a80-bc15a6b7fda9',
    '귀하의 패션 콘텐츠 스타일이 저희 브랜드와 잘 맞을 것 같습니다. 협업하고 싶습니다.',
    'PENDING',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
),
(
    '0732e631-9f50-493f-b5cc-154fd617c159',
    'e4ab53f8-5739-482c-88bd-67d792a493b9',
    'f3f3f5dd-c532-44a4-8a80-bc15a6b7fda9',
    '새로운 시즌 컬렉션 홍보를 위해 협업을 제안드립니다. 예산 협의 가능합니다.',
    'ACCEPTED',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '3 days'
);
