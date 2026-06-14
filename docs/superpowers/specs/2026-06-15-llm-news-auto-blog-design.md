# LLM 뉴스 자동발행 블로그 — 설계 문서

- **작성일**: 2026-06-15
- **대상 프로젝트**: `teamY/ai-guide` (Next.js 14, Vercel, GitHub `Young-000/ai-guide`)
- **상태**: 설계 승인 대기 (사용자 리뷰 전)

---

## 1. 목적 (Goal)

매일 LLM/AI 소식을 **자동 수집 → Claude 내부 처리로 한국어 재작성 → 정적 사이트로 발행**하여,
**SEO/AEO 검색 유입 기반의 광고 수익**을 만든다.

- 특정 주제에 대한 사용자의 창작 의지는 없음. **콘텐츠를 계속 찍어내서 검색에 걸리게 하는 것**이 핵심.
- 수익 모델 = **디스플레이 광고** (구독/뉴스레터 아님).

### 비목표 (Non-Goals)
- 유료 LLM API 사용 (비용 발생 → **금지**, Claude 구독 내부 처리로 대체).
- 이메일 뉴스레터 / 유료 구독 모델 (구독자 확보라는 별도 마케팅 과제 발생 → 범위 외).
- 원문 단순 복붙 재발행 (AdSense 정책 위반 → **금지**).

---

## 2. 핵심 전략 결정 (확정됨)

| 항목 | 결정 | 근거 |
|---|---|---|
| 기반 | **기존 `ai-guide` 확장** (신규 X) | 이미 AI/LLM 주제 + Next.js + AdSense 코드 + sitemap/robots 보유. AIT 종속성 없음(`granite.config` 無) → 사실상 독립 웹사이트 |
| 아키텍처 | **A안: git-native SSG** | 완전 정적이 크롤 친화·호스팅 0원·버전관리. 검색 유입이 목적이므로 최적 |
| 생성 엔진 | **스케줄된 Claude 에이전트** (유료 API 0원) | 이미 구독 중인 Claude가 "내부에서" 수집→재작성. rule-base 스크립트가 수집·발행 담당, Claude는 재작성만 |
| **언어** | **한국어 + 영어 양언어 발행 (hreflang)** | 영어가 CPM 2~5배·시장 수십배. Claude 재작성이라 생성비용 동일 → 커버리지·수익 최대화 |
| 광고 | **Ezoic(1일차 메인) + AdSense(병렬 심사) + AdFit(국내 모바일 보충)** | Ezoic = 빠른 승인·높은 RPM·PC+모바일웹 전체 커버. AdSense = 장기 메인. AdFit = 국내 모바일 수요 보충 |

### 광고 플랫폼 근거
- **Ezoic** = 최소 트래픽 없음, AdSense보다 관대·빠른 승인, **자체 광고수요로 AdSense 없이도 송출**, RPM +50~100%, PC+모바일 웹 전체 → **1일차 메인**.
- **카카오 AdFit** = 모바일 전용 아님(PC웹 단위도 있음) but 모바일 수요가 강함. 한국 검색 트래픽 모바일 70%+와 잘 맞음 → **국내 보충용**.
- **AdSense** = 승인 느리지만 장기 RPM/수요 최상 → **글 쌓인 뒤 병렬 심사**.
- **네이버 애드포스트** = 네이버 블로그/카페 전용, 자체 도메인 불가 → 제외.
- **몰로코** = 광고주용 퍼포먼스 DSP, 퍼블리셔 수익화 네트워크 아님 → 제외.
- **즉시승인 네트워크(Adsterra/Monetag)** = 저질 광고로 UX/SEO 훼손 + 향후 AdSense 승인 방해 → 제외.
- AdSense 승인 지연은 신규 사이트의 **SEO 램프업(3~6개월)과 겹쳐 흡수**되므로 실질 병목 아님. "대기 중 0원"은 Ezoic이 메꿈.

### 수익성 현실 (기대치 보정)
- 이건 **CPM 게임이 아니라 볼륨 게임.** 페이지 RPM: 한국어 AI/테크 ~$1~4, 영어 ~$5~15.
- 매출 가늠: 월 10만 PV ≈ 한국어 $200 / 영어 $700+, 월 50만 PV ≈ 한국어 $1,000 / 영어 $3,500+.
- **초기 수개월은 거의 0원** (검색 인덱싱·랭킹에 3~6개월). 패시브 인컴으로 누적되는 장기 게임.
- CPM 레버: ① 영어(반영됨) ② 뉴스보다 "구매의도" 콘텐츠(도구 비교/요금) — ai-guide `compare`/`tools` 구조와 시너지 ③ Ezoic 최적화.

---

## 2.5 운영 철학: Fire-and-Forget (low-stakes)

사용자 의도 = "어차피 Claude는 계속 구독. 그냥 깔아두고 무인으로 돌다가 되면 좋고 아니면 말고."
→ **초기 셋업 부담 최소화**가 최우선. 셋업 chore가 있는 항목은 v1에서 제외하고 나중에 토글로 추가.

| 항목 | v1 (지금) | 나중(트래픽 붙으면) |
|---|---|---|
| 자동화 `/schedule` | ✅ 핵심 — 유지 | — |
| 광고 | **기존 AdSense 스니펫 그대로**(추가 셋업 0) | Ezoic(DNS 연동)·AdFit 토글 추가 |
| 언어 | ko+en 유지 (Claude 생성 거의 공짜) | — |
| 인프라 | git+Vercel(기존) — 추가 0 | 1000건+ 시 Supabase 이관 |

> 핵심: **사람 손이 가는 일(계정 가입·DNS·심사)은 전부 "나중" 칸으로.** v1은 코드만 깔면 무인으로 글이 쌓이게.

## 3. 아키텍처 (3단 파이프라인)

```
[스케줄러가 Claude Code를 5시간마다 깨움 — Claude 토큰 창마다 / /schedule 클라우드 루틴]
   │
   ├─ 1. 수집 (rule-base 스크립트, scripts/fetch-feeds.mjs)
   │      RSS/API에서 LLM 소식 수집
   │      → 기존 발행분(slug/원문 URL)과 중복제거
   │      → 신규 원본 worklist(JSON) 출력
   │
   ├─ 2. 가공 (Claude 내부 처리, API 0원)
   │      worklist 읽고 → 각 항목을 한국어+영어 기사 쌍으로 재작성
   │      (요약 + 큐레이션 + 맥락/해설 = AdSense value-add)
   │      → frontmatter 포함 마크다운 본문 생성 (ko/ + en/)
   │
   └─ 3. 발행 (rule-base 스크립트, scripts/publish.mjs)
          마크다운 파일을 src/content/news/ 에 기록
          → git add/commit/push → Vercel 자동 재빌드(SSG)
```

### 책임 분리
- **스크립트(결정적)**: 수집, 중복제거, 파일 쓰기, git 커밋/푸시. → 토큰 0.
- **Claude(생성적)**: 원문 이해 → 한국어 기사 재작성. → 가공에만 토큰 사용.

---

## 4. ai-guide 변경 사항

### 4.1 콘텐츠 저장 구조 (신규, 양언어)
- 기존: `src/data/*.json` (큐레이션 정적 데이터) — **유지**.
- 신규: `src/content/news/<lang>/YYYY-MM-DD-<slug>.md` — 언어별 디렉토리(`ko/`, `en/`), 날짜별 기사.
  - 한 소식 = `ko`/`en` 한 쌍 (동일 `slug`, 상호 hreflang 연결). frontmatter:
  ```yaml
  ---
  title: "<제목>"
  lang: ko            # ko | en
  date: 2026-06-15
  slug: <kebab-slug>  # 양언어 동일 → hreflang 페어링 키
  summary: "<1~2문장 요약 (meta description)>"
  tags: ["LLM", "OpenAI", ...]
  sources:
    - title: "<원문 제목>"
      url: "<원문 URL>"
  ---
  <마크다운 본문 — 해당 언어 재작성 기사>
  ```

### 4.2 신규 라우트 (App Router, i18n)
- 로케일 세그먼트: `/news`(ko 기본) + `/en/news`(영어). (`[locale]` 또는 `/en` prefix — 구현 시 확정)
- `/[locale]/news` — 기사 목록 (최신순, 페이지네이션).
- `/[locale]/news/[slug]` — 기사 상세 (SSG, `generateStaticParams`).
- 기존 네비게이션에 "뉴스" + 언어 전환 진입점 추가.

### 4.3 SEO/AEO
- 각 기사에 **JSON-LD `Article`/`NewsArticle` 스키마** (`headline`, `datePublished`, `author`, `publisher`, `inLanguage`).
- **hreflang** 상호 링크 (ko ↔ en, `x-default`).
- `sitemap.ts`에 양언어 `/[locale]/news/[slug]` 전체 포함 (기존 sitemap 확장).
- OG/Twitter 메타태그 per-article, per-locale.
- 원문 **출처 명시 링크**(저작권·신뢰·AEO 인용 가능성).

### 4.4 광고 슬롯
- 기사 상세/목록에 광고 슬롯 컴포넌트 (`<AdSlot placement=...>`).
- **Ezoic / AdSense / AdFit 코드를 env 플래그로 on/off** 가능한 추상화 (네트워크 교체·병행 대응).
- 영어 페이지 = Ezoic/AdSense 우선, 한국어 페이지 = AdFit 보충 가능하게 placement별 분기.

---

## 5. 수집 소스 (1차 후보)
- 공식 블로그 RSS: OpenAI, Anthropic, Google DeepMind, Meta AI, Mistral.
- 커뮤니티/집계: Hacker News (AI 키워드 필터), Hugging Face blog/papers.
- arXiv cs.CL / cs.AI 신착 (선택).
- (확장) 국내: 매체 RSS 중 AI 섹션.

> 1차는 RSS만으로 시작 (rule-base, 무료). 소스별 신뢰도/중복은 스크립트에서 필터.

### 5.1 에버그린 백로그 (idle 방지용)
- 신규 뉴스가 마른 5h 창을 위해 **주제 큐**(`src/content/_backlog.json`)를 둠.
- 예: "ChatGPT vs Claude vs Gemini 비교", "AI 코딩툴 가이드", 용어/개념 심화 — **구매의도·고CPM** 주제.
- 매 실행: 뉴스 우선, 없으면 백로그에서 1개 소진해 생성. 백로그 고갈 시 Claude가 신규 주제 보충.

---

## 6. 발행 정책
- **주기**: **5시간마다** (Claude 구독의 5시간 토큰 창에 정렬) — 1일 약 4~5회. "토큰 찰 때마다 계속 찍어내기."
- **발행량**: 매 실행마다 토큰 한도껏 (남은 토큰을 콘텐츠로 소진). 각 건 = ko+en 쌍.
- **소스 우선순위 (절대 idle 금지)**:
  1. 신규 뉴스 있으면 → 뉴스 기사 우선.
  2. 신규 뉴스 없으면 → **에버그린 백로그**(도구 비교/가이드/용어 심화 = 구매의도·고CPM)로 채워 **항상 생산**.
- **중복제거**: 원문 URL + 제목/주제 유사도로 기발행분과 비교 (5h 고빈도라 중복 위험↑ → 강하게 적용).
- **품질 가드(AdSense)**: 원문 복붙 금지, 최소 단어수, 출처 명시, 양언어 재작성 필수.

---

## 7. 자동화 (스케줄러)
- **주기**: **5시간 간격 cron** (`0 */5 * * *` 류) — Claude 토큰 창과 정렬.
- **1순위**: `/schedule` 클라우드 루틴 (cron) — PC 비의존, 인프라 0.
- **대안**: 로컬 cron + `claude -p` (PC 상시 가동 필요).
- 토큰 소진 시: 다음 5h 창에서 자동 재개. 실패 시 로그 + 다음 주기 재시도 (silent failure 금지).

---

## 8. 리스크 & 대응
| 리스크 | 대응 |
|---|---|
| AdSense scaled-content 정책 위반 | Claude 재작성으로 value-add 보장, 원문 복붙 금지, 출처 명시 |
| 저작권(뉴스 재발행) | 전문 복제 X, 요약+해설+출처링크 원칙 |
| 중복/저품질 양산 | 스크립트 중복제거 + "가치 없으면 skip" 정책 |
| git repo 비대(글 수천 개) | 1000건 도달 시 Supabase+ISR(B안) 이관 — YAGNI, 지금은 SSG |
| 스케줄 실패 누락 | 실행 로그 + 다음 주기 재시도, 모니터링 |
| 양언어 운영 복잡도 | slug 키로 ko/en 페어링 강제, hreflang 자동 생성, 한쪽 누락 시 발행 보류 |

---

## 9. 테스트
- 수집 스크립트: RSS 파싱·중복제거 단위 테스트 (jest, 기존 설정 활용).
- 발행 스크립트: 파일 생성·frontmatter 유효성 테스트.
- 라우트: `/news`, `/news/[slug]` 렌더링 + JSON-LD 존재 테스트 (RTL).
- 빌드 게이트: `type-check` + `lint` + `build` + `test` 통과.

---

## 10. 미해결/후속 결정
- [ ] 도메인: ai-guide 현재 배포 URL 확인 + AdSense/Ezoic 심사용 커스텀 도메인 여부.
- [ ] i18n 라우팅 방식 확정: `[locale]` 세그먼트 vs `/en` prefix (기존 라우트 영향 검토).
- [ ] 소스 피드 최종 목록 확정.
- [ ] 매 5h 창당 발행 상한 (토큰 한도껏 vs 안전 캡 N건) — 폭주/품질 방지선.
- [ ] 광고 계정: Ezoic 가입(DNS 연동) + AdFit 계정 발급 (사용자 액션).

---

## 부록: 단계적 로드맵
1. **Phase 1**: `/[locale]/news` 라우트 + 양언어 콘텐츠 구조 + 수동 1건(ko+en) 발행 (골격 검증).
2. **Phase 2**: 수집·발행 스크립트 + Claude 양언어 재작성 연결 (수동 트리거).
3. **Phase 3**: `/schedule` 자동화 + Ezoic/AdFit 광고 삽입 → 라이브.
4. **Phase 4**: 글 누적(2~4주) → AdSense·Ezoic 심사 제출.
