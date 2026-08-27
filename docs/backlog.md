# BACKLOG — ai-guide 야간 자율 사이클

- [x] @testing-library/user-event 설치 및 SubscribeBox 테스트 복구 (근거: 패키지 미설치로 type-check·test 단계 RED — 야간 사이클 GREEN 달성 블로커)
- [x] 뉴스 섹션·토픽 페이지에 BreadcrumbList JSON-LD 추가 (근거: /news/section/[section] · /news/topic/[tag] 페이지에 구조화 데이터 미적용, GSC 빵부스러기 마크업 누락)
- [x] 날짜별 아카이브 라우트 /news/archive/[year]/[month] 구현 (근거: 토픽 페이지는 있으나 월별 아카이브 URL 부재로 SEO long-tail 노출 기회 미확보) — 2026-07-11 머지

## 2026-07-05 주간 PM 리필 (우선순위순)

- [x] 서버사이드 방문 카운터를 Supabase `search_trends` 스키마(전용 테이블, public 금지)에 적재 — 뉴스 상세/섹션/토픽 페이지 조회 시 경로별 일자 카운트 upsert (근거: 이번 주 PM 사이클이 북극성 트래픽 지표를 GA4 MCP 부재로 실측 불가 → 측정 블로커. 다음 사이클이 결정론적으로 트래픽 추이를 읽게 하는 것이 최우선. verify: 로컬에서 페이지 GET → 테이블 row 증가 확인) — 2026-08-27 검증완료 (PageViewTracker+/api/pageview+upsert_page_view 전부 구현됨·12 tests PASS)
- [x] 뉴스 섹션·토픽 페이지에 BreadcrumbList JSON-LD 추가 (근거: 기존 백로그 잔여 — 구조화 데이터 미적용으로 GSC 빵부스러기 마크업 누락. verify: 페이지 소스에 `@type":"BreadcrumbList"` 존재 + 빌드 GREEN)
- [ ] 뉴스 상세 페이지에 "관련 기사" 내부 링크 블록 추가 (같은 섹션/토픽 3~5건) (근거: thin tag 이슈(기사 1건 태그 다수) 기록됨 — 내부 링크로 크롤 깊이·색인성 개선, 고립 페이지 감소. verify: 상세 페이지에 관련 링크 렌더 + 테스트)
- [ ] SubscribeBox 노출 위치 감사 — 홈뿐 아니라 트래픽 유입원인 뉴스 상세 페이지 하단에도 배치 (근거: 구독자 0명, 전환 퍼널 진입점이 저트래픽 홈에만 있을 가능성. verify: 뉴스 상세 페이지에 SubscribeBox 렌더 확인)
- [ ] sitemap 커버리지 감사 스크립트 — 뉴스(346)·섹션·토픽·정적(32) 전 페이지가 sitemap.xml에 포함되는지 카운트 대조, 누락 시 경고 (근거: SEO=비즈니스, 커버리지가 북극성. 결정론적 검증 필요. verify: 스크립트가 sitemap URL 수 vs 실제 페이지 수 리포트)
- [x] 날짜별 아카이브 라우트 /news/archive/[year]/[month] + 인덱스 페이지 구현 (근거: 기존 백로그 잔여 — 월별 아카이브 URL 부재로 long-tail 노출 미확보. sitemap에도 추가. verify: 라우트 200 + sitemap 포함) — 2026-07-11 머지 (/news/archive 인덱스 + [year]/[month] 라우트 + sitemap 등재)
- [ ] 뉴스 상세 동적 OG 이미지(/opengraph-image) 생성 — 제목·섹션·날짜 렌더 (근거: 소셜/메신저 공유 시 미리보기 이미지로 CTR 개선, 현재 정적/기본 OG 추정. verify: /news/[slug]/opengraph-image 200 + 이미지 응답)
- [ ] WebSite + SearchAction JSON-LD(sitelinks 검색창) 홈에 추가 (미적용 시) (근거: 구글 sitelinks 검색창 노출로 브랜드 SERP 강화. verify: 홈 소스에 `SearchAction` 존재)

## 2026-07-12 주간 PM 리필 (우선순위순)

> 이번 주 핵심 관찰: 지난주 최우선이던 "서버사이드 트래픽 카운터"가 야간 사이클에서 미착수(저위험 SEO 라우트만 머지). PM이 DDL 블로커를 직접 제거함 — `search_trends.page_views(path, day, count)` 테이블 생성 완료(RLS on, service_role 전용). 이제 코드 배선만 남았으므로 최우선. 태스크는 DB/인프라 얽힘을 제거하고 "코드만 붙이면 되는" 크기로 쪼갬.

- [x] **트래픽 카운터 코드 배선** — 뉴스 상세/섹션/토픽 서버 컴포넌트 렌더 시 `search_trends.page_views`에 upsert(경로 + KST 일자, `on conflict(path,day) do update count+1`). 테이블은 이미 존재(PM이 생성). `src/lib/supabase.ts`의 service_role 클라이언트 사용, KST 날짜는 `Asia/Seoul` 기준 계산(UTC 자정 버그 주의). (근거: 지난주 최우선 미착수 태스크, 측정 블로커의 마지막 조각. verify: 로컬 `next dev`로 /news/[slug] GET → `select * from search_trends.page_views` row 증가 확인) — 2026-08-27 완료 확인
- [ ] **SubscribeBox를 뉴스 상세 페이지 하단에 배치** — 홈에만 있는 구독 진입점을 실제 트래픽 유입원(뉴스 상세)로 확장. (근거: 구독자 8주+ 연속 0건, 콘텐츠 엔진(406파일)은 정상 → 병목은 발행이 아니라 전환 진입점 위치. verify: /news/[slug] 렌더에 SubscribeBox 존재 + 테스트)
- [ ] **뉴스 상세 "관련 기사" 내부 링크 블록** (같은 섹션/토픽 3~5건) (근거: thin tag(기사 1건 태그 다수) + 고립 페이지 이슈, 내부링크로 크롤 깊이·색인성 개선. verify: 상세 페이지에 관련 링크 렌더 + 테스트)
- [ ] **sitemap 커버리지 감사 스크립트** `scripts/verify-sitemap.ts` (npm run verify:sitemap) — sitemap.ts가 산출하는 URL 수 vs 실제 콘텐츠(뉴스 406/2=203 슬러그·섹션·토픽·정적) 대조, 누락 경고 + 종료코드. (근거: SEO=비즈니스, 커버리지가 북극성인데 결정론적 검증 부재. verify: 스크립트 실행 시 URL 카운트 리포트 + 누락 0 시 exit 0)
- [ ] **WebSite + SearchAction JSON-LD를 홈에 추가** (미적용 시) (근거: 구글 sitelinks 검색창 노출로 브랜드 SERP 강화, 저위험. verify: 홈 소스에 `"@type":"WebSite"` + `SearchAction` 존재 + 테스트)
- [ ] **뉴스 상세 동적 OG 이미지** (/news/[slug]/opengraph-image) — 제목·섹션·날짜 렌더 (근거: 메신저/소셜 공유 CTR, 현재 기본 OG 추정. verify: opengraph-image 라우트 200 + image/png 응답)
- [ ] **/news/topics 인덱스에 태그별 기사 수 노출 + noindex 태그 시각 구분** (근거: thin tag 처리(`isThinTag`)가 sitemap엔 반영되나 사용자/크롤러 탐색 UI엔 미반영 — 색인 가능 태그로 크롤 유도. verify: /news/topics에 기사수 배지 렌더 + 테스트)
- [ ] **RSS/피드 최신성 검증 스크립트** — `src/lib/rss.ts` 출력이 최근 발행 N건을 포함하는지 확인(발행 파이프라인 회귀 방지). (근거: 콘텐츠 엔진이 유일하게 도는 성장 동력 — 피드 깨지면 조용히 유입 손실. verify: 스크립트가 feed item 수 + 최신 pubDate 리포트)

## 2026-07-19 주간 PM 리필 (우선순위순)

> 🔴 이번 주 최대 발견: **콘텐츠 엔진이 2026-07-11 이후 8일간 완전 정지** — 유일하게 도는 성장 동력이 조용히 죽어 있었다. 진단: `auto-news.yml` CI가 `ANTHROPIC_API_KEY` 시크릿에 의존하는데 부재/만료로 generate 단계에서 매 실행 30~40초 만에 실패(fetch-news는 로컬 정상, 8건 수집 확인). GitHub Actions run 전부 failure. → PM이 지난주 교훈대로 직접 블로커 제거: 키리스 로컬 발행(`npm run generate-news`, `claude` CLI 인증)으로 3건 발행 복구 착수. 하지만 CI 시크릿 의존은 재발 위험 → 이번 리필의 최우선은 **발행을 CI 시크릿에서 영구 분리**. 측정 카운터는 2주 연속 야간 사이클이 미착수 → 코드 크기를 더 잘게 쪼갠다.
>
> ⚠️ SUNSET 트립와이어(대표 인지용): 구독 aiwire = 9주+ 연속 0건, page_views 측정 0(미배선). 단 (a)엔진이 8일 전까지 정상 가동했고 (b)측정을 한 번도 켜본 적 없어 트래픽 실측 부재 → 아직 회생불가 판정 근거 없음. **엔진 복구 + 카운터 배선 후 2~3주 실측**했는데도 page_views near-zero·구독 0이면 다음 사이클에서 SUNSET_GATE 상신.

- [ ] **발행 파이프라인을 CI 시크릿에서 영구 분리 — 로컬 keyless launchd 크론** (`npm run publish:local` 5시간 주기). CLAUDE.md가 이미 의도한 경로(러너엔 claude CLI 인증 없음 → CI는 구조적으로 키 의존). launchd plist 작성 + 로드 + 1회 수동 트리거 로그 확인. auto-news.yml은 백업으로 남기되 실패가 조용하지 않게 실패 시 Slack 알림 스텝 추가. (근거: 엔진이 8일 죽어도 아무도 몰랐음 — 사일런트 블리드. 성장 동력의 단일 실패점 제거가 최우선. verify: launchd 등록 확인 + 수동 실행 시 src/content/news에 신규 파일 생성 + 로그)
- [ ] **auto-news CI 실패 가시화** — auto-news.yml에 `if: failure()` Slack/webhook 알림 스텝 추가(엔진 죽으면 즉시 채널 알림). (근거: 이번 사고의 근본 원인은 "실패가 조용했다" — 8일간 감지 0. verify: 워크플로 실패 시 알림 발송 경로 존재, 성공 시 무발송)
- [x] **트래픽 카운터 코드 배선(3주째 이월·최우선 유지)** — 뉴스 상세 서버 컴포넌트 렌더 시 `search_trends.page_views`에 upsert(경로+KST일자, `on conflict(path,day) do update count+1`). 테이블 이미 존재(비파괴, 게이트 아님). `src/lib/supabase.ts` service_role 클라이언트, KST는 `Asia/Seoul`. **범위 축소: 우선 뉴스 상세 1개 라우트만** 배선(섹션·토픽은 후속). (근거: 측정 블로커의 마지막 조각, 2주 연속 야간 미착수 — 크기를 라우트 1개로 줄임. verify: 로컬 `next dev`로 /news/[slug] GET → `select count(*) from search_trends.page_views` ≥1) — 2026-08-27 완료 확인
- [ ] **SubscribeBox를 뉴스 상세 페이지 하단에 배치** — 홈에만 있는 구독 진입점을 실제 트래픽 유입원(뉴스 상세)로 확장. (근거: 구독 9주+ 연속 0건, 병목은 발행량이 아니라 전환 진입점 위치. verify: /news/[slug] 렌더에 SubscribeBox 존재 + 테스트)
- [ ] **뉴스 상세 "관련 기사" 내부 링크 블록** (같은 섹션/토픽 3~5건) (근거: thin tag·고립 페이지 이슈, 내부링크로 크롤 깊이·색인성 개선. verify: 상세 페이지에 관련 링크 렌더 + 테스트)
- [ ] **sitemap 커버리지 감사 스크립트** `scripts/verify-sitemap.ts` (npm run verify:sitemap) — sitemap.ts 산출 URL 수 vs 실제 콘텐츠 대조, 누락 경고 + 종료코드. (근거: SEO=비즈니스, 커버리지가 북극성인데 결정론 검증 부재. verify: URL 카운트 리포트 + 누락 0 시 exit 0)
- [ ] **WebSite + SearchAction JSON-LD를 홈에 추가**(미적용 시) (근거: sitelinks 검색창 노출로 브랜드 SERP 강화, 저위험. verify: 홈 소스에 `"@type":"WebSite"` + `SearchAction` 존재 + 테스트)
- [ ] **뉴스 상세 동적 OG 이미지** (/news/[slug]/opengraph-image) — 제목·섹션·날짜 렌더 (근거: 메신저/소셜 공유 CTR. verify: opengraph-image 라우트 200 + image/png 응답)

## 2026-08-02 주간 PM 리필 (우선순위순)

> 🔴 이번 주 최대 발견: **콘텐츠 엔진은 07-29 복구돼 정상 발화(7일 13커밋 생성·커밋)인데 origin push가 07-29부터 막혀 라이브 미반영.** 근본 원인 = 이 머신의 GitHub push 자격증명 전부 만료(gh 토큰 invalid + SSH publickey 거부 + keychain에 github.com 없음). `git push`가 매 크론 조용히 실패해도 로컬 로그는 `✓ written`으로 초록. → LESSONS 07-29 "라이브가 안 바뀌면 실패"의 3번째 변종(생성 OK·커밋 OK·**push FAIL**). **push 자격증명 복구는 순수 오너 조치**(`docs/PENDING-OWNER-ACTIONS.md` 최상단 🔴🔴, 옵션 A: CI에 `ANTHROPIC_API_KEY` / 옵션 B: `gh auth login`). 이 게이트가 열려 있는 한 야간 사이클 산출물의 라이브 반영 0.
>
> ⚠️ SUNSET 트립와이어(대표 인지용): aiwire 구독 = 10주+ 연속 0건, `search_trends.page_views` = 여전히 0 rows(카운터 3주 연속 미배선). 단 07-19가 건 회생불가 판정 조건("엔진 복구 + 카운터 배선 후 2~3주 실측 후에도 near-zero")이 **아직 한 항목도 충족 안 됨** — 카운터 미배선 + push 막혀 실측 자체가 불가. 따라서 이번 주도 SUNSET 아님. **다음 조건 성립 시 즉시 SUNSET_GATE 상신: push 복구 → 카운터 배선 → 라이브에서 2~3주 실측했는데도 page_views near-zero·구독 0.**
>
> 리필 원칙: push가 막혀 라이브 반영이 0인 지금, 야간 사이클의 최우선은 (1) **다시는 push가 조용히 실패하지 않도록 fail-loud**(코드로 가능, 게이트 아님), (2) push 복구 시 즉시 값을 낼 이월 태스크들. 발행량은 병목 아님(엔진 정상) → 발행 태스크는 계속 배제.

- [ ] **`publish-local.sh` push 실패 fail-loud + main-checklist 알림** — 현재 `git push origin main`이 실패해도(:88) 스크립트가 성공 종료해 로컬 로그가 초록으로 끝남. `git push`의 종료코드를 검사해 실패 시 (a) 비정상 종료코드, (b) `~/.claude/scripts/team/` 경유 `main-checklist` 채널 경보(가능하면), (c) 로그에 `PUSH FAILED` 라인. 추가로 push 후 `git rev-list --count origin/main..main`으로 잔여 미푸시 커밋을 세어 0이 아니면 경보. (근거: 이번 사고의 본질은 "push가 8일 조용히 실패했는데 로그는 초록" — 성장 동력의 라이브 반영 실패가 무성해야 한다. verify: 인증 없는 환경에서 스크립트 실행 시 비정상 종료코드 + `PUSH FAILED` 로그 라인)
- [x] **트래픽 카운터 코드 배선(4주째 이월·최우선 유지)** — 뉴스 상세 서버 컴포넌트 렌더 시 `search_trends.page_views`에 upsert(경로+KST일자, `on conflict(path,day) do update count+1`). 테이블 이미 존재(비파괴·게이트 아님, PM이 07-12 생성). `src/lib/supabase.ts` service_role 클라이언트, KST는 `Asia/Seoul`. **뉴스 상세 1개 라우트만** 배선(섹션·토픽 후속). (근거: 측정 블로커의 마지막 조각, page_views 여전히 0 rows·4주 연속 야간 미착수. verify: 로컬 `next dev`로 /news/[slug] GET → `select count(*) from search_trends.page_views` ≥1) — 2026-08-27 완료 확인
- [ ] **SubscribeBox를 뉴스 상세 페이지 하단에 배치** — 홈에만 있는 구독 진입점을 실제 트래픽 유입원(뉴스 상세)로 확장. (근거: 구독 10주+ 연속 0건, 병목은 발행량이 아니라 전환 진입점 위치. verify: /news/[slug] 렌더에 SubscribeBox 존재 + 테스트)
- [ ] **뉴스 상세 "관련 기사" 내부 링크 블록** (같은 섹션/토픽 3~5건) (근거: thin tag·고립 페이지 이슈, 내부링크로 크롤 깊이·색인성 개선. verify: 상세 페이지에 관련 링크 렌더 + 테스트)
- [ ] **sitemap 커버리지 감사 스크립트** `scripts/verify-sitemap.ts` (npm run verify:sitemap) — sitemap.ts 산출 URL 수 vs 실제 콘텐츠(뉴스 594/2=297 슬러그·섹션·토픽·정적) 대조, 누락 경고 + 종료코드. (근거: SEO=비즈니스, 커버리지가 북극성인데 결정론 검증 부재. verify: URL 카운트 리포트 + 누락 0 시 exit 0)
- [ ] **auto-news CI 실패 가시화** — `auto-news.yml`에 `if: failure()` Slack/webhook 알림 스텝 추가(엔진 죽으면 즉시 채널 알림). (근거: 07-11 8일 정지의 근본 원인은 "실패가 조용했다"였고 이번 push 사고도 동일 계열 — 자동화 실패는 시끄러워야 한다. verify: 워크플로 실패 시 알림 경로 존재, 성공 시 무발송)
- [ ] **WebSite + SearchAction JSON-LD를 홈에 추가**(미적용 시) (근거: sitelinks 검색창 노출로 브랜드 SERP 강화, 저위험. verify: 홈 소스에 `"@type":"WebSite"` + `SearchAction` 존재 + 테스트)
- [ ] **뉴스 상세 동적 OG 이미지** (/news/[slug]/opengraph-image) — 제목·섹션·날짜 렌더 (근거: 메신저/소셜 공유 CTR. verify: opengraph-image 라우트 200 + image/png 응답)

## 2026-08-16 주간 PM 리필 (우선순위순)

> 🔴 이번 주 최대 발견: **4주 최우선 블로커였던 push가 마침내 해소됐다** — 미푸시 커밋 0, `origin/main == local`(08-09 `~/.git-credentials` store 수정이 유지됨). 라이브 반영이 다시 흐른다(7일 176 콘텐츠 파일·전부 발행 반영). 콘텐츠 북극성도 건강: 978 페이지(ko 489/en 489), 700 URL 발행. **그러나 진짜 병목은 다른 곳에 있었다: 야간 dev 사이클이 이 백로그를 한 번도 소비하지 않는다.** 최근 7일 커밋이 전부 `content(news)` 발행뿐 — feature/dev 커밋 0. 백로그 미완 30개는 5주째 리필만 되고 구현이 안 붙는다. `page_views` 테이블은 존재하나 여전히 0 rows(카운터 5주째 미배선). 즉 "리필 → 소비" 루프의 소비 단계가 이 프로젝트에서 작동하지 않는다. 발행 크론만 돌고 venture-cycle dev가 미착수인지 오너/오케스트레이션 확인 필요(→ PENDING-OWNER-ACTIONS).
>
> ⚠️ SUNSET 트립와이어(대표 인지용): 구독 = 4명(7일 0·30일 3, 마지막 07-31), `page_views` = 0 rows. 07-19가 건 회생불가 판정 조건("push 복구 → 카운터 배선 → 라이브 2~3주 실측 후에도 near-zero")에서 **이제 (1)push 복구만 충족**, (2)카운터 배선·(3)실측은 미충족 → 카운터가 안 켜져 실측 자체가 불가하므로 이번 주도 SUNSET 아님. **다음 조건: 카운터 배선 → 라이브 2~3주 실측 후에도 page_views near-zero·구독 정체면 즉시 SUNSET_GATE.**
>
> 리필 원칙: 미소비 30개 위에 크게 쌓지 않는다. 소비를 유발할 수 있게 **더 잘게·검증 명확하게** 6개만. 발행량은 병목 아님(엔진 정상) → 발행 태스크 계속 배제.

- [x] **트래픽 카운터 — 최소 조각만(5주째 이월·절대 최우선)**: `src/lib/page-views.ts`에 `recordView(path: string)` 단일 함수 신설 — service_role 클라이언트로 `search_trends.page_views`에 `(path, day=KST(Asia/Seoul))` upsert, `on conflict (path, day) do update set count = page_views.count + 1`. **이번 태스크는 함수 + 단위 로직만**(라우트 배선은 다음 태스크). 테이블 이미 존재·비파괴·게이트 아님. (근거: 5주 연속 미착수 — 원인은 "라우트 배선까지 한 덩어리라 큼". 함수 하나로 쪼갬. verify: `page-views.test.ts`가 upsert 쿼리 형태·KST 날짜 문자열 생성 검증 GREEN) — 2026-08-27 완료 확인 (PageViewTracker+/api/pageview 패턴으로 동일 기능 구현됨)
- [x] **카운터를 뉴스 상세 1개 라우트에 배선**: `/news/[slug]` 서버 컴포넌트 렌더 시 위 `recordView('/news/'+slug)` 호출(await, 실패는 삼키지 말고 로깅). (근거: 측정 블로커의 마지막 조각. 앞 태스크 완료를 전제로 초소형. verify: 로컬 `next dev`로 상세 GET 후 `select count(*) from search_trends.page_views` ≥1) — 2026-08-27 완료 확인 (상세+섹션+토픽 3개 라우트 모두 배선됨)
- [ ] **SubscribeBox를 뉴스 상세 하단에 배치**: 홈에만 있는 구독 진입점을 실트래픽 유입원(뉴스 상세)로 확장. (근거: 구독 4명·거의 정체, 병목은 발행량이 아니라 전환 진입점 위치. verify: `/news/[slug]` 렌더에 SubscribeBox 존재 + 컴포넌트 테스트 GREEN)
- [ ] **`scripts/verify-sitemap.ts` + `npm run verify:sitemap`**: sitemap.ts 산출 URL 수 vs 실제 콘텐츠(뉴스 슬러그 489·섹션·토픽·정적) 대조, 누락 경고 + 누락 0 시 exit 0. (근거: SEO=비즈니스·커버리지가 북극성인데 결정론 검증 부재. verify: 카운트 리포트 출력 + 누락 0 시 종료코드 0)
- [ ] **뉴스 상세 "관련 기사" 내부 링크 블록**(같은 섹션/토픽 3~5건): (근거: thin tag·고립 페이지 이슈, 내부링크로 크롤 깊이·색인성 개선. verify: 상세 페이지에 관련 링크 렌더 + 테스트 GREEN)
- [ ] **WebSite + SearchAction JSON-LD를 홈에 추가**(미적용 시): (근거: sitelinks 검색창 노출로 브랜드 SERP 강화, 저위험·저비용. verify: 홈 소스에 `"@type":"WebSite"` + `SearchAction` 존재 + 테스트)
