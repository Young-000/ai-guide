# AI Guide - 진행 기록

## 현재 상태

- 2026-06-17 `58ef251` feat: growth levers + UX overhaul — trend-jacking widget, IndexNow, embed widget, programmatic SEO, subscribe, internal links; home hybrid redesign, (site) route group, visual consistency
- 2026-06-16 `4028d77` feat(news): 3개 AI 다이제스트 발행 (2026-06-16)


- 2026-06-16 `adc1631` feat: P0+P1 fixes — brand AIWire, real ad slots, CTA/nav, h1, /en lang, NewsArticle JSON-LD+image, OG image, font opt, AdFit unit, Vercel Analytics
- 2026-06-16 `03ae25e` feat(news): 3개 AI 다이제스트 발행 2026-06-16
- 2026-06-16 `bb466e9` feat(news): 3개 AI 다이제스트 발행 (2026-06-16)


- 2026-06-16 `916f28b` content: deepen + refresh all guide pages to 2026-06
- 2026-06-16 `c2ee9c6` content: refresh AI guide data to 2026-06 model lineup
- 2026-06-16 `b23587e` docs: 대기 중인 사장님 액션 기록 (ESP·Amplitude·제휴·자동게시·AdFit)
- 2026-06-16 `1080c2d` feat(pseo): add /news/topics to sitemap
- 2026-06-16 `1271ee0` feat(pseo): add 다른 주제 cross-links on topic pages
- 2026-06-16 `b7157a8` feat(pseo): link to topics hub from /news page
- 2026-06-16 `eea9aeb` feat(pseo): add 주제 nav link in Header and Footer
- 2026-06-16 `5f7201a` feat(pseo): add /news/topics hub page with tag counts
- 2026-06-16 `be160a5` feat(news): add getTagsWithCount helper + unit tests
- 2026-06-16 `63554b6` feat(aeo): add llms.txt, llms-full.txt, and structured data for answer engine optimization
- 2026-06-16 `99f9187` feat(share): add ShareRow component + wire into NewsArticleView; refactor rss builder to src/lib/rss.ts
- 2026-06-16 `9770e4c` feat(meta): add siteName + Twitter card to article page metadata
- 2026-06-16 `7627396` feat(meta): add metadataBase and RSS discovery link to root layout
- 2026-06-16 `50bf846` feat(rss): add RSS 2.0 feeds at /feed.xml and /en/feed.xml
- 2026-06-16 `60e0ed1` feat(share): add buildShareText pure helper with tests
- 2026-06-16 `c821d0c` feat(analytics): add Amplitude product analytics
- 2026-06-16 `e11dec2` feat(affiliate): add affiliate revenue layer with config, disclosure, and sponsored rel
- 2026-06-16 `2b2c96a` feat(subscribe): wire SubscribeBox to POST /api/subscribe with pending/success/error states
- 2026-06-16 `7bed229` feat(api): add POST /api/subscribe endpoint with email validation and Supabase insert
- 2026-06-16 `f2adf6f` chore: install @supabase/supabase-js and add service client factory
- 2026-06-16 `3dd0052` feat: /map 지식맵 페이지 + 클라이언트 래퍼(ssr:false) + 네비 링크
- 2026-06-16 `8fb5a0f` feat: KnowledgeMap force-directed graph component
- 2026-06-16 `7012bf7` feat: graph data builder with unit tests
- 2026-06-16 `fd5d515` chore: add react-force-graph-2d
- 2026-06-16 `6ab1924` feat: redesign AIWire as editorial news media site


- 완성도: 85%
- 상태: feature 브랜치에서 상황 기반 피벗 진행 중 (18일간 방치)

## 마일스톤

### v1.0 -- 도구 카탈로그 (완료)

- [x] Next.js 14.2 App Router 프로젝트 셋업
- [x] AI 도구 카탈로그 (도구 목록, 카테고리 분류)
- [x] 도구 비교 기능 (비교표 UI)
- [x] 용어 사전 (AI 용어 해설)
- [x] 인터랙티브 퀴즈 (AI 지식 테스트)
- [x] 트렌드 추적 (AI 업계 동향)
- [x] Vercel 배포 완료
- [x] 기본 테스트 (Jest + Testing Library)

### v1.1 -- 상황 기반 피벗 (진행 중)

- [ ] 상황별 AI 도구 추천 시스템
- [ ] 사용자 시나리오 기반 UI 재설계
- [ ] feature/situation-based-pivot 브랜치 작업 완료 및 merge

### v1.2 -- 인프라 정비 (미시작)

- [ ] GitHub 원격 저장소 설정
- [ ] CI/CD 파이프라인 구축
- [ ] 테스트 커버리지 확대

## 작업 이력

| 날짜 | 작업 내용 | 비고 |
|------|----------|------|
| 2026-01 초 | 프로젝트 초기화, 기본 기능 구현 | Next.js App Router |
| 2026-01 중 | 도구 비교, 퀴즈, 트렌드 기능 추가 | |
| 2026-01-26 | 상황 기반 피벗 브랜치 시작 | feature/situation-based-pivot |
| 2026-01-26 | 마지막 커밋 | 이후 방치 |

## 다음 단계

1. feature/situation-based-pivot 브랜치 상태 확인 및 작업 재개
2. 상황 기반 추천 기능 완성
3. main으로 merge
4. GitHub 원격 저장소 설정

---

*마지막 업데이트: 2026-02-13*
