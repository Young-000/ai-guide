# BACKLOG — ai-guide 야간 자율 사이클

- [x] @testing-library/user-event 설치 및 SubscribeBox 테스트 복구 (근거: 패키지 미설치로 type-check·test 단계 RED — 야간 사이클 GREEN 달성 블로커)
- [x] 뉴스 섹션·토픽 페이지에 BreadcrumbList JSON-LD 추가 (근거: /news/section/[section] · /news/topic/[tag] 페이지에 구조화 데이터 미적용, GSC 빵부스러기 마크업 누락)
- [x] 날짜별 아카이브 라우트 /news/archive/[year]/[month] 구현 (근거: 토픽 페이지는 있으나 월별 아카이브 URL 부재로 SEO long-tail 노출 기회 미확보) — 2026-07-11 머지

## 2026-07-05 주간 PM 리필 (우선순위순)

- [ ] 서버사이드 방문 카운터를 Supabase `search_trends` 스키마(전용 테이블, public 금지)에 적재 — 뉴스 상세/섹션/토픽 페이지 조회 시 경로별 일자 카운트 upsert (근거: 이번 주 PM 사이클이 북극성 트래픽 지표를 GA4 MCP 부재로 실측 불가 → 측정 블로커. 다음 사이클이 결정론적으로 트래픽 추이를 읽게 하는 것이 최우선. verify: 로컬에서 페이지 GET → 테이블 row 증가 확인)
- [x] 뉴스 섹션·토픽 페이지에 BreadcrumbList JSON-LD 추가 (근거: 기존 백로그 잔여 — 구조화 데이터 미적용으로 GSC 빵부스러기 마크업 누락. verify: 페이지 소스에 `@type":"BreadcrumbList"` 존재 + 빌드 GREEN)
- [ ] 뉴스 상세 페이지에 "관련 기사" 내부 링크 블록 추가 (같은 섹션/토픽 3~5건) (근거: thin tag 이슈(기사 1건 태그 다수) 기록됨 — 내부 링크로 크롤 깊이·색인성 개선, 고립 페이지 감소. verify: 상세 페이지에 관련 링크 렌더 + 테스트)
- [ ] SubscribeBox 노출 위치 감사 — 홈뿐 아니라 트래픽 유입원인 뉴스 상세 페이지 하단에도 배치 (근거: 구독자 0명, 전환 퍼널 진입점이 저트래픽 홈에만 있을 가능성. verify: 뉴스 상세 페이지에 SubscribeBox 렌더 확인)
- [ ] sitemap 커버리지 감사 스크립트 — 뉴스(346)·섹션·토픽·정적(32) 전 페이지가 sitemap.xml에 포함되는지 카운트 대조, 누락 시 경고 (근거: SEO=비즈니스, 커버리지가 북극성. 결정론적 검증 필요. verify: 스크립트가 sitemap URL 수 vs 실제 페이지 수 리포트)
- [x] 날짜별 아카이브 라우트 /news/archive/[year]/[month] + 인덱스 페이지 구현 (근거: 기존 백로그 잔여 — 월별 아카이브 URL 부재로 long-tail 노출 미확보. sitemap에도 추가. verify: 라우트 200 + sitemap 포함) — 2026-07-11 머지 (/news/archive 인덱스 + [year]/[month] 라우트 + sitemap 등재)
- [ ] 뉴스 상세 동적 OG 이미지(/opengraph-image) 생성 — 제목·섹션·날짜 렌더 (근거: 소셜/메신저 공유 시 미리보기 이미지로 CTR 개선, 현재 정적/기본 OG 추정. verify: /news/[slug]/opengraph-image 200 + 이미지 응답)
- [ ] WebSite + SearchAction JSON-LD(sitelinks 검색창) 홈에 추가 (미적용 시) (근거: 구글 sitelinks 검색창 노출로 브랜드 SERP 강화. verify: 홈 소스에 `SearchAction` 존재)

## 2026-07-12 주간 PM 리필 (우선순위순)

> 이번 주 핵심 관찰: 지난주 최우선이던 "서버사이드 트래픽 카운터"가 야간 사이클에서 미착수(저위험 SEO 라우트만 머지). PM이 DDL 블로커를 직접 제거함 — `search_trends.page_views(path, day, count)` 테이블 생성 완료(RLS on, service_role 전용). 이제 코드 배선만 남았으므로 최우선. 태스크는 DB/인프라 얽힘을 제거하고 "코드만 붙이면 되는" 크기로 쪼갬.

- [ ] **트래픽 카운터 코드 배선** — 뉴스 상세/섹션/토픽 서버 컴포넌트 렌더 시 `search_trends.page_views`에 upsert(경로 + KST 일자, `on conflict(path,day) do update count+1`). 테이블은 이미 존재(PM이 생성). `src/lib/supabase.ts`의 service_role 클라이언트 사용, KST 날짜는 `Asia/Seoul` 기준 계산(UTC 자정 버그 주의). (근거: 지난주 최우선 미착수 태스크, 측정 블로커의 마지막 조각. verify: 로컬 `next dev`로 /news/[slug] GET → `select * from search_trends.page_views` row 증가 확인)
- [ ] **SubscribeBox를 뉴스 상세 페이지 하단에 배치** — 홈에만 있는 구독 진입점을 실제 트래픽 유입원(뉴스 상세)로 확장. (근거: 구독자 8주+ 연속 0건, 콘텐츠 엔진(406파일)은 정상 → 병목은 발행이 아니라 전환 진입점 위치. verify: /news/[slug] 렌더에 SubscribeBox 존재 + 테스트)
- [ ] **뉴스 상세 "관련 기사" 내부 링크 블록** (같은 섹션/토픽 3~5건) (근거: thin tag(기사 1건 태그 다수) + 고립 페이지 이슈, 내부링크로 크롤 깊이·색인성 개선. verify: 상세 페이지에 관련 링크 렌더 + 테스트)
- [ ] **sitemap 커버리지 감사 스크립트** `scripts/verify-sitemap.ts` (npm run verify:sitemap) — sitemap.ts가 산출하는 URL 수 vs 실제 콘텐츠(뉴스 406/2=203 슬러그·섹션·토픽·정적) 대조, 누락 경고 + 종료코드. (근거: SEO=비즈니스, 커버리지가 북극성인데 결정론적 검증 부재. verify: 스크립트 실행 시 URL 카운트 리포트 + 누락 0 시 exit 0)
- [ ] **WebSite + SearchAction JSON-LD를 홈에 추가** (미적용 시) (근거: 구글 sitelinks 검색창 노출로 브랜드 SERP 강화, 저위험. verify: 홈 소스에 `"@type":"WebSite"` + `SearchAction` 존재 + 테스트)
- [ ] **뉴스 상세 동적 OG 이미지** (/news/[slug]/opengraph-image) — 제목·섹션·날짜 렌더 (근거: 메신저/소셜 공유 CTR, 현재 기본 OG 추정. verify: opengraph-image 라우트 200 + image/png 응답)
- [ ] **/news/topics 인덱스에 태그별 기사 수 노출 + noindex 태그 시각 구분** (근거: thin tag 처리(`isThinTag`)가 sitemap엔 반영되나 사용자/크롤러 탐색 UI엔 미반영 — 색인 가능 태그로 크롤 유도. verify: /news/topics에 기사수 배지 렌더 + 테스트)
- [ ] **RSS/피드 최신성 검증 스크립트** — `src/lib/rss.ts` 출력이 최근 발행 N건을 포함하는지 확인(발행 파이프라인 회귀 방지). (근거: 콘텐츠 엔진이 유일하게 도는 성장 동력 — 피드 깨지면 조용히 유입 손실. verify: 스크립트가 feed item 수 + 최신 pubDate 리포트)
