# 퀀트응용경제학과 장부 앱

# 성균관대학교 마크
https://www.skku.edu/skku/about/symbol/symbol_01.do

## 프로젝트 개요
학교 총무부에서 사용할 영수증 관리 웹앱.
가게에서 영수증 사진을 찍거나 앨범에서 불러와서
정해진 형식으로 저장하고 조회하는 서비스.

## 기술 스택
- 프레임워크: Next.js
- 스타일: Tailwind CSS
- DB: Supabase (PostgreSQL)
- OCR: Google Vision API
- 파싱: Gemini Flash API
- 배포: Vercel

## 데이터 처리 흐름
1. 사용자가 카메라로 촬영 or 앨범에서 이미지 선택
2. 이미지를 서버(Next.js API Route)로 전송
3. Google Vision API로 텍스트 추출
4. 추출된 텍스트를 Gemini Flash로 구조화 파싱
5. 파싱 결과를 사용자에게 보여줌 (확인/수정 단계)
6. 사용자 확인 후 Supabase에 저장

## DB 스키마
-- 영수증 원본
receipts
- id (UUID)
- image_url (TEXT)
- store_name (TEXT)
- receipt_date (DATE)
- total_amount (INTEGER)
- raw_text (TEXT)
- created_at (TIMESTAMP)

-- 항목 상세
receipt_items
- id (UUID)
- receipt_id (UUID, FK)
- menu_name (TEXT)
- quantity (INTEGER)
- unit_price (INTEGER)
- total_price (INTEGER)

## 화면 목록 (5개)
1. 홈/대시보드 - 이번달 총지출, 최근 영수증 목록
2. 촬영/업로드 - 카메라 or 앨범 선택
3. 파싱 결과 확인 - 수정 가능, 합계 불일치 경고, 저장/다시찍기
4. 영수증 목록 - 날짜 필터, 상호명/날짜/총액
5. 영수증 상세 - 원본 이미지, 항목별 테이블, 수정/삭제

## 화면 흐름
홈 → [+ 추가] → 촬영/업로드 → 파싱확인 → 저장 → 목록
홈 → [목록] → 영수증 목록 → 영수증 상세

## MVP 제외 항목
- 로그인/인증
- 권한 관리

## 비용
- Vercel 무료티어
- Supabase 무료티어
- Google Vision API 무료티어 (월 1,000건)
- Gemini Flash 무료티어
= 거의 0원