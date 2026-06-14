# LLM 뉴스 블로그 — Phase 2·3 (수집·생성·발행 + 5h 자동화) 계획

> Phase 1(사이트/콘텐츠 레이어)은 PR #1로 완료. 이 문서는 후속 Phase 2·3.
> Phase 2의 **생성** 단계는 스케줄된 Claude가 런타임에 수행(유료 API 0) — 결정적 스크립트가 아니라 LLM 작업이므로, 수집/발행(rule-base)만 스크립트화하고 생성은 스킬/프롬프트로 규정한다.

**Goal:** RSS로 LLM 소식을 수집 → 스케줄된 Claude가 한국어+영어 기사로 재작성 → 마크다운 발행·커밋·배포까지 무인 루프(5시간 주기).

**Tech Stack:** Node 스크립트(rule-base 수집/발행) + Phase 1 로더(`getAllNews`/`getNewsBySlug`) 재사용 + 스케줄드 Claude(`/schedule` 클라우드 루틴).

---

## Phase 2 — 수집 + 생성 + 발행

### Task 1: 피드 목록 + 수집 스크립트 (rule-base)
**Files:** `scripts/feeds.json`, `scripts/fetch-llm-news.mjs`, `scripts/_published.json`(상태)
- `feeds.json`: 1차 소스 — OpenAI Blog, Anthropic News, Google DeepMind, Meta AI, Mistral, Hugging Face Blog, Hacker News(AI 키워드 필터). 각 `{name, url, lang_hint}`.
- `fetch-llm-news.mjs`:
  1. 각 피드 fetch + 파싱(RSS/Atom; `fast-xml-parser`).
  2. **중복 제거**: 원문 URL을 `_published.json`(이미 발행한 URL 집합) + 기존 `getNewsSlugs()`와 대조.
  3. 신규 항목을 `scripts/worklist.json`으로 출력: `[{source, url, title, published_at, raw_excerpt}]`.
  4. 신규 0건이면 worklist는 빈 배열(→ 생성 단계가 에버그린으로 전환).
- 단위 테스트: 피드 파싱 + 중복제거 로직(픽스처 기반).

### Task 2: 에버그린 백로그 (idle 방지)
**Files:** `src/content/_backlog.json`
- 구매의도·고CPM 주제 큐: "ChatGPT vs Claude vs Gemini 비교", "AI 코딩툴 가이드", 용어 심화 등.
- worklist가 비면 생성 단계가 백로그에서 1개 소진.

### Task 3: 생성 스킬/프롬프트 (스케줄된 Claude가 실행)
**Files:** `scripts/GENERATION_PROMPT.md` (런타임 Claude 지침)
- 입력: `worklist.json`(없으면 `_backlog.json`).
- 각 항목 → **한국어+영어 기사 쌍** 생성(요약+큐레이션+맥락 해설 = value-add). Phase 1 frontmatter 계약 준수(`title/lang/date/slug/summary/tags/sources`), `src/content/news/<lang>/YYYY-MM-DD-<slug>.md`로 기록.
- **품질 가드**: 원문 복붙 금지, 출처 명시, 최소 단어수, 창당 발행 상한(예: 3건).
- 발행한 URL을 `_published.json`에 추가.
- (연계 후속) trend-radar의 인기 키워드를 주제 힌트로 사용 → 검색 트렌드 기반 기사(트렌드재킹 SEO).

### Task 4: 발행 스크립트 (rule-base)
**Files:** `scripts/publish.mjs`
- `git add src/content/news scripts/_published.json` → 커밋(`feat(news): auto-publish N articles`) → 푸시 → Vercel 자동 배포(ISR/SSG 재빌드).
- 실패 시 로그 + 비차단.

---

## Phase 3 — 5시간 자동화

### Task 5: 스케줄러
- **1순위**: `/schedule` 클라우드 루틴(cron `0 */5 * * *`) — 매 창마다:
  `node scripts/fetch-llm-news.mjs` → Claude가 `GENERATION_PROMPT.md` 실행 → `node scripts/publish.mjs`.
- **대안**: 로컬 cron + `claude -p`(PC 상시 가동).
- 토큰 소진 시 다음 창 자동 재개. 실패는 로그 + 다음 주기.

### Task 6: 모니터링
- 발행 로그(`scripts/_runlog.jsonl`) + 주 1회 요약.

---

## 🔴 사람이 해야 할 단계
1. `/schedule` 클라우드 루틴 등록(또는 로컬 cron) — 5h 주기.
2. (선택) 피드 목록 조정.
3. AdSense: 글 누적(2~4주) 후 사이트 심사 제출.
4. 도메인 연결 + `BASE_URL` 갱신.

## 검증 게이트(각 스크립트)
`tsc --noEmit`(있으면) + 단위테스트 + `npm run build`(콘텐츠 추가 후 prerender 확인).

## 연계 (Phase 4, TBD)
trend-radar 인기 키워드 → ai-guide 기사 주제 자동 선정 = 검색 트렌드 기반 콘텐츠로 유입 극대화.
