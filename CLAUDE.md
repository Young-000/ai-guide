# AI Guide

AI 도구 활용 가이드 + AI·LLM 뉴스 미디어 (aiwire.news)

## Overview

| 항목 | 값 |
|------|-----|
| 배포 URL | https://aiwire.news (커스텀 도메인, Vercel) |
| Supabase | 사용 (P2 비게임 프로젝트, `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`) — 뉴스레터 구독(subscribers) + trending-seed 저장 |
| 브랜치 | main (직접 작업) |
| 완성도 | 뉴스 다이제스트(자동 생성/발행) + 상황 기반 추천 피벗 모두 live |

## 기술 스택

- Next.js 14.2 + React 18 + TypeScript
- Tailwind CSS
- Jest + Testing Library
- Anthropic SDK (`scripts/generate-news.ts` — 뉴스 다이제스트 자동 생성)
- Supabase (`@supabase/supabase-js` — 구독자 저장, trending 시드)

## 프로젝트 구조

```
src/
├── app/              # Next.js App Router
│   ├── (site)/       # 메인 사이트: compare/glossary/situations/tools/trends/
│   │                 #   use-cases/tips/faq/news/news/topic/[tag]/...
│   ├── embed/        # iframe 임베드 위젯 (/embed/ai-news)
│   └── api/          # subscribe, indexnow, health
├── components/       # 공유 컴포넌트 (뉴스 JSON-LD, Footer 등)
├── data/             # JSON 데이터 파일
├── lib/              # 유틸리티 (news, sitemap 헬퍼, rate-limit, json-ld 등)
└── types/            # 타입 정의

scripts/
├── fetch-llm-news.ts   # RSS 수집 -> worklist.json
└── generate-news.ts    # Anthropic API로 ko/en 다이제스트 생성 -> src/content/news/
```

자동 발행 파이프라인: `.github/workflows/auto-news.yml` (5시간 간격 cron) — fetch-news -> generate-news -> build check -> commit & push.

## 진행상황

- [x] Next.js App Router 셋업
- [x] AI 도구 카탈로그 / 비교 / 용어 사전 / 인터랙티브 퀴즈 / 트렌드 추적
- [x] 상황 기반 추천 피벗 (live)
- [x] AI·LLM 뉴스 다이제스트 — 자동 수집·생성·발행 (GitHub Actions cron)
- [x] Vercel 배포 (커스텀 도메인 aiwire.news)
- [x] GitHub 원격 저장소 연결 (Young-000/ai-guide)
- [x] Supabase 연동 (구독자, trending 시드)
- [x] **계측 (2026-09-26)** — 봇을 거른 `page_views_human`, 유입원 `site_visits`(세 사이트 공통)
- [x] **기사 맥락 '이 이야기의 흐름'** — 955건 아카이브로 사건의 전개를 잇는다

## 🔴 수익이 0원인 이유 (2026-09-26 실측)

하루 6,000 페이지뷰가 찍히는데 광고 수익이 없다. 원인은 하나로 수렴한다 —
**광고주는 사람에게 입찰한다.**

| 확인한 것 | 상태 |
|---|---|
| 트래픽 | 9/25 17,960뷰인데 상위 6개 경로가 전부 목록 페이지(`/news/topics` 646 …) = 대부분 크롤러 |
| AdSense | `data-ad-status="unfilled"`. 콘솔은 9/12부터 "준비 중", 상태 세부정보는 **비어 있음**(지적사항 없음) |
| AdFit | 승인·작동하지만 **카카오 하우스 광고**로 채워진다 = 외부 광고주 재고 없음 |
| 쿠팡 | 배너 1개(728×90). 2026-09-26부터 클릭을 센다 |

AdSense 승인 기준을 한 줄씩 대조했을 때 우리가 미달하는 항목은 **콘텐츠 고유성** 하나였다
(ads.txt 200 · 법적 페이지 4종 200 · 운영주체 푸터 · 955건 모두 충족). 본문 중앙값이
785자라 외신 1건 요약을 넘지 못한다 — `docs/LESSONS.md` 참조.

**판단의 근거가 되는 숫자**: `search_trends.v_daily_human_visits` (봇 제외 방문).
`page_views` 는 총 트래픽으로 남겨 둔다 — 크롤러 양 자체가 색인 건강도 신호다.

## 개발 명령어

```bash
npm run dev            # 개발 서버
npm run build           # 프로덕션 빌드
npm run test            # 테스트 실행 (Jest)
npm run lint             # 린트 검사
npm run type-check       # tsc --noEmit
npm run fetch-news       # RSS 수집 (scripts/fetch-llm-news.ts)
npm run generate-news    # 다이제스트 생성 (키 있으면 SDK, 없으면 로컬 claude CLI 자동 선택)
npm run publish:local    # 로컬 전체 사이클: fetch → 생성(키리스) → 빌드체크 → 커밋·푸시
```

### 뉴스 발행 백엔드 (API key 불필요)

`generate-news`는 백엔드를 자동 선택한다:
- `ANTHROPIC_API_KEY` 있으면 → Anthropic SDK (CI용)
- 없으면 → 로컬 `claude` CLI(Claude Code 구독 인증) 사용 → **API key 없이 로컬 실행 가능**

로컬 정기 발행은 `npm run publish:local`을 cron/launchd로 스케줄(예: 5시간 주기).
CI(`auto-news.yml`)는 러너에 claude CLI 인증이 없어 여전히 `ANTHROPIC_API_KEY`가 있어야 동작.

## Known Issues (프로젝트 고유)

- `/news/topic/[tag]` — 태그 1,027개 중 652개(64%)가 기사 1건뿐인 thin content. noindex + sitemap 제외에 더해 2026-09-26부터 `/news` 첫 화면과 `/news/topics` 목록에서도 뺀다(`selectListableTopics`). **한 문턱을 세 곳에서 각자 판단하니 화면 두 곳이 빠져 있었다.**
- CI(`auto-news.yml`)의 Supabase 시크릿(`SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`)은 GitHub repo secrets 등록 여부를 owner가 별도 확인해야 함.
- `/api/indexnow`, `/api/subscribe` 등 cron/자동화 엔드포인트는 `CRON_SECRET` 미설정 시 인증 없이 열려 있음 — rate limit은 코드 레벨로 항상 적용되지만, 프로덕션에는 `CRON_SECRET`을 Vercel 환경변수로 설정 권장.

---

*전역 설정 참조: `workspace/CLAUDE.md`*
