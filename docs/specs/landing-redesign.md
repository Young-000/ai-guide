# Landing Page Redesign - 구현 명세서

## JTBD

> 처음 AI 가이드 사이트에 방문했을 때, "이 서비스가 나에게 딱 맞는 곳이구나"를 5초 안에 느끼고, "나에게 맞는 AI 찾기"를 시작하여, 개인화된 추천 결과를 받고 싶다.

## Problem

- **Who:** AI를 전혀 모르거나 이제 막 관심을 갖기 시작한 일반 대중 (4개 페르소나: 직장인/대학생/크리에이터/자영업자)
- **Pain:** (빈도: 매우 높음) x (심각도: 중간) -- AI를 써야 하는 건 알겠는데, 어디서 시작해야 할지 모름. 검색하면 도구가 너무 많고, 비교 기사는 기술적이어서 와닿지 않음
- **Current workaround:** 유튜브 "ChatGPT 사용법" 검색, 블로그 글 훑어보기, 친구에게 물어보기, 또는 아무것도 안 함
- **Success metric:**
  - 랜딩 페이지 → 온보딩 시작 전환율 25%+ (CTA 클릭)
  - 평균 체류 시간 45초+ (스크롤 깊이 50%+)
  - 바운스율 60% 이하
  - 랜딩 → 가이드 실행까지 도달율 15%+

---

## Solution

### Overview

현재 랜딩 페이지는 "도구 가이드" 느낌의 검색 중심 UI다. 이를 **온보딩 플랫폼**의 첫인상에 맞게 전면 재설계한다. 핵심 변화는:

1. **가치 제안 우선**: 검색창 대신 히어로 메시지 + CTA가 첫 화면
2. **공감형 진입**: 페르소나별 공감 문구로 "나를 위한 서비스"임을 느끼게
3. **신뢰 구축**: 숫자 기반 실적 + 3단계 프로세스 설명으로 진입 장벽 낮춤
4. **검색 기능 보존**: 기존 검색/카테고리/인기 상황은 하단 섹션으로 이동 (기존 사용자 경험 유지)

이 접근을 선택한 이유: 현재 페이지는 "이미 무엇을 하고 싶은지 아는 사용자"를 전제로 한다. v2.0 타겟은 "무엇을 해야 할지 모르는 사용자"이므로, 검색보다 가이디드 온보딩이 우선이다.

### User Flow

```
1. 사용자가 / 에 진입
2. Hero Section: 가치 제안 읽음 → "나에게 맞는 AI 찾기" CTA 클릭
   → /onboarding으로 이동 (별도 스펙)
   OR
2b. 스크롤 다운 → Pain Points 섹션에서 자신의 페르소나 발견 → CTA 클릭
   → /onboarding으로 이동
   OR
2c. 스크롤 다운 → Popular Situations 섹션에서 관심 상황 클릭
   → /situations/[slug]로 이동
   OR
2d. "바로 검색하기" 링크 클릭 → 페이지 내 검색 섹션으로 스크롤
   → 기존 검색 플로우 진행
```

```
[랜딩 진입] → [Hero: 가치 제안 + CTA]
                    ↓ (스크롤)
              [Pain Points: 공감]
                    ↓
              [How It Works: 3단계]
                    ↓
              [Popular Situations: 미리보기]
                    ↓
              [Stats: 신뢰]
                    ↓
              [Quick Search: 직접 탐색]
                    ↓
              [Final CTA: 마지막 전환]

Error/Edge:
- /onboarding 미구현 시: CTA가 /situations로 이동 (fallback)
- 재방문 사용자 (isOnboarded === true): 온보딩 모달 스킵, Hero에 "돌아오셨군요!" 문구 + 이어하기 CTA
```

---

## 페이지 구조 (섹션별 상세)

### Section 1: Hero Section

**목적**: 5초 안에 "이 서비스가 뭔지, 나에게 왜 필요한지" 전달

**레이아웃:**
```
┌──────────────────────────────────────────────────┐
│ (그라디언트 배경: blue-50 → white)                 │
│                                                   │
│        [서브 헤드: 텍스트 뱃지]                     │
│        "AI 입문자 10명 중 8명이 겪는 문제"          │
│                                                   │
│        [메인 헤드라인]                              │
│        "5분 만에 나에게 딱 맞는                     │
│         AI를 찾아보세요"                            │
│                                                   │
│        [서브 카피]                                  │
│        "간단한 질문 3개에 답하면,                    │
│         당신의 상황에 맞는 AI 도구와                 │
│         바로 따라할 수 있는 가이드를 드려요"          │
│                                                   │
│        [Primary CTA]  [Secondary CTA]             │
│        "나에게 맞는     "상황별 가이드               │
│         AI 찾기 →"      바로 보기"                  │
│                                                   │
│        [신뢰 지표: 인라인]                          │
│        "19개 상황 가이드 | 21개 AI 도구 | 무료"     │
│                                                   │
└──────────────────────────────────────────────────┘
```

**카피 상세:**
- 서브 헤드 뱃지: 배경색 있는 작은 pill 형태. 텍스트: `AI 입문자 10명 중 8명이 겪는 문제`
- 메인 헤드라인: `text-4xl md:text-5xl font-bold`. "5분 만에 나에게 딱 맞는 AI를 찾아보세요"
- 서브 카피: `text-lg text-gray-600`. "간단한 질문 3개에 답하면, 당신의 상황에 맞는 AI 도구와 바로 따라할 수 있는 가이드를 드려요"
- Primary CTA: 그라디언트 버튼 (blue-500 → indigo-500), `text-lg font-bold py-4 px-8 rounded-2xl`. 텍스트: "나에게 맞는 AI 찾기" + 화살표 아이콘. `/onboarding`으로 링크 (미구현 시 `/situations` fallback)
- Secondary CTA: 아웃라인 버튼 (border-gray-300, text-gray-700). "상황별 가이드 바로 보기". 페이지 내 Popular Situations 섹션으로 스크롤
- 신뢰 지표: 가로 나열, 파이프(|) 구분. 수치는 `situations.json`과 `tools.json`의 실제 개수 반영

**재방문 사용자 분기:**
- `loadProgress()`의 `isOnboarded === true`인 경우:
  - 서브 헤드: "다시 오셨군요!"
  - 메인 헤드라인: "이어서 AI 활용법을 배워보세요"
  - Primary CTA: "이어서 학습하기" → `/situations`
  - Secondary CTA: "처음부터 다시" → `/onboarding`

---

### Section 2: Pain Points (페르소나별 공감)

**목적**: "이 서비스가 나를 위한 것"이라는 공감 유도

**레이아웃:**
```
┌──────────────────────────────────────────────────┐
│ (bg-white)                                        │
│                                                   │
│  [섹션 타이틀]                                     │
│  "혹시 이런 고민 있으신가요?"                        │
│                                                   │
│  ┌──────────┐ ┌──────────┐                        │
│  │ 직장인    │ │ 대학생    │                        │
│  │ 💼        │ │ 📚        │                        │
│  │ "팀장이   │ │ "AI로    │                        │
│  │ AI 쓰라는 │ │ 레포트   │                        │
│  │ 데 뭐부터 │ │ 쓰고     │                        │
│  │ 해야..."  │ │ 싶은데..."│                        │
│  │           │ │           │                        │
│  │ [맞춤     │ │ [맞춤     │                        │
│  │  추천 →]  │ │  추천 →]  │                        │
│  └──────────┘ └──────────┘                        │
│  ┌──────────┐ ┌──────────┐                        │
│  │ 크리에이터│ │ 자영업자  │                        │
│  │ 🎨        │ │ 🏪        │                        │
│  │ "이미지   │ │ "AI가    │                        │
│  │ AI 너무   │ │ 대세라는 │                        │
│  │ 많은데    │ │ 데 뭔지  │                        │
│  │ 뭐가..."  │ │ 모르겠..."│                        │
│  │           │ │           │                        │
│  │ [맞춤     │ │ [맞춤     │                        │
│  │  추천 →]  │ │  추천 →]  │                        │
│  └──────────┘ └──────────┘                        │
│                                                   │
└──────────────────────────────────────────────────┘
```

**카드 데이터 (4장):**

| 페르소나 | 아이콘 | 라벨 | 공감 문구 | CTA 텍스트 | CTA 링크 |
|----------|--------|------|----------|-----------|---------|
| 직장인 | 💼 | 직장인이세요? | "팀장이 AI 활용하라는데, 뭐부터 시작해야 할지 모르겠어요" | 직장인 맞춤 추천 | `/onboarding?persona=office_worker` |
| 대학생 | 📚 | 학생이세요? | "AI로 레포트 쓰고 싶은데, 프롬프트를 어떻게 써야 할지..." | 학생 맞춤 추천 | `/onboarding?persona=student` |
| 크리에이터 | 🎨 | 크리에이터세요? | "이미지 AI가 너무 많은데, 내 작업에 뭐가 맞는지 모르겠어요" | 크리에이터 맞춤 추천 | `/onboarding?persona=creator` |
| 자영업자 | 🏪 | 사업하세요? | "AI가 대세라는데, 내 사업에 어떻게 활용하는 건지..." | 사업자 맞춤 추천 | `/onboarding?persona=business_owner` |

**디자인:**
- 모바일: 1열 (세로 스택)
- 태블릿: 2열 그리드
- 데스크톱: 4열 또는 2x2 그리드
- 카드: `bg-white border border-gray-100 rounded-2xl p-6 hover:border-blue-200 hover:shadow-md transition-all`
- 카드 내부 CTA: 텍스트 링크 스타일 (파란색, 화살표 포함). `text-sm font-medium text-blue-600 hover:text-blue-700`

---

### Section 3: How It Works (3단계 프로세스)

**목적**: "어렵지 않다"는 인식 심기. 진입 장벽 낮추기.

**레이아웃:**
```
┌──────────────────────────────────────────────────┐
│ (bg-gray-50, py-16)                               │
│                                                   │
│  [섹션 타이틀]                                     │
│  "3단계만 따라오세요"                               │
│  [서브 타이틀]                                     │
│  "5분이면 당신만의 AI 활용법을 알 수 있어요"         │
│                                                   │
│  ┌────────┐    ┌────────┐    ┌────────┐          │
│  │ Step 1 │───→│ Step 2 │───→│ Step 3 │          │
│  │ 📋     │    │ 🎯     │    │ 🚀     │          │
│  │ 3가지  │    │ 맞춤   │    │ 바로   │          │
│  │ 질문에 │    │ AI 도구│    │ 따라   │          │
│  │ 답하기 │    │ 추천   │    │ 하기   │          │
│  │        │    │ 받기   │    │        │          │
│  │ "30초  │    │ "나에게│    │ "프롬프│          │
│  │ 이면   │    │ 딱 맞는│    │ 트 복사│          │
│  │ 충분"  │    │ AI를   │    │ 해서   │          │
│  │        │    │ 알려줘요│    │ 바로   │          │
│  │        │    │ "      │    │ 실행"  │          │
│  └────────┘    └────────┘    └────────┘          │
│                                                   │
└──────────────────────────────────────────────────┘
```

**스텝 데이터:**

| Step | 아이콘 | 제목 | 설명 | 소요 시간 |
|------|--------|------|------|----------|
| 1 | 📋 | 3가지 질문에 답하기 | "무슨 일을 하세요?", "뭘 하고 싶으세요?", "AI 써본 적 있으세요?" — 30초면 충분해요 | 30초 |
| 2 | 🎯 | 맞춤 AI 도구 추천 받기 | 당신의 상황에 딱 맞는 AI 도구와 그 이유를 알려드려요 | 즉시 |
| 3 | 🚀 | 바로 따라하기 | 프롬프트 복사해서 붙여넣기만 하면 끝. 단계별 가이드로 5분 안에 첫 결과를 만들어보세요 | 5분 |

**디자인:**
- 모바일: 세로 타임라인 (각 스텝 사이 점선 연결)
- 데스크톱: 3열 가로 배치 + 스텝 사이 화살표(→) 연결선
- 각 스텝: 상단에 원형 번호 뱃지 (1, 2, 3) + 아이콘
- 색상: Step 번호는 `bg-blue-500 text-white rounded-full w-8 h-8`

---

### Section 4: Popular Situations (인기 상황 미리보기)

**목적**: "이런 것도 할 수 있구나" 발견 + 온보딩 없이 바로 진입 경로 제공

**레이아웃:**
```
┌──────────────────────────────────────────────────┐
│ (bg-white, py-16)                                 │
│                                                   │
│  [섹션 타이틀]                                     │
│  "지금 가장 많이 찾는 AI 활용법"                     │
│                                                   │
│  [카테고리 필터 버튼: 전체 | 업무 | 학습 | 개발 | ...]│
│                                                   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│  │ 📄 PDF  │ │ 📧 이메일│ │ 💻 코드  │            │
│  │ 문서    │ │ 작성    │ │ 에러    │            │
│  │ 요약    │ │ 하기    │ │ 해결    │            │
│  │         │ │         │ │         │            │
│  │ Claude  │ │ ChatGPT │ │ Cursor  │            │
│  │ 쉬움    │ │ 쉬움    │ │ 보통    │            │
│  │ 5-10분  │ │ 3-5분   │ │ 5-10분  │            │
│  └─────────┘ └─────────┘ └─────────┘            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│  │ 📊 발표  │ │ 📝 논문  │ │ 🖼️ 이미지│            │
│  │ 자료    │ │ 파악    │ │ 생성    │            │
│  │ 만들기  │ │ 하기    │ │ 하기    │            │
│  └─────────┘ └─────────┘ └─────────┘            │
│                                                   │
│  [더보기 CTA: "19개 전체 가이드 보기 →"]            │
│                                                   │
└──────────────────────────────────────────────────┘
```

**데이터 소스:** `situations.json`에서 priority 상위 6개 자동 추출 (`getPopularSituations(situations, 6)` 기존 함수 활용)

**카드 표시 정보:**
- 아이콘 + 제목
- 추천 도구명 (primary tool)
- 난이도 뱃지 (쉬움/보통/어려움)
- 예상 소요 시간
- 클릭 시 → `/situations/[slug]` 이동

**디자인:**
- 모바일: 1열 리스트 또는 2열 compact 그리드
- 데스크톱: 3열 그리드
- 카테고리 필터: 기존 `CategoryButtons` 컴포넌트 재활용
- 카드: 기존 `ResultCard` 컴포넌트 수정 활용 (클릭 시 페이지 이동 버전)
- "더보기" 링크: `/situations` 페이지로 이동

---

### Section 5: Social Proof / Stats

**목적**: 숫자로 신뢰 구축. "다른 사람들도 이미 사용 중"

**레이아웃:**
```
┌──────────────────────────────────────────────────┐
│ (bg-gradient: blue-50 → indigo-50, py-12)         │
│                                                   │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐ │
│  │  19개  │  │  21개  │  │  38+   │  │  100%  │ │
│  │ 상황별 │  │ AI 도구│  │프롬프트│  │  무료  │ │
│  │ 가이드 │  │ 수록   │  │ 템플릿 │  │       │ │
│  └────────┘  └────────┘  └────────┘  └────────┘ │
│                                                   │
└──────────────────────────────────────────────────┘
```

**통계 데이터:**

| 숫자 | 라벨 | 데이터 소스 |
|------|------|-----------|
| 19 | 상황별 가이드 | `situations.json` 배열 길이 (동적) |
| 21 | AI 도구 수록 | `tools.json` 배열 길이 (동적) |
| 38+ | 프롬프트 템플릿 | 전체 situations의 prompts 배열 길이 합계 (동적) |
| 100% | 무료 | 정적 텍스트 |

**중요**: 숫자는 하드코딩하지 않고 JSON 데이터에서 런타임 계산하여, 콘텐츠 추가 시 자동 반영.

**디자인:**
- 4개 숫자 가로 배치 (모바일: 2x2 그리드)
- 숫자: `text-3xl md:text-4xl font-bold text-blue-600`
- 라벨: `text-sm text-gray-600`
- 카운트업 애니메이션: **Should have** (Could로 내려도 됨). IntersectionObserver로 뷰포트 진입 시 0부터 카운트업

---

### Section 6: Quick Search (기존 검색 기능 보존)

**목적**: 이미 무엇을 하고 싶은지 아는 사용자를 위한 직접 진입 경로

**레이아웃:**
```
┌──────────────────────────────────────────────────┐
│ (bg-white, py-12)                                 │
│                                                   │
│  [섹션 타이틀]                                     │
│  "찾고 싶은 AI 활용법이 있으세요?"                   │
│                                                   │
│  [SearchInput 컴포넌트]                            │
│  "PDF 요약하고 싶어요" 등 placeholder              │
│                                                   │
│  [검색 결과 표시 영역]                              │
│  (기존 ResultCard + GuidePanel 2열 레이아웃)       │
│                                                   │
└──────────────────────────────────────────────────┘
```

**구현:**
- 기존 `page.tsx`의 검색 로직 (query, selectedCategory, searchResults 등)을 이 섹션에 배치
- `SearchInput`, `CategoryButtons`, `ResultCard` 컴포넌트 재활용
- 검색 결과 클릭 시: 모바일은 `/situations/[slug]`로 이동, 데스크톱은 인라인 `GuidePanel` 표시 (기존 동작 유지)
- `id="search"` 속성 부여 → Hero Secondary CTA에서 `#search`로 스크롤 가능

---

### Section 7: Final CTA

**목적**: 페이지 끝까지 스크롤한 사용자에게 마지막 전환 기회

**레이아웃:**
```
┌──────────────────────────────────────────────────┐
│ (bg-gradient: blue-600 → indigo-600, text-white)  │
│                                                   │
│  "아직 어떤 AI를 써야 할지 모르겠다면?"              │
│  "3가지 질문에 답하면 바로 알려드릴게요"              │
│                                                   │
│  [CTA: "무료로 시작하기 →"]                        │
│                                                   │
│  "가입 없이, 30초면 충분해요"                       │
│                                                   │
└──────────────────────────────────────────────────┘
```

**디자인:**
- 다크 배경 (blue-600 → indigo-600 그라디언트)에 화이트 텍스트
- CTA 버튼: `bg-white text-blue-600 font-bold py-4 px-8 rounded-2xl hover:bg-gray-100`
- 하단 작은 텍스트로 "가입 없이, 30초면 충분해요" — 진입 부담 최소화

---

## Scope (MoSCoW)

### Must have (이것 없이 릴리스 불가)

- [ ] Hero Section: 가치 제안 헤드라인 + Primary CTA ("나에게 맞는 AI 찾기") + Secondary CTA
- [ ] Pain Points Section: 4개 페르소나 공감 카드 + 각 CTA 링크
- [ ] How It Works Section: 3단계 프로세스 시각화
- [ ] Popular Situations Section: 인기 상황 6개 카드 (데이터 기반)
- [ ] Stats Section: 4개 핵심 수치 (JSON 데이터 기반 동적 계산)
- [ ] Final CTA Section: 하단 전환 유도
- [ ] 모바일/데스크톱 반응형 레이아웃 (모바일 퍼스트)
- [ ] 기존 검색 기능 보존 (Quick Search 섹션)
- [ ] SEO 메타태그 업데이트 (title, description, OG, Twitter)
- [ ] layout.tsx의 metadata 업데이트
- [ ] CTA 클릭 시 적절한 라우팅 (`/onboarding` 미구현 시 `/situations` fallback)

### Should have (중요하지만 없어도 동작)

- [ ] 재방문 사용자 분기 (isOnboarded 기반 Hero 문구 변경)
- [ ] 숫자 카운트업 애니메이션 (IntersectionObserver)
- [ ] 부드러운 스크롤 애니메이션 (섹션 간 전환)
- [ ] Hero → Search 스무스 스크롤 (Secondary CTA)
- [ ] 페르소나 카드 hover 효과

### Could have (시간 되면)

- [ ] Lottie/SVG 애니메이션 (Hero 섹션 일러스트)
- [ ] 페이지 로드 시 Hero 텍스트 타이핑 효과
- [ ] 스크롤 기반 섹션 페이드인 애니메이션
- [ ] 기존 온보딩 모달 → 새 랜딩으로 대체 후 제거

### Won't have (이번 사이클)

- [ ] A/B 테스트 인프라 (Phase 2)
- [ ] GA4 이벤트 추적 (별도 사이클 5에서 구현)
- [ ] AdSense 배치 (별도 사이클 5)
- [ ] /onboarding 페이지 자체 (별도 사이클 2에서 구현)
- [ ] 영상/GIF 콘텐츠
- [ ] 다국어 지원

---

## 컴포넌트 목록

### 새로 만들 컴포넌트

| 컴포넌트 | 파일명 | 설명 | 복잡도 |
|----------|--------|------|--------|
| `HeroSection` | `src/components/landing/HeroSection.tsx` | 가치 제안 + CTA 영역 | M |
| `PainPointsSection` | `src/components/landing/PainPointsSection.tsx` | 페르소나별 공감 카드 4장 | S |
| `PersonaCard` | `src/components/landing/PersonaCard.tsx` | 개별 페르소나 공감 카드 | S |
| `HowItWorksSection` | `src/components/landing/HowItWorksSection.tsx` | 3단계 프로세스 표시 | S |
| `StatsSection` | `src/components/landing/StatsSection.tsx` | 숫자 통계 4개 | S |
| `FinalCtaSection` | `src/components/landing/FinalCtaSection.tsx` | 하단 전환 CTA | S |
| `PopularSituationsSection` | `src/components/landing/PopularSituationsSection.tsx` | 인기 상황 카드 그리드 + 카테고리 필터 | M |
| `QuickSearchSection` | `src/components/landing/QuickSearchSection.tsx` | 기존 검색 기능 래퍼 | M |
| `SituationCardCompact` | `src/components/landing/SituationCardCompact.tsx` | 인기 상황용 컴팩트 카드 (링크 기반) | S |

### 기존 재활용 컴포넌트

| 컴포넌트 | 수정 사항 |
|----------|----------|
| `SearchInput` | 수정 불필요. 그대로 재활용 |
| `CategoryButtons` | 수정 불필요. 그대로 재활용 |
| `ResultCard` | 수정 불필요. Quick Search 섹션에서 기존 방식 그대로 |
| `GuidePanel` | 수정 불필요. Quick Search 섹션에서 기존 방식 그대로 |
| `Header` | **수정 필요**: 네비게이션에 "시작하기" 버튼 추가 검토 (Should have) |
| `Footer` | 수정 불필요 |
| `OnboardingModal` | **제거 검토**: 새 랜딩이 온보딩 역할을 대체. Could have로 이번 사이클에서는 유지하되, Hero CTA가 대체 역할 |

### 폴더 구조

```
src/components/
├── landing/           # 새로 생성 — 랜딩 전용 컴포넌트
│   ├── HeroSection.tsx
│   ├── PainPointsSection.tsx
│   ├── PersonaCard.tsx
│   ├── HowItWorksSection.tsx
│   ├── PopularSituationsSection.tsx
│   ├── SituationCardCompact.tsx
│   ├── StatsSection.tsx
│   ├── QuickSearchSection.tsx
│   ├── FinalCtaSection.tsx
│   └── index.ts       # barrel export
├── SearchInput.tsx     # 기존 유지
├── CategoryButtons.tsx # 기존 유지
├── ResultCard.tsx      # 기존 유지
├── GuidePanel.tsx      # 기존 유지
└── ...                 # 기타 기존 컴포넌트
```

---

## 데이터 요구사항

### 기존 JSON 데이터 활용 (수정 불필요)

| 파일 | 용도 | 사용 섹션 |
|------|------|----------|
| `src/data/situations.json` | 인기 상황 목록, 통계 수치 | Popular Situations, Stats |
| `src/data/tools.json` | 도구 개수 통계 | Stats |

### 새로 필요한 정적 데이터

별도 JSON 파일은 필요 없음. 아래 데이터는 컴포넌트 내부에 상수로 정의한다 (빈번한 변경 예상 없음).

**1. 페르소나 카드 데이터 (`PainPointsSection.tsx` 내부)**

```typescript
type PersonaType = 'office_worker' | 'student' | 'creator' | 'business_owner';

interface PersonaCardData {
  type: PersonaType;
  icon: string;
  label: string;
  question: string;     // "직장인이세요?"
  painPoint: string;    // 공감 문구
  ctaText: string;      // CTA 버튼 텍스트
  ctaHref: string;      // CTA 링크
}

const PERSONA_CARDS: PersonaCardData[] = [
  {
    type: 'office_worker',
    icon: '💼',
    label: '직장인이세요?',
    painPoint: '팀장이 AI 활용하라는데, 뭐부터 시작해야 할지 모르겠어요',
    ctaText: '직장인 맞춤 추천',
    ctaHref: '/onboarding?persona=office_worker',
  },
  {
    type: 'student',
    icon: '📚',
    label: '학생이세요?',
    painPoint: 'AI로 레포트 쓰고 싶은데, 프롬프트를 어떻게 써야 할지...',
    ctaText: '학생 맞춤 추천',
    ctaHref: '/onboarding?persona=student',
  },
  {
    type: 'creator',
    icon: '🎨',
    label: '크리에이터세요?',
    painPoint: '이미지 AI가 너무 많은데, 내 작업에 뭐가 맞는지 모르겠어요',
    ctaText: '크리에이터 맞춤 추천',
    ctaHref: '/onboarding?persona=creator',
  },
  {
    type: 'business_owner',
    icon: '🏪',
    label: '사업하세요?',
    painPoint: 'AI가 대세라는데, 내 사업에 어떻게 활용하는 건지...',
    ctaText: '사업자 맞춤 추천',
    ctaHref: '/onboarding?persona=business_owner',
  },
];
```

**2. How It Works 스텝 데이터 (`HowItWorksSection.tsx` 내부)**

```typescript
interface HowItWorksStep {
  step: number;
  icon: string;
  title: string;
  description: string;
  duration: string;
}

const STEPS: HowItWorksStep[] = [
  {
    step: 1,
    icon: '📋',
    title: '3가지 질문에 답하기',
    description: '"무슨 일을 하세요?", "뭘 하고 싶으세요?", "AI 써본 적 있으세요?" — 30초면 충분해요',
    duration: '30초',
  },
  {
    step: 2,
    icon: '🎯',
    title: '맞춤 AI 도구 추천 받기',
    description: '당신의 상황에 딱 맞는 AI 도구와 그 이유를 알려드려요',
    duration: '즉시',
  },
  {
    step: 3,
    icon: '🚀',
    title: '바로 따라하기',
    description: '프롬프트 복사해서 붙여넣기만 하면 끝. 5분 안에 첫 결과물을 만들어보세요',
    duration: '5분',
  },
];
```

**3. 통계 계산 로직 (`StatsSection.tsx` 내부)**

```typescript
import situationsData from '@/data/situations.json';
import toolsData from '@/data/tools.json';

const situations = situationsData.situations;
const tools = toolsData.tools;

// 동적으로 계산
const totalSituations = situations.length;         // 19
const totalTools = tools.length;                   // 21
const totalPrompts = situations.reduce(
  (sum, s) => sum + (s.prompts?.length || 0), 0
);                                                  // 38+
```

---

## 디자인 방향

### 톤앤매너

- **친근하고 쉬운 존댓말** ("~해요" 체). 기술 용어 최소화
- **공감 → 해결** 구조: 먼저 사용자 고민에 공감, 그 다음 해결책 제시
- **짧은 문장**: 한 문장 당 30자 이내 권장. 한눈에 읽히도록
- **자신감 있는 톤**: "아마 도움이 될 거예요" (X) → "5분이면 찾을 수 있어요" (O)
- 참고: 뉴닉, 토스, 리멤버의 한국어 랜딩 페이지 톤

### 컬러 팔레트

기존 프로젝트 컬러 시스템을 유지하되 확장:

| 용도 | 컬러 | Tailwind 클래스 |
|------|------|----------------|
| Primary CTA | blue-500 → indigo-500 그라디언트 | `bg-gradient-to-r from-blue-500 to-indigo-500` |
| Secondary CTA | white + gray border | `bg-white border-gray-300 text-gray-700` |
| 섹션 배경 (교차) | white / gray-50 | `bg-white` / `bg-gray-50` |
| 강조 텍스트 | blue-600 | `text-blue-600` |
| 본문 텍스트 | gray-900 (제목), gray-600 (본문) | `text-gray-900` / `text-gray-600` |
| 서브 텍스트 | gray-400 | `text-gray-400` |
| Final CTA 배경 | blue-600 → indigo-600 그라디언트 | `bg-gradient-to-r from-blue-600 to-indigo-600` |
| 성공/긍정 | green-500 | 난이도 "쉬움" 뱃지 등 |

### 타이포그래피

| 요소 | 크기 | 클래스 |
|------|------|--------|
| Hero 메인 헤드라인 | 36px → 48px | `text-4xl md:text-5xl font-bold leading-tight` |
| 섹션 타이틀 | 28px → 32px | `text-2xl md:text-3xl font-bold` |
| 섹션 서브 타이틀 | 16px → 18px | `text-base md:text-lg text-gray-600` |
| 카드 제목 | 18px | `text-lg font-bold` |
| 본문 | 16px | `text-base text-gray-600 leading-relaxed` |
| 작은 텍스트 | 14px | `text-sm text-gray-500` |
| CTA 버튼 텍스트 | 18px | `text-lg font-bold` |

### 간격 (Spacing)

| 요소 | 간격 |
|------|------|
| 섹션 간 패딩 | `py-16 md:py-20` |
| 섹션 내 콘텐츠 간격 | `space-y-8` |
| 그리드 gap | `gap-4 md:gap-6` |
| 카드 패딩 | `p-6` |
| 최대 너비 | `max-w-6xl mx-auto` (Hero: `max-w-3xl`) |

### 반응형 브레이크포인트

| 뷰포트 | 적용 |
|--------|------|
| 모바일 (< 768px) | 1열, 수직 스택, 패딩 축소 |
| 태블릿 (768px~1024px) | 2열 그리드 |
| 데스크톱 (> 1024px) | 3~4열 그리드, 최대 너비 제한 |

---

## SEO 요구사항

### 메타태그 업데이트 (`layout.tsx`의 metadata)

```typescript
export const metadata: Metadata = {
  title: 'AI 가이드 | 5분 만에 나에게 맞는 AI 찾기',
  description:
    'AI를 처음 시작하는 분을 위한 맞춤형 가이드. 3가지 질문에 답하면 나에게 딱 맞는 AI 도구와 바로 따라할 수 있는 사용법을 알려드려요. 무료.',
  keywords: [
    'AI 추천',
    'AI 가이드',
    'AI 입문',
    'AI 초보',
    'ChatGPT 사용법',
    'Claude 사용법',
    'AI 도구 추천',
    'AI 활용법',
    'AI 시작하기',
    '인공지능 입문',
    'AI 도구 비교',
    '맞춤 AI 추천',
  ],
  authors: [{ name: 'AI Guide Team' }],
  robots: { index: true, follow: true },
  openGraph: {
    title: 'AI 가이드 | 5분 만에 나에게 맞는 AI 찾기',
    description:
      '3가지 질문에 답하면 나에게 딱 맞는 AI 도구를 추천해드려요. 바로 따라할 수 있는 단계별 가이드까지.',
    type: 'website',
    url: 'https://ai-guide-nu.vercel.app',
    siteName: 'AI 가이드',
    locale: 'ko_KR',
    // images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AI 가이드' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI 가이드 | 5분 만에 나에게 맞는 AI 찾기',
    description: '3가지 질문에 답하면 나에게 딱 맞는 AI 도구를 추천해드려요.',
    // images: ['/og-image.png'],
  },
};
```

### 구조화 데이터 (JSON-LD)

`page.tsx`에 `<script type="application/ld+json">` 삽입:

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "AI 가이드",
  "url": "https://ai-guide-nu.vercel.app",
  "description": "AI를 처음 시작하는 분을 위한 맞춤형 가이드",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "KRW"
  },
  "inLanguage": "ko"
}
```

### 시맨틱 HTML

- 각 섹션: `<section>` 태그 + `aria-labelledby` 연결
- 각 섹션 제목: `<h2>` (Hero는 `<h1>`)
- CTA 버튼: `<a>` 또는 `<Link>` (페이지 이동), 스크롤은 `<button>`
- 카드 리스트: `<ul>` + `<li>`

---

## Acceptance Criteria

### 필수 (Must)

- [ ] **AC-1**: Given 사용자가 `/`에 접속했을 때, When 페이지가 로드되면, Then Hero Section이 최초 뷰포트에 완전히 표시되고, "나에게 맞는 AI 찾기" CTA 버튼이 보인다
- [ ] **AC-2**: Given Hero Section이 표시되었을 때, When "나에게 맞는 AI 찾기" 버튼을 클릭하면, Then `/onboarding` 페이지로 이동한다 (미구현 시 `/situations`로 이동)
- [ ] **AC-3**: Given Pain Points Section이 표시되었을 때, When 4개 페르소나 카드가 모두 렌더링되면, Then 각 카드에 페르소나별 공감 문구와 CTA가 표시된다
- [ ] **AC-4**: Given 페르소나 카드의 CTA를 클릭했을 때, When 직장인 카드의 "직장인 맞춤 추천"을 클릭하면, Then `/onboarding?persona=office_worker`로 이동한다
- [ ] **AC-5**: Given How It Works Section이 표시되었을 때, When 3개 스텝이 렌더링되면, Then 각 스텝에 번호, 아이콘, 제목, 설명이 표시된다
- [ ] **AC-6**: Given Popular Situations Section이 표시되었을 때, When situations.json에서 인기 상황 6개가 로드되면, Then 각 카드에 제목, 추천 도구, 난이도, 소요 시간이 표시된다
- [ ] **AC-7**: Given 인기 상황 카드를 클릭했을 때, When "PDF 문서 빠르게 요약하기" 카드를 클릭하면, Then `/situations/pdf-summary`로 이동한다
- [ ] **AC-8**: Given Stats Section이 표시되었을 때, When 통계 수치가 렌더링되면, Then 가이드 수(19), 도구 수(21), 프롬프트 수(38+), 무료(100%)가 동적으로 계산되어 표시된다
- [ ] **AC-9**: Given Quick Search Section이 표시되었을 때, When 사용자가 "PDF"를 검색하면, Then 기존과 동일한 검색 결과가 표시된다
- [ ] **AC-10**: Given Final CTA Section이 표시되었을 때, When "무료로 시작하기" 버튼을 클릭하면, Then `/onboarding`으로 이동한다
- [ ] **AC-11**: Given 모바일 뷰포트(375px)일 때, When 모든 섹션이 렌더링되면, Then 가로 스크롤 없이 모든 콘텐츠가 표시된다
- [ ] **AC-12**: Given 데스크톱 뷰포트(1280px)일 때, When 모든 섹션이 렌더링되면, Then 적절한 그리드 레이아웃(2~4열)으로 표시된다
- [ ] **AC-13**: Given `<head>` 태그를 확인했을 때, When 페이지 소스를 확인하면, Then 업데이트된 title, description, OG 태그가 존재한다

### 중요 (Should)

- [ ] **AC-14**: Given 재방문 사용자(isOnboarded === true)가 `/`에 접속했을 때, When Hero Section이 렌더링되면, Then "이어서 AI 활용법을 배워보세요" 문구와 "이어서 학습하기" CTA가 표시된다
- [ ] **AC-15**: Given Hero Section의 "상황별 가이드 바로 보기" 링크를 클릭했을 때, When 클릭이 발생하면, Then 페이지 내 Popular Situations 섹션으로 부드럽게 스크롤된다
- [ ] **AC-16**: Given Stats Section이 뷰포트에 진입했을 때, When IntersectionObserver가 감지하면, Then 숫자가 0부터 최종 값까지 카운트업 애니메이션된다

### 선택 (Could)

- [ ] **AC-17**: Given 각 섹션이 뷰포트에 진입했을 때, When 스크롤이 발생하면, Then 섹션이 부드럽게 페이드인된다
- [ ] **AC-18**: Given 온보딩 모달이 기존에 표시되던 상황에서, When 새 랜딩이 적용되면, Then 온보딩 모달은 표시되지 않는다 (Hero CTA가 대체)

---

## Task Breakdown

| # | 태스크 | 복잡도 | 의존성 | 설명 |
|---|--------|--------|--------|------|
| 1 | `src/components/landing/` 디렉토리 생성 + barrel export (`index.ts`) | S | 없음 | 폴더 구조 셋업 |
| 2 | `HeroSection` 컴포넌트 구현 | M | 1 | 가치 제안 + 2개 CTA + 신뢰 지표. 재방문 분기 포함 |
| 3 | `PersonaCard` 컴포넌트 구현 | S | 1 | 단일 페르소나 공감 카드 |
| 4 | `PainPointsSection` 컴포넌트 구현 | S | 1, 3 | 4개 PersonaCard 그리드 레이아웃 |
| 5 | `HowItWorksSection` 컴포넌트 구현 | S | 1 | 3단계 프로세스 시각화 |
| 6 | `SituationCardCompact` 컴포넌트 구현 | S | 1 | 인기 상황용 컴팩트 카드 (Link 기반, 클릭 시 페이지 이동) |
| 7 | `PopularSituationsSection` 컴포넌트 구현 | M | 1, 6 | CategoryButtons 재활용 + 6개 카드 그리드 + "더보기" 링크 |
| 8 | `StatsSection` 컴포넌트 구현 | S | 1 | 4개 통계 수치 (JSON 기반 동적 계산) |
| 9 | `QuickSearchSection` 컴포넌트 구현 | M | 1 | 기존 검색 로직 이전. SearchInput + CategoryButtons + ResultCard + GuidePanel |
| 10 | `FinalCtaSection` 컴포넌트 구현 | S | 1 | 다크 배경 + CTA 버튼 |
| 11 | `page.tsx` 재작성 | M | 2~10 | 모든 섹션 조합. 기존 검색 state를 QuickSearchSection으로 이전. JSON-LD 구조화 데이터 삽입 |
| 12 | `layout.tsx` metadata 업데이트 | S | 없음 | SEO 메타태그 변경 |
| 13 | 반응형 QA + 미세 조정 | S | 11 | 375px, 768px, 1280px 뷰포트에서 레이아웃 확인 |
| 14 | (Should) 재방문 사용자 분기 로직 | S | 2 | `loadProgress().isOnboarded` 체크 → Hero 문구 분기 |
| 15 | (Should) Stats 카운트업 애니메이션 | S | 8 | IntersectionObserver + 카운트업 |
| 16 | (Should) 스무스 스크롤 (Secondary CTA → Search) | S | 2, 9 | `id="search"` + `scrollIntoView({ behavior: 'smooth' })` |

**총 예상 작업량**: Must 태스크 13개 (S x 8, M x 5) = 약 1 사이클 (4~6시간)

---

## Open Questions

1. **`/onboarding` 라우트 존재 여부**: 아직 미구현 상태. CTA 링크를 `/onboarding`으로 걸되, 없으면 `/situations`로 fallback하는 로직이 필요한가? 아니면 이 사이클에서 `/onboarding` 스켈레톤까지 만들어야 하는가?
   - **제안**: `/onboarding`이 없으면 `/situations`로 fallback. 온보딩은 사이클 2에서 구현.

2. **기존 OnboardingModal 처리**: 새 랜딩이 온보딩 역할을 대체하므로 모달을 제거해야 하는가?
   - **제안**: 이번 사이클에서는 유지하되, 새 랜딩 페이지에서는 표시하지 않음 (조건부 렌더링). 사이클 2에서 완전 제거.

3. **OG 이미지**: 현재 OG 이미지가 없음. 별도 디자인 작업이 필요한가?
   - **제안**: 이번 사이클에서는 텍스트 기반 메타태그만. OG 이미지는 Phase 2에서 Canva/Figma로 제작.

4. **제휴 링크 CTA**: PRD에서 "제휴 마케팅 시작 준비"를 언급. Popular Situations 카드에 "시작하기" 버튼을 제휴 링크로 연결해야 하는가?
   - **제안**: 이번 사이클에서는 순수 내부 링크만. 제휴 링크 통합은 사이클 4에서 별도 구현.

---

## Out of Scope

- **/onboarding 페이지 구현**: 별도 스펙 (사이클 2)
- **GA4 이벤트 추적 코드**: 사이클 5에서 구현
- **AdSense 배치**: 사이클 5에서 구현
- **제휴 링크 삽입**: 사이클 4에서 구현
- **OG 이미지 제작**: Phase 2
- **A/B 테스트**: Phase 2
- **다크 모드**: 지원하지 않음 (라이트 모드 전용)
- **사용자 계정/로그인**: Phase 3
