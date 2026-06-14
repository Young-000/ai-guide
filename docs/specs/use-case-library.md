# Use Case Library (활용 사례 라이브러리)

> **Backlog ID:** `use-case-library` | **Phase:** 2 | **Cycle:** 6
> **작성자:** PM Agent | **작성일:** 2026-02-17 | **상태:** Draft

---

## JTBD

When **AI로 뭘 할 수 있는지 감이 안 올 때**, I want to **나와 비슷한 직업/상황의 사람들이 AI를 어떻게 활용하는지 실제 사례를 보고**, so I can **영감을 얻어 AI를 내 일에 바로 적용할 수 있다**.

---

## Problem

- **Who:** AI 초보자 (페르소나 1~4 전원). 특히 페르소나 1 김지영(직장인)과 페르소나 4 최영호(자영업자) -- "AI가 좋다는데, 내 일에 어떻게 쓰는지 모르겠다"가 핵심 고통.
- **Pain:** 높음 (빈도: 매일 AI 관련 콘텐츠를 접하지만 구체적 활용법을 모름 x 심각도: AI 도입을 계속 미루게 됨)
- **Current workaround:** 유튜브에서 "ChatGPT 활용법" 검색, 블로그에서 단편적 사례 수집, 동료에게 물어보기 -- 모두 체계적이지 않고 자기 상황에 맞지 않는 경우가 많음.
- **Success metric:**
  - 사례 페이지 → 관련 상황 가이드 클릭률 15%+ (사례가 실제 행동으로 이어지는가)
  - 사례 페이지 평균 체류 시간 2분+ (사례를 실제로 읽고 있는가)
  - /use-cases 페이지 오가닉 검색 유입 월 500+ (SEO 콘텐츠로서 기능하는가)

---

## Solution

### Overview

`/use-cases` 경로에 실제 활용 사례 라이브러리를 구축한다. "마케팅팀 김대리가 주간 보고서 작성 시간을 3시간에서 30분으로 줄인 방법"처럼 구체적 인물, 구체적 수치, 구체적 도구를 포함한 사례 15개 이상을 제공한다.

이 기능은 세 가지 역할을 동시에 수행한다:
1. **SEO 콘텐츠** -- 각 사례가 개별 indexable 페이지(`/use-cases/[slug]`)로, "AI 보고서 작성 사례", "AI 마케팅 활용" 등 롱테일 키워드를 공략한다.
2. **소셜 프루프** -- "나와 비슷한 사람이 이미 성공했다"는 신뢰감을 제공하여 온보딩 전환율을 높인다.
3. **상황 가이드 진입점** -- 각 사례에서 관련 상황 가이드(`/situations/[slug]`)와 도구 상세(`/tools/[slug]`)로 자연스럽게 연결한다.

기존 `situations.json`의 slug과 `tools.json`의 slug을 활용하여 데이터 간 연결성을 확보한다. 정적 JSON 기반으로 구현하여 Phase 1~2 아키텍처와 일관성을 유지한다.

### User Flow

```
[진입: 헤더 메뉴 "활용 사례" 클릭 / 상황 가이드 하단 "다른 사례 보기" / 검색 엔진 유입]
  → /use-cases (목록 페이지)
    → 직업별/상황별 필터 선택
    → 사례 카드 목록 탐색
    → 관심 있는 카드 클릭
      → /use-cases/[slug] (상세 페이지)
        → Challenge → Solution → Result 구조화된 스토리 읽기
        → "나도 해보기" CTA 클릭
          → /situations/[slug] (관련 상황 가이드로 이동) ← Success State
        → "이 도구 자세히 보기" 클릭
          → /tools/[slug] (도구 상세 페이지로 이동)
```

Error/Edge States:
- 필터 결과 0건: "아직 이 조합의 사례가 없습니다. 다른 필터를 선택해보세요." 안내 + 필터 리셋 버튼
- 잘못된 slug 접근: 404 페이지 → /use-cases 목록으로 리디렉션 안내

### Data Structure (`src/data/use-cases.json`)

```typescript
type UseCaseDifficulty = 'easy' | 'medium' | 'hard';

type Profession =
  | 'marketer'     // 마케터
  | 'developer'    // 개발자
  | 'designer'     // 디자이너
  | 'student'      // 학생
  | 'office-worker' // 직장인
  | 'freelancer'   // 프리랜서
  | 'business-owner' // 자영업자/사업가
  ;

type UseCase = {
  slug: string;                  // URL-safe identifier
  title: string;                 // 사례 제목 (한국어, 50자 이내)
  profession: Profession;        // 직업 분류
  professionLabel: string;       // 직업 한국어 표시명 (예: "마케팅팀 대리")
  situation: string;             // situations.json slug 참조
  persona: string;               // 구체적 인물 설정 (예: "마케팅팀 김대리")
  challenge: string;             // 겪고 있던 문제 (2~3문장)
  solution: string;              // AI를 어떻게 활용했는지 (3~5문장)
  result: string;                // 구체적 성과 (정량 수치 필수)
  resultHighlight: string;       // 핵심 수치 한 줄 (카드에 표시, 예: "작업 시간 3시간 → 30분")
  toolUsed: string;              // tools.json slug 참조 (주 도구)
  additionalTools?: string[];    // tools.json slug 참조 (보조 도구들)
  difficulty: UseCaseDifficulty;
  tags: string[];                // 검색용 키워드
};
```

### Scope (MoSCoW)

**Must:**
- `src/data/use-cases.json` 데이터 파일 (15개 이상 사례)
  - 6개 이상 직업군 커버
  - 10개 이상 상황 참조 (situations.json slug)
  - easy/medium/hard 난이도 혼합
  - 다양한 AI 도구 활용 (최소 8개 도구)
- `/use-cases` 목록 페이지
  - 카드 기반 그리드 레이아웃 (모바일 1열, 태블릿 2열, 데스크톱 3열)
  - 직업별 필터 칩 (전체 + 각 직업군)
  - 상황별 필터 칩 (situations.json 카테고리 연동)
  - 사례 카드: 제목, 페르소나, resultHighlight, 난이도 뱃지, 직업 태그
- `/use-cases/[slug]` 상세 페이지
  - 구조화된 스토리: Challenge → Solution → Result 3단 구성
  - 페르소나/직업 표시
  - 사용 도구 표시 + `/tools/[slug]` 링크
  - "나도 해보기" CTA → `/situations/[slug]` 연결
  - 하단 관련 사례 3개 추천 (같은 직업 또는 같은 상황)
- SEO 메타데이터 (각 상세 페이지)
  - `<title>`: "{사례 제목} | AI Guide"
  - `<meta description>`: challenge + resultHighlight 요약
  - Open Graph 태그 (og:title, og:description, og:type=article)
  - JSON-LD 구조화 데이터 (Article schema)

**Should:**
- 목록 페이지에서 직업별 + 상황별 필터 동시 적용 (AND 조건)
- 사례 카드에 도구 아이콘 표시
- 상세 페이지에서 "이 가이드가 도움이 됐나요?" 피드백 버튼
- 헤더 네비게이션에 "활용 사례" 메뉴 추가
- 상황 가이드 페이지(`/situations/[slug]`) 하단에 관련 사례 카드 2개 표시

**Could:**
- 사례 정렬 옵션 (인기순, 최신순, 난이도순)
- 검색 기능 (tags 기반 텍스트 검색)
- "시간 절약 계산기" -- 사례의 result를 기반으로 "당신도 월 X시간 절약 가능" 계산

**Won't (this cycle):**
- 사용자 제출 사례 (UGC) -- Phase 3 커뮤니티 기능과 함께
- 사례 좋아요/북마크 -- 사용자 계정 없이 의미 없음
- 실제 사용자 인터뷰 기반 사례 -- 현재는 대표적 시나리오 기반
- 다국어 사례

---

## Use Case Data (15 cases)

### Case 1: 마케터 - 보고서

| Field | Value |
|-------|-------|
| slug | `weekly-report-automation` |
| title | 주간 마케팅 보고서, 3시간을 30분으로 줄인 방법 |
| profession | `marketer` |
| professionLabel | 마케팅팀 대리 |
| situation | `pdf-summary` |
| persona | 마케팅팀 김대리 (32세, 중견기업) |
| challenge | 매주 월요일마다 지난주 캠페인 성과를 정리한 보고서를 팀장에게 제출해야 했다. 여러 플랫폼에서 데이터를 모으고, 인사이트를 뽑고, 보고서 형식으로 정리하는 데 매번 3시간 이상 걸렸다. |
| solution | Claude에 지난주 캠페인 데이터(CSV)를 업로드하고 "주간 마케팅 보고서 형식으로 정리해줘"라고 요청했다. 핵심 지표 요약, 전주 대비 변화, 주목할 인사이트까지 자동으로 뽑아준다. 결과를 검토하고 수정하는 데만 집중하면 된다. |
| result | 보고서 작성 시간 3시간 → 30분으로 단축. 월 10시간 이상 절약. 팀장으로부터 "인사이트가 더 풍부해졌다"는 피드백까지 받았다. |
| resultHighlight | 작업 시간 3시간 → 30분 |
| toolUsed | `claude` |
| difficulty | easy |
| tags | 보고서, 마케팅, 시간절약, 데이터분석, 업무효율 |

### Case 2: 개발자 - 디버깅

| Field | Value |
|-------|-------|
| slug | `debugging-legacy-code` |
| title | 3일간 못 찾던 레거시 코드 버그, 10분 만에 해결 |
| profession | `developer` |
| professionLabel | 백엔드 개발자 |
| situation | `code-debug` |
| persona | 백엔드 개발자 박준혁 (27세, 스타트업) |
| challenge | 인수인계 없이 받은 레거시 프로젝트에서 간헐적으로 발생하는 API 에러를 3일째 추적하고 있었다. 코드가 수천 줄이고 문서화도 안 돼 있어서 원인을 특정할 수 없었다. |
| solution | 관련 코드 파일 전체를 Claude에 업로드하고 에러 로그를 함께 제공했다. Claude가 race condition 가능성을 지적하며 문제 코드와 수정 방안을 제시했다. |
| result | 3일간 못 찾던 버그를 10분 만에 원인 파악. 수정 후 에러 발생률 0%로 감소. |
| resultHighlight | 디버깅 3일 → 10분 |
| toolUsed | `claude` |
| difficulty | medium |
| tags | 디버깅, 레거시코드, 개발, 에러해결, 코드분석 |

### Case 3: 디자이너 - 썸네일

| Field | Value |
|-------|-------|
| slug | `youtube-thumbnail-workflow` |
| title | 유튜브 썸네일 제작 시간을 1/3로 줄인 디자이너 |
| profession | `designer` |
| professionLabel | 프리랜서 디자이너 |
| situation | `thumbnail-creation` |
| persona | 프리랜서 디자이너 이수진 (28세, 콘텐츠 크리에이터) |
| challenge | 유튜브 채널을 운영하며 매주 3개의 영상 썸네일을 제작해야 했다. 매번 배경 이미지를 직접 찾거나 만드는 데 시간이 많이 걸렸고, 클릭률 높은 디자인을 일관되게 만들기 어려웠다. |
| solution | Midjourney로 주제에 맞는 배경 이미지를 생성하고, Canva AI로 텍스트 배치와 색상 조합을 최적화했다. 한 번 만든 스타일을 프롬프트로 저장해두어 일관된 브랜드 느낌을 유지한다. |
| result | 썸네일 1개 제작 시간 2시간 → 40분으로 단축. 평균 클릭률(CTR) 4.2% → 6.8%로 상승. |
| resultHighlight | 제작 시간 2시간 → 40분, CTR 62% 상승 |
| toolUsed | `midjourney` |
| additionalTools | `canva-ai` |
| difficulty | medium |
| tags | 썸네일, 유튜브, 디자인, 이미지생성, 콘텐츠 |

### Case 4: 학생 - 논문

| Field | Value |
|-------|-------|
| slug | `paper-review-for-thesis` |
| title | 졸업논문 선행연구 50편, 일주일 만에 정리 완료 |
| profession | `student` |
| professionLabel | 경영학과 대학원생 |
| situation | `paper-summary` |
| persona | 대학원생 최민서 (25세, 경영학 석사과정) |
| challenge | 졸업논문 작성을 위해 선행연구 50편을 읽고 정리해야 했다. 논문 한 편당 읽고 정리하는 데 2시간씩, 총 100시간이 예상되어 막막했다. |
| solution | 각 논문 PDF를 Claude에 업로드해서 "연구목적-방법-결과-한계-의의" 5항목으로 요약을 받았다. 50편의 요약을 모은 뒤 "이 연구들의 공통 트렌드와 연구 갭을 분석해줘"라고 추가 분석을 요청했다. |
| result | 선행연구 정리 기간 한 달 → 일주일로 단축. 지도교수에게 "문헌 분석이 체계적"이라는 칭찬을 받았다. |
| resultHighlight | 선행연구 정리 한 달 → 1주일 |
| toolUsed | `claude` |
| additionalTools | `perplexity` |
| difficulty | easy |
| tags | 논문, 선행연구, 대학원, 졸업논문, 문헌분석 |

### Case 5: 직장인 - 이메일

| Field | Value |
|-------|-------|
| slug | `english-email-confidence` |
| title | 영어 이메일 공포증을 극복한 해외영업 담당자 |
| profession | `office-worker` |
| professionLabel | 해외영업 담당 |
| situation | `email-writing` |
| persona | 해외영업 담당 정하은 (29세, 중소기업) |
| challenge | 해외 거래처와 매일 영어 이메일을 주고받아야 하는데, 매번 문법이 맞는지, 비즈니스 톤이 적절한지 불안했다. 이메일 하나에 30분 이상 고민하는 날이 많았다. |
| solution | ChatGPT에 상황을 한국어로 설명하고 영어 이메일을 작성해달라고 요청했다. 문법뿐만 아니라 비즈니스 관례에 맞는 표현까지 추천받았다. Grammarly로 최종 교정까지 거쳐 완벽하게 마무리한다. |
| result | 영어 이메일 작성 시간 30분 → 5분으로 단축. 해외 거래처로부터 "커뮤니케이션이 명확해졌다"는 피드백. |
| resultHighlight | 이메일 작성 30분 → 5분 |
| toolUsed | `chatgpt` |
| additionalTools | `grammarly` |
| difficulty | easy |
| tags | 영어이메일, 비즈니스, 해외영업, 번역, 업무효율 |

### Case 6: 프리랜서 - 블로그

| Field | Value |
|-------|-------|
| slug | `freelancer-blog-seo` |
| title | 블로그 콘텐츠 생산량 3배 늘린 프리랜서 마케터 |
| profession | `freelancer` |
| professionLabel | 프리랜서 콘텐츠 마케터 |
| situation | `blog-writing` |
| persona | 프리랜서 콘텐츠 마케터 한지윤 (31세) |
| challenge | 클라이언트 3곳의 블로그 콘텐츠를 동시에 관리하고 있었다. 주제 선정부터 글쓰기, SEO 최적화까지 모두 혼자 하다 보니 월 12편이 한계였고, 신규 클라이언트를 받을 여력이 없었다. |
| solution | Claude로 글 구조를 먼저 잡고, 섹션별로 나눠서 초안을 작성했다. Perplexity로 최신 데이터와 통계를 보충하고, 마지막으로 본인의 전문성과 경험을 더해 완성했다. |
| result | 월 블로그 생산량 12편 → 36편으로 3배 증가. 신규 클라이언트 2곳 추가 수주. 월 수입 40% 증가. |
| resultHighlight | 월 콘텐츠 12편 → 36편, 수입 40% 증가 |
| toolUsed | `claude` |
| additionalTools | `perplexity` |
| difficulty | medium |
| tags | 블로그, SEO, 콘텐츠마케팅, 프리랜서, 글쓰기 |

### Case 7: 마케터 - SNS

| Field | Value |
|-------|-------|
| slug | `sns-content-calendar` |
| title | 인스타그램 콘텐츠 달력을 30분 만에 만드는 법 |
| profession | `marketer` |
| professionLabel | 소셜미디어 마케터 |
| situation | `sns-content` |
| persona | 소셜미디어 마케터 윤서연 (26세, 브랜드 에이전시) |
| challenge | 3개 브랜드의 인스타그램을 동시에 관리하며 한 달치 콘텐츠 캘린더를 매번 수작업으로 짰다. 캡션, 해시태그, 포스팅 시간까지 정하는 데 브랜드당 이틀씩 소요됐다. |
| solution | ChatGPT에 브랜드 톤앤매너, 타겟 고객, 최근 트렌드를 입력하고 한 달치 콘텐츠 캘린더를 요청했다. 캡션 초안과 해시태그 세트까지 한번에 받아서 검토/수정만 하면 된다. |
| result | 콘텐츠 캘린더 작성 시간 브랜드당 2일 → 30분으로 단축. 캡션 품질 향상으로 평균 참여율 23% 상승. |
| resultHighlight | 콘텐츠 캘린더 2일 → 30분 |
| toolUsed | `chatgpt` |
| difficulty | easy |
| tags | 인스타그램, SNS, 콘텐츠캘린더, 소셜미디어, 해시태그 |

### Case 8: 개발자 - 코드리뷰

| Field | Value |
|-------|-------|
| slug | `solo-dev-code-review` |
| title | 1인 개발자의 코드 품질을 높인 AI 코드 리뷰 |
| profession | `developer` |
| professionLabel | 1인 개발자 |
| situation | `code-review` |
| persona | 1인 개발자 강태현 (34세, 사이드 프로젝트) |
| challenge | 혼자 개발하다 보니 코드 리뷰를 받을 동료가 없었다. 보안 취약점이나 성능 문제를 놓치고 있는 건 아닌지 불안했고, 코드 품질이 점점 나빠지는 느낌이었다. |
| solution | PR을 올릴 때마다 변경된 코드를 Claude에 붙여넣고 "버그, 보안, 성능, 가독성 관점에서 리뷰해줘"라고 요청했다. Cursor도 함께 써서 IDE에서 실시간으로 개선 제안을 받았다. |
| result | 배포 후 발견되는 버그 60% 감소. 코드 유지보수 시간 40% 절약. 사이드 프로젝트 출시 2주 앞당김. |
| resultHighlight | 배포 후 버그 60% 감소 |
| toolUsed | `claude` |
| additionalTools | `cursor` |
| difficulty | medium |
| tags | 코드리뷰, 1인개발, 코드품질, 보안, 성능최적화 |

### Case 9: 디자이너 - UI 디자인

| Field | Value |
|-------|-------|
| slug | `app-prototype-speed` |
| title | 앱 프로토타입을 하루 만에 만든 UI 디자이너 |
| profession | `designer` |
| professionLabel | UI/UX 디자이너 |
| situation | `ui-design` |
| persona | UI/UX 디자이너 오예린 (30세, 스타트업) |
| challenge | 클라이언트 미팅에서 새로운 앱 컨셉을 제안받았는데, 3일 후까지 프로토타입을 보여달라는 요청을 받았다. 보통 2주는 걸리는 작업인데 시간이 턱없이 부족했다. |
| solution | Midjourney로 다양한 UI 스타일의 목업 이미지를 빠르게 생성하고, 가장 좋은 방향을 선정했다. v0로 실제 동작하는 React 컴포넌트까지 생성하여 인터랙티브 프로토타입을 완성했다. |
| result | 프로토타입 제작 2주 → 1일로 단축. 클라이언트가 즉석에서 프로젝트를 승인. 계약 규모 30% 증가 협상 성공. |
| resultHighlight | 프로토타입 2주 → 1일 |
| toolUsed | `midjourney` |
| additionalTools | `v0` |
| difficulty | hard |
| tags | UI디자인, 프로토타입, 앱디자인, 목업, 클라이언트 |

### Case 10: 학생 - 개념 학습

| Field | Value |
|-------|-------|
| slug | `exam-prep-study-buddy` |
| title | 전공 시험 학점을 B에서 A+로 올린 공부법 |
| profession | `student` |
| professionLabel | 경제학과 대학생 |
| situation | `concept-explanation` |
| persona | 대학생 이지은 (21세, 경제학과 2학년) |
| challenge | 거시경제학 수업에서 IS-LM 모델, 필립스 곡선 같은 개념이 도통 이해가 안 됐다. 교수님 설명은 어렵고, 교과서는 더 어렵고, 인터넷 검색은 너무 전문적이었다. |
| solution | ChatGPT에게 "나는 경제학 비전공 수준의 2학년이야. 이 개념을 카페에서 친구에게 설명하듯이 알려줘"라고 요청했다. 비유와 실생활 예시로 개념을 이해한 뒤, "시험에 나올만한 문제 5개 만들어줘"로 연습까지 했다. |
| result | 기말 시험 성적 B → A+. 개념 이해 시간 50% 단축. 스터디 그룹에서 설명 역할을 맡게 됨. |
| resultHighlight | 성적 B → A+ |
| toolUsed | `chatgpt` |
| difficulty | easy |
| tags | 시험준비, 대학생, 개념학습, 공부법, 경제학 |

### Case 11: 직장인 - 회의록

| Field | Value |
|-------|-------|
| slug | `meeting-notes-automation` |
| title | 회의록 정리를 10분으로 끝내는 기획팀 막내 |
| profession | `office-worker` |
| professionLabel | 기획팀 사원 |
| situation | `meeting-notes` |
| persona | 기획팀 사원 이동현 (26세, IT기업) |
| challenge | 매일 2~3개의 회의에 참석하며 회의록 정리가 늘 본인 몫이었다. 회의 중 메모를 하느라 논의에 집중하지 못했고, 정리에 1시간씩 걸리다 보니 본래 업무 시간이 줄어들었다. |
| solution | Otter AI로 회의를 녹음/자동 전사하고, 전사본을 Claude에 입력하여 "요약-결정사항-액션아이템-다음 안건" 형식으로 정리했다. |
| result | 회의록 정리 시간 1시간 → 10분으로 단축. 회의 중 논의에 집중할 수 있게 됨. 주 5시간 업무 시간 확보. |
| resultHighlight | 회의록 정리 1시간 → 10분 |
| toolUsed | `claude` |
| additionalTools | `otter` |
| difficulty | easy |
| tags | 회의록, 자동정리, 업무효율, 회의, 액션아이템 |

### Case 12: 자영업자 - 상품 설명

| Field | Value |
|-------|-------|
| slug | `product-description-shopowner` |
| title | 쇼핑몰 상품 설명을 AI로 쓰고 매출 15% 올린 사장님 |
| profession | `business-owner` |
| professionLabel | 온라인 쇼핑몰 대표 |
| situation | `blog-writing` |
| persona | 온라인 쇼핑몰 대표 최영호 (45세, 패션 잡화) |
| challenge | 200개 이상의 상품 설명을 혼자 작성해야 했다. 글솜씨가 없다 보니 대부분 스펙 나열 수준이었고, 경쟁 쇼핑몰보다 상품 페이지가 빈약했다. |
| solution | ChatGPT에 상품 사진과 스펙을 주고 "20~30대 여성 고객이 읽었을 때 구매하고 싶어지는 상품 설명을 써줘"라고 요청했다. 감성적인 카피와 실용적인 정보를 조합한 설명을 받아 수정 후 적용했다. |
| result | 상품 페이지 전환율 12% 상승. 전체 매출 15% 증가. 200개 상품 설명 리뉴얼을 2주 만에 완료 (기존 예상 2개월). |
| resultHighlight | 매출 15% 증가, 설명 작성 2개월 → 2주 |
| toolUsed | `chatgpt` |
| difficulty | easy |
| tags | 쇼핑몰, 상품설명, 카피라이팅, 매출, 자영업 |

### Case 13: 프리랜서 - 경쟁사 분석

| Field | Value |
|-------|-------|
| slug | `competitor-analysis-freelancer` |
| title | 경쟁 분석 보고서를 반나절 만에 완성한 컨설턴트 |
| profession | `freelancer` |
| professionLabel | 프리랜서 경영 컨설턴트 |
| situation | `competitor-research` |
| persona | 프리랜서 경영 컨설턴트 신우진 (38세) |
| challenge | 클라이언트에게 경쟁사 5곳의 비교 분석 보고서를 일주일 내에 납품해야 했다. 각 경쟁사의 제품, 가격, 전략, 최근 동향을 조사하고 체계적으로 비교하는 작업은 보통 3~4일이 걸렸다. |
| solution | Perplexity로 각 경쟁사의 최신 정보(제품, 가격, 뉴스, 재무 데이터)를 실시간 검색하여 수집했다. 수집 데이터를 Claude에 입력하고 "SWOT 분석 + 포지셔닝 맵 + 전략 제안" 형식의 보고서를 요청했다. |
| result | 경쟁 분석 보고서 작성 3~4일 → 반나절로 단축. 클라이언트에게 "기존에 받은 분석 중 가장 체계적"이라는 평가. 후속 프로젝트 수주 성공. |
| resultHighlight | 분석 보고서 4일 → 반나절 |
| toolUsed | `perplexity` |
| additionalTools | `claude` |
| difficulty | medium |
| tags | 경쟁분석, 컨설팅, 보고서, 시장조사, 전략 |

### Case 14: 학생 - 영어

| Field | Value |
|-------|-------|
| slug | `english-speaking-practice` |
| title | 교환학생 면접 영어를 AI로 준비해서 합격한 이야기 |
| profession | `student` |
| professionLabel | 대학생 |
| situation | `english-conversation` |
| persona | 대학생 김도윤 (22세, 영문학과 3학년) |
| challenge | 교환학생 프로그램 영어 면접을 앞두고 있었다. 원어민과 연습하고 싶지만 비용이 부담되고, 혼자 연습하면 피드백을 받을 수 없어 자신감이 없었다. |
| solution | ChatGPT 모바일 앱의 음성 대화 모드로 매일 30분씩 모의 면접을 연습했다. "면접관 역할을 해줘. 내가 대답하면 영어 표현을 교정해주고 더 좋은 대안을 알려줘"라고 설정했다. Claude로 자기소개서 영어 버전도 교정받았다. |
| result | 2주간 연습 후 면접 합격. 면접관으로부터 "영어 표현이 자연스러웠다"는 평가. 유료 영어 회화 수업 비용 월 15만원 절약. |
| resultHighlight | 교환학생 면접 합격, 월 15만원 절약 |
| toolUsed | `chatgpt` |
| additionalTools | `claude` |
| difficulty | easy |
| tags | 영어면접, 영어회화, 교환학생, 스피킹, 면접준비 |

### Case 15: 직장인 - 데이터 분석

| Field | Value |
|-------|-------|
| slug | `sales-data-insight` |
| title | 엑셀 데이터에서 매출 하락 원인을 찾아낸 영업팀장 |
| profession | `office-worker` |
| professionLabel | 영업팀장 |
| situation | `data-analysis` |
| persona | 영업팀장 박성민 (41세, 제조업) |
| challenge | 분기 매출이 8% 하락했는데 원인을 파악하지 못하고 있었다. 수만 행의 거래 데이터가 있지만, 엑셀 피벗 테이블 정도만 다룰 수 있어 깊은 분석이 불가능했다. |
| solution | 매출 데이터 CSV를 Claude에 업로드하고 "분기별 매출 변동의 원인을 분석해줘. 제품별, 지역별, 고객 유형별로 나눠서 보여줘"라고 요청했다. 특정 지역의 특정 제품군에서 집중적으로 하락이 발생했다는 인사이트를 얻었다. |
| result | 매출 하락 원인을 2일 만에 특정 (기존 방식으로는 외부 컨설팅 필요 예상). 해당 지역에 집중 마케팅 투입하여 다음 분기 매출 회복. 분석 비용 500만원 절약. |
| resultHighlight | 외부 컨설팅 500만원 → AI로 자체 분석 |
| toolUsed | `claude` |
| difficulty | medium |
| tags | 데이터분석, 매출분석, 엑셀, 인사이트, 의사결정 |

### Case 16: 마케터 - 발표자료

| Field | Value |
|-------|-------|
| slug | `pitch-deck-overnight` |
| title | 긴급 투자 피칭 자료를 하룻밤에 완성한 마케팅 팀장 |
| profession | `marketer` |
| professionLabel | 마케팅 팀장 |
| situation | `presentation-slides` |
| persona | 마케팅 팀장 송현아 (36세, 스타트업) |
| challenge | 내일 오전 VC 미팅이 급하게 잡혔는데 피칭 덱이 준비되지 않은 상태였다. 시장 분석, 경쟁사 비교, 재무 전망까지 포함된 20장 분량의 프레젠테이션이 필요했다. |
| solution | ChatGPT에 사업 모델과 핵심 데이터를 제공하고 슬라이드 구조를 잡았다. Gamma에 내용을 입력하여 디자인된 프레젠테이션을 자동 생성했다. Perplexity로 시장 데이터를 보충하여 신뢰성을 높였다. |
| result | 20장 피칭 덱을 5시간 만에 완성 (기존 일주일 소요). VC로부터 "자료가 체계적이고 데이터가 탄탄하다"는 피드백. 시드 투자 유치 성공. |
| resultHighlight | 피칭 덱 1주 → 5시간 |
| toolUsed | `gamma` |
| additionalTools | `chatgpt`, `perplexity` |
| difficulty | hard |
| tags | 발표자료, 피칭, 투자, 프레젠테이션, 스타트업 |

### Case 17: 자영업자 - 번역

| Field | Value |
|-------|-------|
| slug | `overseas-expansion-translation` |
| title | 해외 마켓 진출을 위한 상품 설명 번역을 직접 해낸 사장님 |
| profession | `business-owner` |
| professionLabel | 핸드메이드 액세서리 사업자 |
| situation | `translation` |
| persona | 핸드메이드 액세서리 사업자 김소희 (39세) |
| challenge | Etsy에 입점하려면 50개 상품의 설명, 배송 정책, FAQ를 영어로 번역해야 했다. 전문 번역 업체 견적이 200만원으로 부담이 컸고, 구글 번역은 어색했다. |
| solution | DeepL로 기본 번역을 하고, Claude에 "Etsy에서 잘 팔리는 핸드메이드 상품 설명 톤으로 다듬어줘"라고 교정을 요청했다. 네이티브 수준의 감성적인 상품 설명을 완성했다. |
| result | 번역 비용 200만원 → 0원 (AI 무료 기능 활용). Etsy 입점 2주 만에 첫 해외 주문. 월 해외 매출 50만원 달성. |
| resultHighlight | 번역 비용 200만원 → 0원, 해외 매출 개시 |
| toolUsed | `deepl` |
| additionalTools | `claude` |
| difficulty | easy |
| tags | 번역, 해외진출, Etsy, 영어, 쇼핑몰, 자영업 |

---

## Coverage Summary

### Profession Coverage (7 professions)

| Profession | Label | Case Count | Case Slugs |
|------------|-------|------------|------------|
| `marketer` | 마케터 | 3 | weekly-report-automation, sns-content-calendar, pitch-deck-overnight |
| `developer` | 개발자 | 2 | debugging-legacy-code, solo-dev-code-review |
| `designer` | 디자이너 | 2 | youtube-thumbnail-workflow, app-prototype-speed |
| `student` | 학생 | 3 | paper-review-for-thesis, exam-prep-study-buddy, english-speaking-practice |
| `office-worker` | 직장인 | 3 | english-email-confidence, meeting-notes-automation, sales-data-insight |
| `freelancer` | 프리랜서 | 2 | freelancer-blog-seo, competitor-analysis-freelancer |
| `business-owner` | 자영업자 | 2 | product-description-shopowner, overseas-expansion-translation |

### Situation Coverage (13 situations linked)

| Situation Slug | Category | Case Count |
|---------------|----------|------------|
| `pdf-summary` | work | 1 |
| `code-debug` | coding | 1 |
| `thumbnail-creation` | design | 1 |
| `paper-summary` | study | 1 |
| `email-writing` | work | 1 |
| `blog-writing` | content | 2 |
| `sns-content` | content | 1 |
| `code-review` | coding | 1 |
| `ui-design` | design | 1 |
| `concept-explanation` | study | 1 |
| `meeting-notes` | work | 1 |
| `competitor-research` | research | 1 |
| `english-conversation` | study | 1 |
| `data-analysis` | work | 1 |
| `presentation-slides` | work | 1 |
| `translation` | work | 1 |

### Tool Coverage (12 tools referenced)

| Tool | As Primary | As Additional |
|------|-----------|---------------|
| `claude` | 7 | 4 |
| `chatgpt` | 4 | 2 |
| `midjourney` | 2 | 0 |
| `perplexity` | 1 | 2 |
| `gamma` | 1 | 0 |
| `deepl` | 1 | 0 |
| `canva-ai` | 0 | 1 |
| `cursor` | 0 | 1 |
| `grammarly` | 0 | 1 |
| `otter` | 0 | 1 |
| `v0` | 0 | 1 |

### Difficulty Distribution

| Difficulty | Count | Percentage |
|-----------|-------|------------|
| easy | 9 | 53% |
| medium | 6 | 35% |
| hard | 2 | 12% |

---

## Acceptance Criteria

### Data Structure

- [ ] **AC-1:** Given `src/data/use-cases.json` exists, When it is parsed, Then it contains an array of 15+ objects each with all required fields: `slug`, `title`, `profession`, `professionLabel`, `situation`, `persona`, `challenge`, `solution`, `result`, `resultHighlight`, `toolUsed`, `difficulty`, `tags`.
- [ ] **AC-2:** Given any use case object, When its `situation` field is checked against `situations.json`, Then the slug matches an existing situation entry.
- [ ] **AC-3:** Given any use case object, When its `toolUsed` and `additionalTools` fields are checked against `tools.json`, Then all slugs match existing tool entries.
- [ ] **AC-4:** Given the full use case dataset, When professions are counted, Then at least 6 distinct `profession` values exist.
- [ ] **AC-5:** Given the full use case dataset, When linked situations are counted, Then at least 10 distinct `situation` slugs are referenced.

### Listing Page (`/use-cases`)

- [ ] **AC-6:** Given a user navigates to `/use-cases`, When the page loads, Then all use cases render as cards in a responsive grid (1-col mobile, 2-col tablet, 3-col desktop) showing title, persona, resultHighlight, difficulty badge, and profession tag.
- [ ] **AC-7:** Given the listing page is loaded, When a user clicks a profession filter chip (e.g., "마케터"), Then only use cases matching that profession are displayed, and the active filter chip is visually highlighted.
- [ ] **AC-8:** Given the listing page is loaded, When a user clicks a situation category filter chip (e.g., "업무"), Then only use cases whose linked situation belongs to that category are displayed.
- [ ] **AC-9:** Given a filter is active and results are 0, When the user views the page, Then a "해당 조건의 사례가 없습니다" empty state message and a reset button are displayed.

### Detail Page (`/use-cases/[slug]`)

- [ ] **AC-10:** Given a user navigates to `/use-cases/[valid-slug]`, When the page loads, Then the use case content renders in three distinct sections: Challenge, Solution, Result -- each visually separated.
- [ ] **AC-11:** Given a detail page is loaded, When the user views the tool section, Then the primary tool name links to `/tools/[toolUsed]` and any additional tools also link to their respective tool pages.
- [ ] **AC-12:** Given a detail page is loaded, When the user clicks the "나도 해보기" CTA, Then the user is navigated to `/situations/[situation]` (the linked situation guide).
- [ ] **AC-13:** Given a detail page is loaded, When the user scrolls to the bottom, Then 3 related use cases are displayed (prioritizing same profession, then same situation category).

### SEO

- [ ] **AC-14:** Given any `/use-cases/[slug]` page, When the page source is inspected, Then it contains: `<title>` with the use case title, `<meta name="description">` summarizing the case, Open Graph tags (`og:title`, `og:description`, `og:type`), and JSON-LD structured data with `@type: Article`.
- [ ] **AC-15:** Given the `/use-cases` listing page, When the page source is inspected, Then it contains a descriptive `<title>` ("AI 활용 사례 | AI Guide") and `<meta name="description">`.

### Navigation & Cross-linking

- [ ] **AC-16:** Given any page on the site, When the user views the header navigation, Then "활용 사례" (or equivalent) menu item is visible and links to `/use-cases`.

---

## Task Breakdown

1. **Define TypeScript types for use cases** -- S -- Deps: none
   - Create `src/types/use-case.ts` (or add to existing types) with `UseCase`, `Profession`, `UseCaseDifficulty` types.

2. **Create `src/data/use-cases.json`** -- L -- Deps: [1]
   - Write all 17 use cases following the data structure defined above.
   - Validate all `situation` slugs exist in `situations.json`.
   - Validate all `toolUsed`/`additionalTools` slugs exist in `tools.json`.

3. **Build `/use-cases` listing page** -- M -- Deps: [2]
   - `src/app/use-cases/page.tsx`: Server component loading use-cases.json.
   - Responsive card grid layout (Tailwind CSS).
   - SEO metadata (title, description, OG tags).

4. **Build filter UI component** -- M -- Deps: [3]
   - `src/components/UseCaseFilters.tsx`: Client component for profession + category filter chips.
   - Wire up filter state with URL search params (for shareable filtered views).
   - Implement empty state for 0-result filters.

5. **Build use case card component** -- S -- Deps: [3]
   - `src/components/UseCaseCard.tsx`: Displays title, persona, resultHighlight, difficulty badge, profession tag.
   - Link to `/use-cases/[slug]`.

6. **Build `/use-cases/[slug]` detail page** -- M -- Deps: [2]
   - `src/app/use-cases/[slug]/page.tsx`: Server component with `generateStaticParams`.
   - Challenge → Solution → Result structured layout.
   - Tool links to `/tools/[slug]`.
   - "나도 해보기" CTA linking to `/situations/[situation]`.
   - SEO metadata + JSON-LD structured data.

7. **Build related use cases section** -- S -- Deps: [5, 6]
   - Component at bottom of detail page showing 3 related cases.
   - Matching logic: same profession first, then same situation category.

8. **Add header navigation link** -- S -- Deps: [3]
   - Add "활용 사례" to site header/nav component.

9. **Add cross-links from situation pages** -- S -- Deps: [5]
   - On `/situations/[slug]` pages, show 2 related use case cards at the bottom (where `use-case.situation === situation.slug`).

10. **Write tests** -- M -- Deps: [2, 3, 6]
    - Data validation test: all slugs cross-reference correctly.
    - Component rendering tests for card and detail page.
    - Filter functionality test.

---

## Open Questions

1. **URL path**: PRD mentions `/cases` but this spec uses `/use-cases` for clarity and SEO ("AI 활용 사례" is a better keyword than "cases"). Confirm which path to use.
2. **Profession taxonomy expansion**: 7 professions are defined here. Should we keep "business-owner" separate from "office-worker" or merge them to simplify filters?
3. **Image assets**: Should use case cards include persona illustrations or icons, or keep them text-only for this cycle?

---

## Out of Scope

- **User-generated content (UGC)**: Sase submission by users requires account system (Phase 3).
- **Real user interviews**: Current cases are representative scenarios, not verbatim user stories. Real interview-based cases can be added in Phase 3.
- **Likes / bookmarks**: Require user account system.
- **Multilingual cases**: Korean only for now. English cases for Phase 4.
- **Analytics event tracking**: GA4 events for use-case views/clicks are deferred to the analytics task in the backlog.
