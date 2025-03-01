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

-- 제안 데이터
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
    keywords
) VALUES (
    gen_random_uuid(),
    '5aab23d6-6fca-421d-adcb-404549b4f295',
    '패션 브랜드 협업 제안',
    '10만 팔로워 대상 인스타그램 패션 콘텐츠 제작',
    800000,
    'KR',
    'INSTAGRAM_POST',
    ARRAY['인스타그램 포스트 2회', '스토리 5회'],
    NOW(),
    NOW() + INTERVAL '60 days',
    ARRAY['패션', '뷰티'],
    ARRAY['패션스타일', '데일리룩']
);

-- 신청 데이터
INSERT INTO applications (
    application_id,
    campaign_id,
    influencer_id,
    application_status,
    message
) VALUES (
    gen_random_uuid(),
    (SELECT campaign_id FROM campaigns LIMIT 1),
    '5aab23d6-6fca-421d-adcb-404549b4f295',
    'PENDING',
    '해당 캠페인에 참여하고 싶습니다. 제 채널의 타겟층과 잘 맞을 것 같습니다.'
);
