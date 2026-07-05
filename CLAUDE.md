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

## 개발 명령어

```bash
npm run dev            # 개발 서버
npm run build           # 프로덕션 빌드
npm run test            # 테스트 실행 (Jest)
npm run lint             # 린트 검사
npm run type-check       # tsc --noEmit
npm run fetch-news       # RSS 수집 (scripts/fetch-llm-news.ts)
npm run generate-news    # 다이제스트 생성 (scripts/generate-news.ts, ANTHROPIC_API_KEY 필요)
```

## Known Issues (프로젝트 고유)

- `/news/topic/[tag]` 440개 중 다수가 기사 1건뿐인 thin content — 기사 수 < `MIN_TAG_ARTICLE_COUNT_FOR_INDEX`(2)인 태그는 noindex + sitemap 제외 처리(`src/lib/news.ts` `isThinTag`).
- CI(`auto-news.yml`)의 Supabase 시크릿(`SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`)은 GitHub repo secrets 등록 여부를 owner가 별도 확인해야 함.
- `/api/indexnow`, `/api/subscribe` 등 cron/자동화 엔드포인트는 `CRON_SECRET` 미설정 시 인증 없이 열려 있음 — rate limit은 코드 레벨로 항상 적용되지만, 프로덕션에는 `CRON_SECRET`을 Vercel 환경변수로 설정 권장.

---

*전역 설정 참조: `workspace/CLAUDE.md`*
