-- 캠페인 데이터
INSERT INTO campaigns (
  advertiser_id,
  title,
  description,
  budget,
  status,
  target_market,
  requirements,
  period_start,
  period_end
) VALUES
  (
    'b7be9549-8ff4-47b1-9473-b6d4c85aa784',
    '일본 뷰티 제품 홍보 캠페인',
    '일본의 프리미엄 스킨케어 제품 라인 홍보를 위한 인플루언서를 찾습니다.',
    1000000.00,
    'published',
    'JP',
    '팔로워 10K 이상, 뷰티 분야 전문성 필요',
    '2024-03-01',
    '2024-04-01'
  ),
  (
    'b7be9549-8ff4-47b1-9473-b6d4c85aa784',
    '한국 패션 브랜드 글로벌 캠페인',
    '한국 패션 브랜드의 일본 시장 진출을 위한 프로모션',
    2000000.00,
    'published',
    'BOTH',
    '패션 분야 인플루언서, 인스타그램 활성 계정',
    '2024-03-15',
    '2024-04-15'
  ),
  (
    'b7be9549-8ff4-47b1-9473-b6d4c85aa784',
    '한국 식품 브랜드 홍보',
    '한국 전통 식품의 일본 시장 프로모션',
    1500000.00,
    'draft',
    'KR',
    '요리/식품 관련 콘텐츠 제작 경험 필수',
    '2024-04-01',
    '2024-05-01'
  ),
  (
    'b7be9549-8ff4-47b1-9473-b6d4c85aa784',
    '양국 합작 게임 출시 홍보',
    '한일 합작 모바일 게임 출시 기념 프로모션',
    3000000.00,
    'published',
    'BOTH',
    '게임 스트리밍 경험, 1만 이상 구독자',
    '2024-03-20',
    '2024-04-20'
  ),
  (
    'b7be9549-8ff4-47b1-9473-b6d4c85aa784',
    'K-뷰티 신제품 런칭',
    '신규 K-뷰티 브랜드의 일본 시장 진출',
    2500000.00,
    'closed',
    'JP',
    '뷰티 분야 전문 인플루언서, 일본어 가능자',
    '2024-04-10',
    '2024-05-10'
  );

-- 신청 데이터
INSERT INTO applications (
  campaign_id,
  influencer_id,
  status
) VALUES
  (
    (SELECT campaign_id FROM campaigns LIMIT 1),
    'b7be9549-8ff4-47b1-9473-b6d4c85aa784',
    'pending'
  ),
  (
    (SELECT campaign_id FROM campaigns OFFSET 1 LIMIT 1),
    'b7be9549-8ff4-47b1-9473-b6d4c85aa784',
    'approved'
  ),
  (
    (SELECT campaign_id FROM campaigns OFFSET 2 LIMIT 1),
    'b7be9549-8ff4-47b1-9473-b6d4c85aa784',
    'rejected'
  ),
  (
    (SELECT campaign_id FROM campaigns OFFSET 3 LIMIT 1),
    'b7be9549-8ff4-47b1-9473-b6d4c85aa784',
    'pending'
  ),
  (
    (SELECT campaign_id FROM campaigns OFFSET 4 LIMIT 1),
    'b7be9549-8ff4-47b1-9473-b6d4c85aa784',
    'approved'
  );

-- 알림 데이터
INSERT INTO notifications (
  user_id,
  campaign_id,
  message
) VALUES
  (
    'b7be9549-8ff4-47b1-9473-b6d4c85aa784',
    (SELECT campaign_id FROM campaigns LIMIT 1),
    '새로운 캠페인이 등록되었습니다: 일본 뷰티 제품 홍보'
  ),
  (
    'b7be9549-8ff4-47b1-9473-b6d4c85aa784',
    (SELECT campaign_id FROM campaigns OFFSET 1 LIMIT 1),
    '귀하의 캠페인 신청이 승인되었습니다'
  ),
  (
    'b7be9549-8ff4-47b1-9473-b6d4c85aa784',
    (SELECT campaign_id FROM campaigns OFFSET 2 LIMIT 1),
    '새로운 캠페인 지원자가 있습니다'
  ),
  (
    'b7be9549-8ff4-47b1-9473-b6d4c85aa784',
    (SELECT campaign_id FROM campaigns OFFSET 3 LIMIT 1),
    '캠페인 마감이 임박했습니다'
  ),
  (
    'b7be9549-8ff4-47b1-9473-b6d4c85aa784',
    (SELECT campaign_id FROM campaigns OFFSET 4 LIMIT 1),
    '캠페인 상태가 업데이트되었습니다'
  );