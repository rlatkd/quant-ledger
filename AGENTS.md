<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 프로젝트 개요
성균관대학교 퀀트응용경제학과 총무부용 영수증 관리 웹앱.
영수증 사진을 찍거나 앨범에서 불러와 OCR로 파싱 후 저장/조회하는 서비스.

# 기술 스택
- Next.js 16 / Tailwind CSS v4
- Supabase (PostgreSQL)
- Google Vision API (OCR)
- Gemini Flash API (텍스트 파싱)
- Vercel 배포

# 라우트 구조
- `/` : 홈 대시보드 (이번달 총지출, 최근 영수증 목록)
- `/upload` : 촬영/업로드 (카메라 or 앨범)
- `/receipts` : 영수증 목록 (날짜 필터)
- `/receipts/[id]` : 영수증 상세 (원본 이미지, 항목 테이블, 수정/삭제)

# 데이터 처리 흐름
1. 이미지 선택 → 2. API Route로 전송 → 3. Google Vision OCR → 4. Gemini Flash 파싱 → 5. 사용자 확인/수정 → 6. Supabase 저장

# DB 스키마
receipts: id, image_url, store_name, receipt_date, total_amount, raw_text, created_at
receipt_items: id, receipt_id(FK), menu_name, quantity, unit_price, total_price

# 환경변수
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
GOOGLE_VISION_API_KEY, GEMINI_API_KEY

# MVP 제외
로그인/인증, 권한 관리
