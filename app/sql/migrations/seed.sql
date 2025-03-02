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

-- 공지사항(notifications) 테이블 시드 데이터
INSERT INTO notifications (
    notification_id,
    title,
    content,
    notification_type,
    target_audience,
    is_important,
    is_published,
    admin_id,
    publish_date,
    expiry_date,
    created_at,
    updated_at
) VALUES 
(
    gen_random_uuid(),
    '플랫폼 오픈 안내',
    '안녕하세요, 인플루언서 마케팅 플랫폼이 정식 오픈하였습니다.

본 플랫폼은 한국과 일본의 인플루언서와 광고주를 연결하는 서비스를 제공합니다.

많은 이용 부탁드립니다.',
    'ANNOUNCEMENT',
    'ALL',
    true,
    true,
    '2a831472-b6de-4cea-a4a4-8ef7520262ea', -- 관리자 ID (실제 관리자 ID로 변경 필요)
    NOW() - INTERVAL '7 days',
    NOW() + INTERVAL '30 days',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days'
),
(
    gen_random_uuid(),
    '광고주를 위한 안내사항',
    '광고주 여러분께,

캠페인 등록 시 상세한 정보를 입력해주시면 더 많은 인플루언서들의 관심을 받을 수 있습니다.

특히 예산, 기간, 요구사항 등을 명확히 기재해 주시기 바랍니다.',
    'ANNOUNCEMENT',
    'ADVERTISERS',
    true,
    true,
    '2a831472-b6de-4cea-a4a4-8ef7520262ea', -- 관리자 ID
    NOW() - INTERVAL '5 days',
    NOW() + INTERVAL '60 days',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
),
(
    gen_random_uuid(),
    '인플루언서를 위한 안내사항',
    '인플루언서 여러분께,

프로필 정보를 최대한 상세하게 작성하시면 광고주들에게 더 많은 관심을 받을 수 있습니다.

포트폴리오 및 과거 협업 사례를 충실히 기재해 주시기 바랍니다.',
    'ANNOUNCEMENT',
    'INFLUENCERS',
    true,
    true,
    '2a831472-b6de-4cea-a4a4-8ef7520262ea', -- 관리자 ID
    NOW() - INTERVAL '5 days',
    NOW() + INTERVAL '60 days',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
),
(
    gen_random_uuid(),
    '시스템 점검 안내',
    '안녕하세요, 시스템 점검 안내드립니다.

다음 일정으로 시스템 점검이 예정되어 있습니다:
- 일시: 2024년 3월 15일 02:00 ~ 05:00 (KST)
- 영향: 서비스 일시 중단

점검 시간 동안에는 서비스 이용이 제한될 수 있으니 양해 부탁드립니다.',
    'SYSTEM',
    'ALL',
    true,
    true,
    '2a831472-b6de-4cea-a4a4-8ef7520262ea', -- 관리자 ID
    NOW() - INTERVAL '2 days',
    NOW() + INTERVAL '5 days',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
),
(
    gen_random_uuid(),
    '새로운 캠페인 기능 추가',
    '새로운 캠페인 기능이 추가되었습니다!

이제 캠페인 등록 시 다음과 같은 기능을 활용하실 수 있습니다:
- 다중 이미지 업로드
- 상세 타겟팅 설정
- 성과 측정 도구

자세한 내용은 도움말 페이지를 참고해 주세요.',
    'CAMPAIGN',
    'ALL',
    false,
    true,
    '2a831472-b6de-4cea-a4a4-8ef7520262ea', -- 관리자 ID
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '30 days',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
);

-- 공지사항 읽음 상태(notification_reads) 테이블 시드 데이터
INSERT INTO notification_reads (
    notification_id,
    user_id,
    read_at
) VALUES 
(
    (SELECT notification_id FROM notifications WHERE title = '플랫폼 오픈 안내' LIMIT 1),
    '5aab23d6-6fca-421d-adcb-404549b4f295', -- 사용자 ID
    NOW() - INTERVAL '6 days'
),
(
    (SELECT notification_id FROM notifications WHERE title = '인플루언서를 위한 안내사항' LIMIT 1),
    '5aab23d6-6fca-421d-adcb-404549b4f295', -- 사용자 ID
    NOW() - INTERVAL '4 days'
);
