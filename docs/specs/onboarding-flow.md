# Smart Onboarding Flow 상세 구현 명세서

> **버전**: v1.0 | **작성일**: 2026-02-17 | **작성자**: PM Agent
> **상태**: Draft | **대상 Phase**: Phase 1 (사이클 2~3)
> **관련 PRD**: `docs/specs/prd-v2.md` 섹션 3.1, 3.2

---

## JTBD

> **When** AI에 대해 아무것도 모르거나 어디서 시작해야 할지 막막할 때,
> **I want to** 몇 가지 간단한 질문에 답하면,
> **So I can** 나에게 딱 맞는 AI 도구와 시작 방법을 즉시 알 수 있다.

---

## 1. 문제 정의

### Who
- **김지영 (직장인, 32세)**: 팀장이 AI 활용을 지시했으나 어디서 시작할지 모름
- **박민수 (대학생, 22세)**: ChatGPT는 써봤지만 더 잘 활용하고 싶음
- **이수진 (프리랜서, 28세)**: 이미지/영상 AI 중 자기 작업에 맞는 걸 찾고 싶음
- **최영호 (자영업자, 45세)**: AI가 대세라는데 기술 용어가 어렵고 감이 안 잡힘

### Pain (빈도 x 심각도)
- **빈도**: 높음 -- AI를 써보고 싶을 때마다 반복 (주 2~3회)
- **심각도**: 중간~높음 -- 검색하면 도구가 100개+ 나오고, 뭐가 내 상황에 맞는지 판단 불가

### 현재 워크어라운드
- 유튜브 "ChatGPT 사용법" 검색 (영상 시청만 하고 실제 활용 안 함)
- 친구/동료에게 "뭐 쓰냐" 물어보기 (주관적, 자기 상황에 안 맞을 수 있음)
- Futurepedia/AI판 같은 디렉토리에서 하나씩 비교 (시간 소모 많고 선택 장애)

### 성공 지표
| 지표 | 측정 방법 | 목표 |
|------|----------|------|
| 온보딩 설문 완료율 | GA4: `onboarding_complete` / `onboarding_start` | 40%+ |
| 결과 페이지 → 가이드 실행 전환율 | GA4: `guide_start` / `onboarding_complete` | 30%+ |
| 제휴 링크 CTR (결과 페이지) | GA4: `affiliate_click` (source=onboarding_result) | 8%+ |
| 재방문율 (7일 이내) | GA4 | 15%+ |

---

## 2. 사용자 플로우 (상세)

### 2.1 전체 플로우 다이어그램

```
[랜딩 페이지 or 헤더 CTA]
  │
  ├─ "나에게 맞는 AI 찾기" 버튼 클릭
  │
  ▼
[/onboarding]
  │
  ├─ Q1: 직업/역할 선택 (4개 카드)
  │   └─ "건너뛰기" 링크 → /situations (전체 가이드 목록)
  │
  ├─ Q2: 목적/상황 선택 (4~5개 카드, Q1 응답에 따라 동적)
  │   └─ "이전" 버튼 → Q1으로
  │
  ├─ Q3: AI 경험 수준 선택 (4개 카드)
  │   └─ "이전" 버튼 → Q2로
  │
  ├─ Q4: 예산 선호 선택 (3개 카드)
  │   └─ "이전" 버튼 → Q3으로
  │
  ▼
[/onboarding/result?r=<encoded_params>]
  │
  ├─ 추천 도구 1순위 카드 (이유 + CTA + 제휴 링크)
  ├─ 대안 도구 2~3개 리스트
  ├─ 추천 상황/가이드 (바로 시작하기)
  ├─ "이 추천이 마음에 안 드시나요?" 섹션
  │   ├─ "다시 설문하기" → /onboarding (리셋)
  │   └─ "전체 도구 보기" → /tools
  │
  └─ 하단: 관련 가이드 추천 카드 (2~3개)
```

### 2.2 진입 경로 (Entry Points)

| 진입 경로 | 동작 | GA4 이벤트 |
|----------|------|-----------|
| 랜딩 페이지 Hero CTA | `/onboarding`으로 이동 | `onboarding_start` (source: landing_hero) |
| 랜딩 페이지 하단 CTA | `/onboarding`으로 이동 | `onboarding_start` (source: landing_bottom) |
| 헤더 네비게이션 "맞춤 추천" | `/onboarding`으로 이동 | `onboarding_start` (source: header_nav) |
| `/situations` 페이지 상단 배너 | `/onboarding`으로 이동 | `onboarding_start` (source: situations_banner) |
| URL 직접 접근 | `/onboarding` 렌더 | `onboarding_start` (source: direct) |
| 재방문자 (localStorage에 이전 결과 있음) | "이전 결과 보기" or "다시 하기" 선택 | `onboarding_start` (source: return_visit) |

### 2.3 재방문자 플로우

```
[/onboarding 접속]
  │
  ├─ localStorage에 이전 설문 결과 있음?
  │   ├─ YES → 상단에 알림 배너 표시
  │   │        "이전에 추천받은 결과가 있어요"
  │   │        [이전 결과 보기] [새로 시작하기]
  │   │
  │   │   ├─ "이전 결과 보기" → /onboarding/result (이전 파라미터 복원)
  │   │   └─ "새로 시작하기" → localStorage 초기화 후 Q1부터 시작
  │   │
  │   └─ NO → Q1부터 바로 시작
```

### 2.4 건너뛰기 플로우

```
[어떤 단계에서든 "건너뛰기" 클릭]
  │
  ▼
[/situations] 페이지로 이동
  │
  └─ GA4 이벤트: onboarding_skip (step_number, step_id)
```

---

## 3. 설문 질문 설계

### 3.1 Q1: 직업/역할 (role)

> **"주로 어떤 일을 하세요?"**

| 순서 | value | label | icon | description | 다음 단계 |
|------|-------|-------|------|-------------|----------|
| 1 | `office_worker` | 직장인/회사원 | 💼 | 보고서, 이메일, 발표 등 회사 업무 | Q2 (업무 옵션 표시) |
| 2 | `student` | 학생/연구자 | 📚 | 과제, 논문, 시험 준비 | Q2 (학습 옵션 표시) |
| 3 | `creator` | 크리에이터/디자이너 | 🎨 | 콘텐츠 제작, 디자인, 영상 | Q2 (창작 옵션 표시) |
| 4 | `business_owner` | 자영업자/사업가 | 🏪 | 쇼핑몰, 마케팅, 고객 관리 | Q2 (비즈니스 옵션 표시) |

**디자인 사양:**
- 카드 레이아웃: 2x2 그리드 (모바일: 1열 세로)
- 카드 크기: 최소 높이 100px, 패딩 20px
- 선택 시: border 색상 변경 (blue-500) + 배경 (blue-50) + 아이콘 스케일 업 (1.1)
- 선택 후 자동 전환 딜레이: 300ms
- 하단: "건너뛰기 → 바로 상황별 가이드 보기" 링크 (text-gray-400, 밑줄)

### 3.2 Q2: 목적/상황 (purpose)

> **"AI로 뭘 해보고 싶으세요?"**

Q1 응답에 따라 **동적으로 선택지가 변경**된다.

#### Q1 = office_worker (직장인)

| 순서 | value | label | icon | description |
|------|-------|-------|------|-------------|
| 1 | `writing` | 문서/보고서 작성 | 📄 | 보고서, 기획서, 회의록 정리 |
| 2 | `email` | 이메일/메시지 | 📧 | 비즈니스 이메일, 메신저 답변 |
| 3 | `presentation` | 발표 자료 | 📊 | PPT, 슬라이드 제작 |
| 4 | `data` | 데이터 분석 | 📈 | 엑셀, CSV, 통계 분석 |
| 5 | `translation` | 번역 | 🌐 | 영어 문서 번역, 해외 소통 |

#### Q1 = student (학생/연구자)

| 순서 | value | label | icon | description |
|------|-------|-------|------|-------------|
| 1 | `paper` | 논문/레포트 | 📝 | 논문 분석, 레포트 작성 |
| 2 | `concept` | 개념 이해 | 💡 | 어려운 개념 쉽게 설명 |
| 3 | `coding` | 코딩 과제 | 💻 | 코딩 숙제, 디버깅 |
| 4 | `english` | 영어 공부 | 💬 | 영어 회화, 작문 연습 |
| 5 | `research` | 자료 조사 | 🔍 | 정보 검색, 리서치 |

#### Q1 = creator (크리에이터/디자이너)

| 순서 | value | label | icon | description |
|------|-------|-------|------|-------------|
| 1 | `image` | 이미지/그래픽 | 🖼️ | 이미지 생성, 그래픽 디자인 |
| 2 | `video` | 영상/음악 | 🎬 | 영상 편집, 음악 생성 |
| 3 | `sns` | SNS 콘텐츠 | 📱 | 인스타, 유튜브 캡션 |
| 4 | `blog` | 블로그/글쓰기 | ✍️ | 블로그, 뉴스레터 작성 |
| 5 | `ui_design` | UI/UX 디자인 | 🎨 | 앱/웹 디자인, 목업 |

#### Q1 = business_owner (자영업자/사업가)

| 순서 | value | label | icon | description |
|------|-------|-------|------|-------------|
| 1 | `product_desc` | 상품 설명 작성 | 🏷️ | 쇼핑몰 상품 설명, 카피라이팅 |
| 2 | `marketing` | 마케팅/광고 | 📣 | 광고 카피, 마케팅 전략 |
| 3 | `customer` | 고객 응대 | 💬 | FAQ 작성, 답변 자동화 |
| 4 | `analysis` | 매출/시장 분석 | 📊 | 매출 데이터 분석, 시장 조사 |
| 5 | `sns_biz` | SNS 운영 | 📱 | 비즈니스 SNS 콘텐츠 |

**디자인 사양:**
- 카드 레이아웃: Q1과 동일한 그리드 (5개일 때: 모바일 세로, 데스크톱 2x3 또는 3+2)
- Q1에서 선택한 역할이 상단에 작은 뱃지로 표시: "💼 직장인을 위한 AI 추천"
- 애니메이션: 슬라이드-인 효과 (왼쪽에서 오른쪽)

### 3.3 Q3: AI 경험 수준 (experience)

> **"AI 도구 써본 적 있으세요?"**

| 순서 | value | label | icon | description | 내부 로직 영향 |
|------|-------|-------|------|-------------|---------------|
| 1 | `never` | 처음이에요 | 🌱 | AI가 뭔지도 잘 모르겠어요 | difficulty=easy만, 상세 가이드 모드 |
| 2 | `basic` | ChatGPT 정도만 | 🌿 | 기본적인 대화는 해봤어요 | difficulty=easy+medium, 보통 가이드 |
| 3 | `some` | 몇 개 써봤어요 | 🌲 | 다양한 AI 도구 경험 있어요 | 난이도 필터 없음, 간결 가이드 |
| 4 | `expert` | 잘 쓰고 있어요 | 🏆 | 프롬프트도 직접 잘 짜요 | 난이도 필터 없음, 고급 팁 위주 |

**디자인 사양:**
- 4개 카드, 2x2 그리드
- 각 카드에 "레벨 바" 표시 (1칸~4칸 채워진 형태)로 수준을 시각화
- 하단 안내 텍스트: "솔직하게 선택하면 더 정확한 추천을 받을 수 있어요"

### 3.4 Q4: 예산 선호 (budget)

> **"비용은 어떻게 생각하세요?"**

| 순서 | value | label | icon | description | 내부 로직 영향 |
|------|-------|-------|------|-------------|---------------|
| 1 | `free_only` | 무료만 쓸래요 | 💚 | 돈 쓰기 싫어요 | pricing.free=true 필터 |
| 2 | `affordable` | 저렴하면 OK | 💰 | 월 1~2만원 정도는 괜찮아요 | 필터 없음, 무료 도구 우선 정렬 |
| 3 | `any` | 좋으면 투자할게요 | 💎 | 효과 좋으면 비용 상관없어요 | 필터 없음, 프로 기능 포함 추천 |

**디자인 사양:**
- 3개 카드, 1x3 가로 레이아웃 (모바일: 세로)
- 마지막 질문이므로 "결과 보기" 느낌의 트랜지션 준비
- 하단 텍스트: "대부분의 AI 도구는 무료로 시작할 수 있어요" (budget 부담 경감)

---

## 4. 추천 알고리즘 상세

### 4.1 알고리즘 개요

```
입력:
  role     (Q1): 'office_worker' | 'student' | 'creator' | 'business_owner'
  purpose  (Q2): string (역할별 동적)
  experience (Q3): 'never' | 'basic' | 'some' | 'expert'
  budget   (Q4): 'free_only' | 'affordable' | 'any'

처리:
  1. purpose → situation 매핑 (직접 매핑 테이블)
  2. experience → difficulty 필터링
  3. budget → pricing 필터링
  4. 후보 도구에 점수 부여 (scoring)
  5. 상위 결과 선정

출력:
  - primaryTool: Tool (1순위 추천)
  - alternatives: Tool[] (대안 2~3개)
  - recommendedSituation: Situation (가장 적합한 가이드)
  - relatedSituations: Situation[] (관련 가이드 2~3개)
  - personalizedReason: string (개인화된 추천 이유)
```

### 4.2 Step 1: Purpose → Situation 매핑 테이블

기존 `survey.json`의 `taskToSituationMap`을 확장한 새로운 매핑 테이블이다.
**참조 데이터**: `src/data/situations.json` (19개 상황), `src/data/survey.json` (taskToSituationMap)

```typescript
const PURPOSE_TO_SITUATIONS: Record<string, string[]> = {
  // office_worker 목적
  writing:      ['pdf-summary', 'meeting-notes', 'blog-writing'],
  email:        ['email-writing', 'translation'],
  presentation: ['presentation-slides'],
  data:         ['data-analysis', 'excel-formula'],
  translation:  ['translation', 'email-writing'],

  // student 목적
  paper:        ['paper-summary', 'pdf-summary'],
  concept:      ['concept-explanation'],
  coding:       ['code-debug', 'code-review'],
  english:      ['english-conversation', 'translation'],
  research:     ['competitor-research', 'paper-summary'],

  // creator 목적
  image:        ['ui-design', 'thumbnail-creation'],
  video:        ['thumbnail-creation'],
  sns:          ['sns-content', 'blog-writing'],
  blog:         ['blog-writing', 'sns-content'],
  ui_design:    ['ui-design'],

  // business_owner 목적
  product_desc: ['blog-writing', 'email-writing'],
  marketing:    ['sns-content', 'blog-writing', 'brainstorming'],
  customer:     ['email-writing', 'brainstorming'],
  analysis:     ['data-analysis', 'competitor-research'],
  sns_biz:      ['sns-content', 'brainstorming'],
};
```

### 4.3 Step 2: Experience → Difficulty 필터

```typescript
function getDifficultyFilter(experience: string): ('easy' | 'medium' | 'hard')[] {
  switch (experience) {
    case 'never':   return ['easy'];
    case 'basic':   return ['easy', 'medium'];
    case 'some':    return ['easy', 'medium', 'hard'];
    case 'expert':  return ['easy', 'medium', 'hard'];
    default:        return ['easy', 'medium'];
  }
}
```

### 4.4 Step 3: Budget → Pricing 필터

```typescript
function applyBudgetFilter(tools: Tool[], budget: string): Tool[] {
  if (budget === 'free_only') {
    return tools.filter(t => t.pricing.free);
  }
  // 'affordable', 'any'는 필터링 없음. 단, 정렬에서 가중치 적용.
  return tools;
}
```

### 4.5 Step 4: 점수 계산 (Scoring)

각 후보 도구에 대해 다음 점수 항목을 합산한다.

```typescript
type ScoringInput = {
  role: string;
  purpose: string;
  experience: string;
  budget: string;
};

function calculateToolScore(
  tool: Tool,
  situation: Situation,
  input: ScoringInput
): number {
  let score = 0;

  // (1) 상황 내 Primary 도구 보너스: +50점
  const recommended = situation.recommendedTools.find(rt => rt.slug === tool.slug);
  if (!recommended) return 0; // 이 상황에서 추천되지 않은 도구는 0점
  if (recommended.isPrimary) score += 50;
  else score += 20; // 비-Primary이지만 추천 도구

  // (2) 상황 우선순위(priority) 보너스: 낮은 priority 숫자 = 높은 점수
  const priorityScore = Math.max(0, 20 - (situation.priority ?? 10));
  score += priorityScore;

  // (3) 경험 레벨 ↔ 난이도 매칭 보너스
  const difficultyScore = getDifficultyMatchScore(input.experience, situation.difficulty);
  score += difficultyScore;

  // (4) 예산 매칭 보너스
  if (input.budget === 'free_only' && tool.pricing.free) {
    score += 15; // 무료만 원하는데 무료 도구 = 보너스
  }
  if (input.budget === 'any' && !tool.pricing.free) {
    score += 5; // 투자 의향 있는데 유료 도구 = 약간 보너스 (프로 기능 추천)
  }
  if (input.budget === 'affordable' && tool.pricing.free) {
    score += 10; // 저렴하면 OK인데 무료 = 보너스
  }

  // (5) 역할-카테고리 매칭 보너스
  const roleCategoryBonus = getRoleCategoryScore(input.role, situation.category);
  score += roleCategoryBonus;

  return score;
}

function getDifficultyMatchScore(experience: string, difficulty: string): number {
  const matchMap: Record<string, Record<string, number>> = {
    never:  { easy: 15, medium: 5,  hard: 0 },
    basic:  { easy: 10, medium: 15, hard: 5 },
    some:   { easy: 5,  medium: 10, hard: 15 },
    expert: { easy: 0,  medium: 5,  hard: 15 },
  };
  return matchMap[experience]?.[difficulty] ?? 5;
}

function getRoleCategoryScore(role: string, category: string): number {
  const roleCategories: Record<string, string[]> = {
    office_worker:  ['work', 'content'],
    student:        ['study', 'research', 'coding'],
    creator:        ['design', 'content'],
    business_owner: ['work', 'content', 'research'],
  };
  return (roleCategories[role] ?? []).includes(category) ? 10 : 0;
}
```

### 4.6 Step 5: 최종 결과 선정

```typescript
function generateRecommendation(input: ScoringInput): OnboardingResult {
  // 1. purpose에 매핑된 상황 가져오기
  const situationSlugs = PURPOSE_TO_SITUATIONS[input.purpose] ?? [];
  const allSituations = getSituationsFromJson(); // situations.json 로드
  const allTools = getToolsFromJson(); // tools.json 로드

  // 2. 매핑된 상황들 가져오기 (없으면 카테고리 기반 폴백)
  let candidateSituations = allSituations.filter(s => situationSlugs.includes(s.slug));
  if (candidateSituations.length === 0) {
    // 폴백: 역할에 맞는 카테고리의 모든 상황
    const roleCategories = getRoleCategoryMap(input.role);
    candidateSituations = allSituations.filter(s => roleCategories.includes(s.category));
  }

  // 3. 난이도 필터링
  const diffFilter = getDifficultyFilter(input.experience);
  candidateSituations = candidateSituations.filter(s => diffFilter.includes(s.difficulty));

  // 폴백: 난이도 필터로 전부 제거되면 필터 해제
  if (candidateSituations.length === 0) {
    candidateSituations = allSituations.filter(s => situationSlugs.includes(s.slug));
  }

  // 4. 모든 후보 상황의 추천 도구들에 점수 부여
  const toolScores: { tool: Tool; situation: Situation; score: number }[] = [];

  for (const situation of candidateSituations) {
    for (const rt of situation.recommendedTools) {
      const tool = allTools.find(t => t.slug === rt.slug);
      if (!tool) continue;

      // 예산 필터
      if (input.budget === 'free_only' && !tool.pricing.free) continue;

      const score = calculateToolScore(tool, situation, input);
      toolScores.push({ tool, situation, score });
    }
  }

  // 5. 점수 기준 내림차순 정렬
  toolScores.sort((a, b) => b.score - a.score);

  // 6. 1순위 도구 결정 (가장 높은 점수)
  const primary = toolScores[0] ?? null;

  // 7. 대안 도구 결정 (1순위와 다른 slug, 상위 2~3개)
  const alternatives = toolScores
    .filter(ts => ts.tool.slug !== primary?.tool.slug)
    .reduce<typeof toolScores>((acc, ts) => {
      // 같은 slug 중복 제거
      if (!acc.find(a => a.tool.slug === ts.tool.slug)) {
        acc.push(ts);
      }
      return acc;
    }, [])
    .slice(0, 3);

  // 8. 추천 상황 결정
  const recommendedSituation = primary?.situation ?? null;

  // 9. 관련 상황 (1순위 상황 제외, 점수 높은 순)
  const relatedSituations = candidateSituations
    .filter(s => s.slug !== recommendedSituation?.slug)
    .slice(0, 3);

  // 10. 개인화 추천 이유 생성
  const reason = generatePersonalizedReason(input, primary?.tool, recommendedSituation);

  return {
    primaryTool: primary?.tool ?? null,
    primaryReason: primary
      ? primary.situation.recommendedTools.find(rt => rt.slug === primary.tool.slug)?.reason ?? ''
      : '',
    alternatives: alternatives.map(a => ({
      tool: a.tool,
      reason: a.situation.recommendedTools.find(rt => rt.slug === a.tool.slug)?.reason ?? '',
      situation: a.situation,
    })),
    recommendedSituation,
    relatedSituations,
    personalizedReason: reason,
    answers: input,
  };
}
```

### 4.7 개인화 추천 이유 생성

```typescript
function generatePersonalizedReason(
  input: ScoringInput,
  tool: Tool | null,
  situation: Situation | null
): string {
  if (!tool || !situation) {
    return '조건에 맞는 AI 도구를 찾지 못했어요. 전체 도구를 둘러보세요.';
  }

  const roleLabels: Record<string, string> = {
    office_worker: '직장인',
    student: '학생',
    creator: '크리에이터',
    business_owner: '사업가',
  };

  const purposeLabels: Record<string, string> = {
    writing: '문서 작성',
    email: '이메일 작성',
    presentation: '발표 자료 제작',
    data: '데이터 분석',
    translation: '번역',
    paper: '논문 분석',
    concept: '개념 이해',
    coding: '코딩',
    english: '영어 공부',
    research: '자료 조사',
    image: '이미지 생성',
    video: '영상 제작',
    sns: 'SNS 콘텐츠',
    blog: '블로그 작성',
    ui_design: 'UI 디자인',
    product_desc: '상품 설명',
    marketing: '마케팅',
    customer: '고객 응대',
    analysis: '매출 분석',
    sns_biz: 'SNS 운영',
  };

  const role = roleLabels[input.role] ?? input.role;
  const purpose = purposeLabels[input.purpose] ?? input.purpose;

  const budgetNote = input.budget === 'free_only'
    ? ' 무료로 바로 시작할 수 있어요!'
    : '';

  return `${role}이 ${purpose}을 할 때 ${tool.name}이 가장 적합해요.${budgetNote}`;
}
```

### 4.8 점수 계산 예시 (시뮬레이션)

**입력**: role=office_worker, purpose=writing, experience=never, budget=free_only

| 도구 | 상황 | Primary | 우선순위 | 난이도매칭 | 예산매칭 | 역할카테고리 | **총점** |
|------|------|---------|---------|----------|---------|------------|---------|
| Claude | pdf-summary | isPrimary(+50) | priority=1(+19) | never↔easy(+15) | free+free_only(+15) | work↔work(+10) | **109** |
| ChatGPT | pdf-summary | alt(+20) | priority=1(+19) | never↔easy(+15) | free+free_only(+15) | work↔work(+10) | **79** |
| Gemini | pdf-summary | alt(+20) | priority=1(+19) | never↔easy(+15) | free+free_only(+15) | work↔work(+10) | **79** |
| Claude | meeting-notes | isPrimary(+50) | priority=3(+17) | never↔easy(+15) | free+free_only(+15) | work↔work(+10) | **107** |
| Claude | blog-writing | isPrimary(+50) | priority=1(+19) | never↔medium(+5) | free+free_only(+15) | work↔content(+10) | **99** |

**결과**:
- primaryTool: **Claude** (109점, pdf-summary 상황 기반)
- alternatives: **ChatGPT** (79점), **Gemini** (79점)
- recommendedSituation: **pdf-summary** ("PDF 문서 빠르게 요약하기")
- personalizedReason: "직장인이 문서 작성을 할 때 Claude이 가장 적합해요. 무료로 바로 시작할 수 있어요!"

---

## 5. 결과 페이지 구조

### 5.1 URL 구조

```
/onboarding/result?r=<base64_encoded_params>
```

URL 파라미터 인코딩:

```typescript
// 인코딩
function encodeOnboardingResult(answers: OnboardingAnswers): string {
  const params = `${answers.role},${answers.purpose},${answers.experience},${answers.budget}`;
  return btoa(params); // Base64 인코딩
}

// 디코딩
function decodeOnboardingResult(encoded: string): OnboardingAnswers | null {
  try {
    const decoded = atob(encoded);
    const [role, purpose, experience, budget] = decoded.split(',');
    if (!role || !purpose || !experience || !budget) return null;
    return { role, purpose, experience, budget };
  } catch {
    return null;
  }
}

// 예시 URL:
// /onboarding/result?r=b2ZmaWNlX3dvcmtlcix3cml0aW5nLG5ldmVyLGZyZWVfb25seQ==
```

### 5.2 결과 페이지 레이아웃

```
┌─────────────────────────────────────────────┐
│ ← 뒤로 가기              로고               │
├─────────────────────────────────────────────┤
│                                             │
│  🎯 직장인이 문서 작성할 때                    │
│  이 도구가 딱 맞아요!                         │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ 🧠 Claude                 [BEST]    │    │
│  │                                     │    │
│  │ "무료로 PDF 업로드 가능, 긴 문서       │    │
│  │  (20만 토큰) 처리에 최강"             │    │
│  │                                     │    │
│  │ ✓ 무료로 시작 가능                    │    │
│  │ ✓ 소요 시간: 5-10분                  │    │
│  │ ✓ 난이도: 쉬움                       │    │
│  │                                     │    │
│  │ [Claude 시작하기 →]  [가이드 보기]    │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  이런 것도 해볼 수 있어요:                      │
│  ┌───────────────┐ ┌───────────────┐       │
│  │ 📄 PDF 요약    │ │ 📋 회의록 정리 │       │
│  │ 5-10분 | 쉬움  │ │ 5-10분 | 쉬움 │       │
│  │ [가이드 보기]  │ │ [가이드 보기]  │       │
│  └───────────────┘ └───────────────┘       │
│                                             │
│  다른 선택지도 있어요:                         │
│  ┌─────────────────────────────────────┐    │
│  │ 🤖 ChatGPT          자연스러운 문체  │    │
│  │                     [시작하기 →]     │    │
│  ├─────────────────────────────────────┤    │
│  │ ✨ Gemini            구글 연동 편리  │    │
│  │                     [시작하기 →]     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ─────────────────────────────────────────  │
│  이 추천이 마음에 안 드시나요?                   │
│  [다시 설문하기]  [전체 도구 보기]              │
│                                             │
│  ─────────────────────────────────────────  │
│  📋 이 결과 공유하기  [링크 복사]              │
│                                             │
│  ⚠️ 이 페이지의 일부 링크는 제휴 링크입니다.     │
│  링크를 통해 가입하시면 AI Guide 운영에          │
│  도움이 됩니다. 추천은 제휴 여부와 무관합니다.     │
│                                             │
└─────────────────────────────────────────────┘
```

### 5.3 결과 페이지 섹션별 상세

#### 섹션 1: 헤더 & 개인화 인사

```tsx
<div className="text-center mb-8">
  <span className="text-5xl mb-4 block">🎯</span>
  <h1 className="text-2xl font-bold text-gray-900 mb-2">
    {personalizedReason}
  </h1>
  <p className="text-gray-500">
    답변을 분석해서 가장 적합한 AI를 찾았어요
  </p>
</div>
```

#### 섹션 2: 1순위 추천 도구 카드

반드시 포함할 정보:
- 도구 아이콘 + 이름 + `[BEST]` 뱃지
- 추천 이유 (상황 데이터의 `reason` 필드)
- 무료/유료 상태 표시
- 소요 시간 (상황의 `timeToComplete`)
- 난이도 (상황의 `difficulty`)
- **CTA 버튼 2개**:
  1. "도구이름 시작하기" → 제휴 링크 (있을 경우) 또는 도구 공식 URL
  2. "가이드 보기" → `/situations/{slug}` (추천 상황 가이드 페이지)

#### 섹션 3: 추천 상황/가이드

매핑된 상황 중 상위 2~3개를 카드로 표시.
- 상황 아이콘 + 제목
- 소요 시간 + 난이도
- "가이드 보기" CTA → `/situations/{slug}`

#### 섹션 4: 대안 도구 리스트

- 대안 2~3개를 간결한 리스트로
- 각 행: 아이콘 + 이름 + 한 줄 추천 이유 + "시작하기" 링크
- "시작하기" → 제휴 링크 (있을 경우) 또는 공식 URL

#### 섹션 5: 불만족 대응

```tsx
<div className="text-center border-t pt-8 mt-8">
  <p className="text-gray-500 mb-4">이 추천이 마음에 안 드시나요?</p>
  <div className="flex justify-center gap-4">
    <Link href="/onboarding" className="text-blue-500 hover:underline">
      다시 설문하기
    </Link>
    <Link href="/tools" className="text-blue-500 hover:underline">
      전체 도구 보기
    </Link>
  </div>
</div>
```

#### 섹션 6: 공유 & 제휴 고지

- "이 결과 공유하기" 버튼: 현재 URL을 클립보드에 복사
- 제휴 링크 고지문 (법적 필수):
  > "이 페이지의 일부 링크는 제휴 링크입니다. 링크를 통해 가입하시면 AI Guide 운영에 도움이 됩니다. 추천은 제휴 여부와 무관합니다."

---

## 6. 데이터 모델 (TypeScript 타입 정의)

### 6.1 새로 정의할 타입

```typescript
// src/types/onboarding.ts

/** 온보딩 설문 응답 */
type OnboardingRole = 'office_worker' | 'student' | 'creator' | 'business_owner';
type OnboardingExperience = 'never' | 'basic' | 'some' | 'expert';
type OnboardingBudget = 'free_only' | 'affordable' | 'any';

type OnboardingAnswers = {
  role: OnboardingRole;
  purpose: string; // 역할별 동적 값
  experience: OnboardingExperience;
  budget: OnboardingBudget;
};

/** 온보딩 질문 정의 */
type OnboardingOptionCard = {
  value: string;
  label: string;
  icon: string;
  description: string;
};

type OnboardingQuestion = {
  id: string;
  title: string;
  subtitle?: string; // 질문 아래 부연 설명
  options: OnboardingOptionCard[];
  dynamicOptions?: Record<string, OnboardingOptionCard[]>; // Q1 응답 기반 동적 옵션
  showSkip?: boolean; // 건너뛰기 표시 여부
};

/** 추천 결과 */
type RecommendedToolResult = {
  tool: Tool;
  reason: string; // 상황 데이터 기반 추천 이유
  situation: Situation; // 이 도구가 추천된 맥락 상황
};

type OnboardingResult = {
  primaryTool: Tool | null;
  primaryReason: string;
  alternatives: RecommendedToolResult[];
  recommendedSituation: Situation | null;
  relatedSituations: Situation[];
  personalizedReason: string;
  answers: OnboardingAnswers;
};

/** localStorage 저장 스키마 */
type OnboardingStorage = {
  version: 1;
  answers: OnboardingAnswers;
  resultTimestamp: string; // ISO 8601
  primaryToolSlug: string | null;
};
```

### 6.2 기존 타입 확장

```typescript
// src/types/index.ts 에 추가

// Tool 타입에 제휴 링크 필드 추가
interface Tool {
  // ... 기존 필드 유지
  affiliateUrl?: string; // 제휴 링크 URL (없으면 url 사용)
  affiliateId?: string;  // 제휴 프로그램 ID (추적용)
}
```

---

## 7. 컴포넌트 설계

### 7.1 컴포넌트 구조

```
src/
├── app/
│   ├── onboarding/
│   │   ├── page.tsx              # 설문 페이지 (NEW)
│   │   └── result/
│   │       └── page.tsx          # 결과 페이지 (NEW)
│   │
├── components/
│   ├── onboarding/               # 온보딩 전용 컴포넌트 폴더 (NEW)
│   │   ├── OnboardingWizard.tsx   # 설문 위자드 (메인)
│   │   ├── QuestionCard.tsx       # 개별 옵션 카드
│   │   ├── StepIndicator.tsx      # 진행률 표시
│   │   ├── ResultPrimaryCard.tsx  # 1순위 추천 카드
│   │   ├── ResultAlternatives.tsx # 대안 도구 리스트
│   │   ├── ResultSituations.tsx   # 추천 상황/가이드 카드
│   │   ├── ResultShareBar.tsx     # 공유 + 제휴 고지
│   │   └── ReturningUserBanner.tsx # 재방문자 배너
│   │
│   ├── SurveyWizard.tsx          # 기존 유지 (삭제하지 않음)
│   └── OnboardingModal.tsx       # 기존 유지 → 새 온보딩으로 리다이렉트
│
├── lib/
│   ├── onboardingEngine.ts       # 추천 알고리즘 (NEW)
│   ├── onboardingStorage.ts      # localStorage 관리 (NEW)
│   └── surveyLogic.ts            # 기존 유지
│
├── data/
│   └── onboarding.json           # 온보딩 질문 데이터 (NEW)
```

### 7.2 기존 컴포넌트와의 관계

| 기존 컴포넌트 | 방침 | 이유 |
|-------------|------|------|
| `SurveyWizard.tsx` | **유지** | `/situations` 페이지의 인라인 설문으로 계속 사용. 새 온보딩은 별도 페이지이므로 역할이 다름 |
| `OnboardingModal.tsx` | **교체** | 기존 환영 모달을 새 온보딩 플로우 진입 유도로 교체. "나에게 맞는 AI 찾기" CTA로 변경 |
| `ProgressStepper.tsx` | **재사용** | 결과 페이지에서 가이드 스텝 표시에 재사용 가능 |
| `ResultCard.tsx` | **참고** | 기존 카드 디자인을 참고하되, 결과 페이지 전용 카드는 새로 작성 |

### 7.3 주요 컴포넌트 명세

#### OnboardingWizard.tsx (설문 위자드)

```typescript
type OnboardingWizardProps = {
  onComplete: (result: OnboardingResult) => void;
  initialStep?: number; // 재방문 시 특정 단계부터 시작
};

// 상태:
// - currentStep: 0~3 (Q1~Q4)
// - answers: Partial<OnboardingAnswers>
// - direction: 'forward' | 'backward' (애니메이션 방향)

// 동작:
// - 카드 선택 시 300ms 후 자동 다음 단계
// - 이전 버튼으로 되돌아가기
// - 마지막 질문 답변 시 결과 계산 후 onComplete 호출
// - 건너뛰기 클릭 시 /situations로 리다이렉트
```

#### QuestionCard.tsx (옵션 카드)

```typescript
type QuestionCardProps = {
  option: OnboardingOptionCard;
  isSelected: boolean;
  onClick: (value: string) => void;
};

// 디자인:
// - 기본: border-gray-200, bg-white
// - 호버: border-blue-300, bg-gray-50, 아이콘 scale-110
// - 선택: border-blue-500, bg-blue-50, 체크 아이콘 표시
// - 모바일: 전체 너비, 높이 80px
// - 데스크톱: 그리드 셀, 높이 100px
```

#### ResultPrimaryCard.tsx (1순위 추천 카드)

```typescript
type ResultPrimaryCardProps = {
  tool: Tool;
  reason: string;
  situation: Situation;
  affiliateUrl?: string;
};

// 디자인:
// - 그라데이션 배경 (tool.color 활용)
// - BEST 뱃지
// - 추천 이유 텍스트
// - 무료/유료 뱃지
// - 소요 시간 + 난이도 칩
// - CTA 버튼 2개 (시작하기, 가이드 보기)
```

---

## 8. 상태 관리

### 8.1 설문 진행 상태 (React State)

```typescript
// app/onboarding/page.tsx
const [currentStep, setCurrentStep] = useState(0);
const [answers, setAnswers] = useState<Partial<OnboardingAnswers>>({});
const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
```

### 8.2 localStorage 스키마

**키**: `ai-guide-onboarding`

```typescript
// src/lib/onboardingStorage.ts

const STORAGE_KEY = 'ai-guide-onboarding';
const STORAGE_VERSION = 1;

type OnboardingStorage = {
  version: typeof STORAGE_VERSION;
  answers: OnboardingAnswers;
  resultTimestamp: string; // ISO 8601
  primaryToolSlug: string | null;
};

function saveOnboardingResult(
  answers: OnboardingAnswers,
  primaryToolSlug: string | null
): void {
  const data: OnboardingStorage = {
    version: STORAGE_VERSION,
    answers,
    resultTimestamp: new Date().toISOString(),
    primaryToolSlug,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadOnboardingResult(): OnboardingStorage | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as OnboardingStorage;
    if (data.version !== STORAGE_VERSION) return null; // 버전 불일치 시 무시
    return data;
  } catch {
    return null;
  }
}

function clearOnboardingResult(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function hasOnboardingResult(): boolean {
  return loadOnboardingResult() !== null;
}
```

### 8.3 기존 localStorage와의 충돌 방지

현재 프로젝트에서 사용 중인 localStorage 키:
- `ai-guide-level-system` (levelSystem.ts): 레벨/XP 데이터
- `ai-guide-progress` (progress.ts): 가이드 완료 상태

새로 추가할 키:
- `ai-guide-onboarding`: 온보딩 설문 결과

키 네이밍 규칙: `ai-guide-` 접두사로 통일.

---

## 9. URL 구조

### 9.1 라우트 정의

| 경로 | 파일 | 용도 | 렌더링 방식 |
|------|------|------|-----------|
| `/onboarding` | `src/app/onboarding/page.tsx` | 설문 페이지 | CSR (상호작용 많음) |
| `/onboarding/result` | `src/app/onboarding/result/page.tsx` | 결과 페이지 | CSR + URL 파라미터 기반 |

### 9.2 URL 파라미터

**결과 페이지**:
```
/onboarding/result?r=b2ZmaWNlX3dvcmtlcix3cml0aW5nLG5ldmVyLGZyZWVfb25seQ==
```

- `r`: Base64 인코딩된 응답 데이터 (`role,purpose,experience,budget`)
- 공유 시 이 URL을 복사하면 동일한 추천 결과를 볼 수 있음
- 파라미터가 없거나 디코딩 실패 시: localStorage에서 복원 시도 → 실패 시 `/onboarding`으로 리다이렉트

### 9.3 SEO 고려사항

- `/onboarding` 페이지: `noindex` 메타 태그 (설문 페이지는 검색에 불필요)
- `/onboarding/result` 페이지: `noindex` 메타 태그 (개인화된 결과는 SEO 가치 없음)
- 단, OG 태그는 설정하여 공유 시 프리뷰 표시:
  - title: "나에게 맞는 AI 도구 추천 결과 | AI Guide"
  - description: "AI Guide에서 나에게 딱 맞는 AI 도구를 추천받았어요. 당신도 해보세요!"
  - image: 기본 OG 이미지

---

## 10. 제휴 링크 통합 전략

### 10.1 삽입 위치

| 위치 | 링크 종류 | 우선순위 |
|------|----------|---------|
| 결과 페이지 1순위 "시작하기" 버튼 | 제휴 링크 (있으면) or 공식 URL | **최우선** |
| 결과 페이지 대안 도구 "시작하기" 링크 | 제휴 링크 or 공식 URL | 높음 |
| 가이드 페이지 도구 링크 | 제휴 링크 or 공식 URL | 높음 |
| 도구 상세 페이지 CTA | 제휴 링크 or 공식 URL | 보통 |

### 10.2 제휴 링크 데이터 구조

`tools.json`에 `affiliateUrl` 필드를 추가한다.

```json
{
  "slug": "claude",
  "name": "Claude",
  "url": "https://claude.ai",
  "affiliateUrl": null,
  "affiliateId": null
}
```

Phase 1에서는 제휴 프로그램 승인 전이므로 대부분 `null`이다.
`affiliateUrl`이 `null`이면 `url` 필드를 사용한다.

```typescript
function getToolLink(tool: Tool): string {
  return tool.affiliateUrl ?? tool.url;
}

function isAffiliateLink(tool: Tool): boolean {
  return !!tool.affiliateUrl;
}
```

### 10.3 제휴 링크 속성

```tsx
<a
  href={getToolLink(tool)}
  target="_blank"
  rel="noopener noreferrer sponsored"  // sponsored 추가
  onClick={() => trackAffiliateClick(tool.slug, 'onboarding_result')}
>
  {tool.name} 시작하기
</a>
```

- `rel="sponsored"`: 제휴 링크임을 검색엔진에 알림 (SEO 가이드라인 준수)
- GA4 이벤트: `affiliate_click` (tool_slug, source)

### 10.4 제휴 고지 (법적 의무)

결과 페이지 하단에 항상 표시:

```tsx
<div className="text-xs text-gray-400 text-center mt-8 px-4">
  <p>
    이 페이지의 일부 링크는 제휴 링크입니다.
    링크를 통해 가입하시면 AI Guide 운영에 도움이 됩니다.
    추천은 제휴 여부와 무관하게 사용자 응답에 기반합니다.
  </p>
</div>
```

---

## 11. 데이터 파일: onboarding.json

`src/data/onboarding.json`에 설문 질문 데이터를 정적으로 정의한다.

```json
{
  "questions": [
    {
      "id": "role",
      "title": "주로 어떤 일을 하세요?",
      "subtitle": "가장 가까운 것을 골라주세요",
      "showSkip": true,
      "options": [
        { "value": "office_worker", "label": "직장인/회사원", "icon": "💼", "description": "보고서, 이메일, 발표 등 회사 업무" },
        { "value": "student", "label": "학생/연구자", "icon": "📚", "description": "과제, 논문, 시험 준비" },
        { "value": "creator", "label": "크리에이터/디자이너", "icon": "🎨", "description": "콘텐츠 제작, 디자인, 영상" },
        { "value": "business_owner", "label": "자영업자/사업가", "icon": "🏪", "description": "쇼핑몰, 마케팅, 고객 관리" }
      ]
    },
    {
      "id": "purpose",
      "title": "AI로 뭘 해보고 싶으세요?",
      "subtitle": null,
      "showSkip": false,
      "options": [],
      "dynamicOptions": {
        "office_worker": [
          { "value": "writing", "label": "문서/보고서 작성", "icon": "📄", "description": "보고서, 기획서, 회의록 정리" },
          { "value": "email", "label": "이메일/메시지", "icon": "📧", "description": "비즈니스 이메일, 메신저 답변" },
          { "value": "presentation", "label": "발표 자료", "icon": "📊", "description": "PPT, 슬라이드 제작" },
          { "value": "data", "label": "데이터 분석", "icon": "📈", "description": "엑셀, CSV, 통계 분석" },
          { "value": "translation", "label": "번역", "icon": "🌐", "description": "영어 문서 번역, 해외 소통" }
        ],
        "student": [
          { "value": "paper", "label": "논문/레포트", "icon": "📝", "description": "논문 분석, 레포트 작성" },
          { "value": "concept", "label": "개념 이해", "icon": "💡", "description": "어려운 개념 쉽게 설명" },
          { "value": "coding", "label": "코딩 과제", "icon": "💻", "description": "코딩 숙제, 디버깅" },
          { "value": "english", "label": "영어 공부", "icon": "💬", "description": "영어 회화, 작문 연습" },
          { "value": "research", "label": "자료 조사", "icon": "🔍", "description": "정보 검색, 리서치" }
        ],
        "creator": [
          { "value": "image", "label": "이미지/그래픽", "icon": "🖼️", "description": "이미지 생성, 그래픽 디자인" },
          { "value": "video", "label": "영상/음악", "icon": "🎬", "description": "영상 편집, 음악 생성" },
          { "value": "sns", "label": "SNS 콘텐츠", "icon": "📱", "description": "인스타, 유튜브 캡션" },
          { "value": "blog", "label": "블로그/글쓰기", "icon": "✍️", "description": "블로그, 뉴스레터 작성" },
          { "value": "ui_design", "label": "UI/UX 디자인", "icon": "🎨", "description": "앱/웹 디자인, 목업" }
        ],
        "business_owner": [
          { "value": "product_desc", "label": "상품 설명 작성", "icon": "🏷️", "description": "쇼핑몰 상품 설명, 카피라이팅" },
          { "value": "marketing", "label": "마케팅/광고", "icon": "📣", "description": "광고 카피, 마케팅 전략" },
          { "value": "customer", "label": "고객 응대", "icon": "💬", "description": "FAQ 작성, 답변 자동화" },
          { "value": "analysis", "label": "매출/시장 분석", "icon": "📊", "description": "매출 데이터 분석, 시장 조사" },
          { "value": "sns_biz", "label": "SNS 운영", "icon": "📱", "description": "비즈니스 SNS 콘텐츠" }
        ]
      }
    },
    {
      "id": "experience",
      "title": "AI 도구 써본 적 있으세요?",
      "subtitle": "솔직하게 선택하면 더 정확한 추천을 받을 수 있어요",
      "showSkip": false,
      "options": [
        { "value": "never", "label": "처음이에요", "icon": "🌱", "description": "AI가 뭔지도 잘 모르겠어요" },
        { "value": "basic", "label": "ChatGPT 정도만", "icon": "🌿", "description": "기본적인 대화는 해봤어요" },
        { "value": "some", "label": "몇 개 써봤어요", "icon": "🌲", "description": "다양한 AI 도구 경험 있어요" },
        { "value": "expert", "label": "잘 쓰고 있어요", "icon": "🏆", "description": "프롬프트도 직접 잘 짜요" }
      ]
    },
    {
      "id": "budget",
      "title": "비용은 어떻게 생각하세요?",
      "subtitle": "대부분의 AI 도구는 무료로 시작할 수 있어요",
      "showSkip": false,
      "options": [
        { "value": "free_only", "label": "무료만 쓸래요", "icon": "💚", "description": "돈 쓰기 싫어요" },
        { "value": "affordable", "label": "저렴하면 OK", "icon": "💰", "description": "월 1~2만원 정도는 괜찮아요" },
        { "value": "any", "label": "좋으면 투자할게요", "icon": "💎", "description": "효과 좋으면 비용 상관없어요" }
      ]
    }
  ],
  "purposeToSituationMap": {
    "writing": ["pdf-summary", "meeting-notes", "blog-writing"],
    "email": ["email-writing", "translation"],
    "presentation": ["presentation-slides"],
    "data": ["data-analysis", "excel-formula"],
    "translation": ["translation", "email-writing"],
    "paper": ["paper-summary", "pdf-summary"],
    "concept": ["concept-explanation"],
    "coding": ["code-debug", "code-review"],
    "english": ["english-conversation", "translation"],
    "research": ["competitor-research", "paper-summary"],
    "image": ["ui-design", "thumbnail-creation"],
    "video": ["thumbnail-creation"],
    "sns": ["sns-content", "blog-writing"],
    "blog": ["blog-writing", "sns-content"],
    "ui_design": ["ui-design"],
    "product_desc": ["blog-writing", "email-writing"],
    "marketing": ["sns-content", "blog-writing", "brainstorming"],
    "customer": ["email-writing", "brainstorming"],
    "analysis": ["data-analysis", "competitor-research"],
    "sns_biz": ["sns-content", "brainstorming"]
  }
}
```

---

## 12. 범위 (MoSCoW)

### Must (반드시 구현)

- [ ] `/onboarding` 페이지: 4단계 카드 선택 설문 UI
- [ ] Q1 직업/역할 → Q2 목적 동적 옵션
- [ ] Q3 경험 수준, Q4 예산 선호 질문
- [ ] 추천 알고리즘: purpose→situation 매핑 + 점수 계산
- [ ] `/onboarding/result` 페이지: 1순위 도구 + 대안 + 추천 가이드
- [ ] 건너뛰기 옵션 (모든 단계)
- [ ] 이전/다음 네비게이션
- [ ] localStorage에 결과 저장
- [ ] 결과 페이지 "시작하기" CTA (도구 공식 URL)
- [ ] 결과 페이지 "가이드 보기" CTA → `/situations/{slug}`
- [ ] 불만족 대응: "다시 설문하기" + "전체 도구 보기"
- [ ] 제휴 고지문 표시

### Should (강력 권장)

- [ ] URL 파라미터(`?r=`) 기반 결과 공유
- [ ] 재방문자 이전 결과 복원 배너
- [ ] 단계 전환 슬라이드 애니메이션
- [ ] GA4 이벤트 추적 (onboarding_start, onboarding_step, onboarding_complete, onboarding_skip)
- [ ] 모바일 반응형 레이아웃 최적화
- [ ] 결과 페이지 "링크 복사" 버튼

### Could (시간 되면)

- [ ] 결과 페이지 애니메이션 (카드 stagger 등장)
- [ ] 질문 간 프로그레스 바 애니메이션
- [ ] 결과 페이지에 "이 조합을 선택한 다른 사용자들은..." 문구
- [ ] 제휴 링크 실제 삽입 (Phase 1에서 프로그램 승인 시)

### Won't (이번 사이클 제외)

- [ ] 대화형 챗봇 인터페이스
- [ ] AI API 기반 추천 (GPT 연동)
- [ ] 사용자 계정/로그인
- [ ] Supabase 저장
- [ ] A/B 테스트 인프라
- [ ] 이메일 구독 유도

---

## 13. 수용 기준 (Acceptance Criteria)

### AC-1: 설문 시작 및 완료

```
Given 사용자가 /onboarding 페이지에 접속했을 때
When Q1~Q4를 모두 선택하면
Then /onboarding/result 페이지에 추천 결과가 표시된다
And URL에 ?r= 파라미터가 포함된다
And localStorage에 결과가 저장된다
```

### AC-2: 동적 옵션

```
Given Q1에서 "직장인/회사원"을 선택했을 때
When Q2가 표시되면
Then Q2의 선택지가 직장인 전용 옵션(문서, 이메일, 발표, 데이터, 번역)으로 표시된다
And "학생" 전용 옵션(논문, 개념, 코딩, 영어, 자료조사)은 표시되지 않는다
```

### AC-3: 건너뛰기

```
Given 설문 중 어떤 단계에서든
When "건너뛰기" 링크를 클릭하면
Then /situations 페이지로 이동한다
And GA4에 onboarding_skip 이벤트가 전송된다
```

### AC-4: 이전 버튼

```
Given Q3(경험 수준) 단계에서
When "이전" 버튼을 클릭하면
Then Q2(목적) 단계로 돌아간다
And Q2에서 이전에 선택한 값이 유지(하이라이트)되어 있다
```

### AC-5: 1순위 추천 도구

```
Given role=office_worker, purpose=writing, experience=never, budget=free_only로 설문을 완료했을 때
When 결과 페이지가 표시되면
Then 1순위 도구로 Claude 또는 ChatGPT가 추천된다 (둘 다 무료, 문서 작성에 적합)
And "무료로 시작 가능" 뱃지가 표시된다
And 추천 이유가 표시된다
```

### AC-6: 대안 도구

```
Given 결과 페이지에서
When 1순위 도구가 Claude일 때
Then 대안 도구로 ChatGPT, Gemini 중 1~3개가 표시된다
And 각 대안에 한 줄 추천 이유가 있다
And 각 대안에 "시작하기" 링크가 있다
```

### AC-7: 가이드 연결

```
Given 결과 페이지에서
When "가이드 보기" 버튼을 클릭하면
Then 해당 상황의 가이드 페이지(/situations/{slug})로 이동한다
```

### AC-8: 불만족 대응

```
Given 결과 페이지 하단에서
When "다시 설문하기"를 클릭하면
Then /onboarding 페이지로 이동하고 설문이 처음부터 시작된다
And localStorage의 이전 결과가 삭제된다
```

### AC-9: 재방문자

```
Given localStorage에 이전 온보딩 결과가 있는 사용자가
When /onboarding 페이지에 재방문하면
Then 상단에 "이전에 추천받은 결과가 있어요" 배너가 표시된다
And "이전 결과 보기" 클릭 시 저장된 파라미터로 /onboarding/result 이동
And "새로 시작하기" 클릭 시 localStorage 초기화 후 Q1 표시
```

### AC-10: URL 공유

```
Given 결과 페이지의 URL을 복사하여
When 다른 브라우저/기기에서 해당 URL에 접속하면
Then 동일한 추천 결과가 표시된다 (URL 파라미터 기반 계산)
And localStorage 저장 여부와 관계없이 작동한다
```

### AC-11: 예산 필터링

```
Given budget=free_only로 설문을 완료했을 때
When 결과 페이지가 표시되면
Then 1순위 도구와 모든 대안 도구가 무료(pricing.free=true)인 도구만 포함한다
```

### AC-12: 모바일 반응형

```
Given 모바일 화면(width < 640px)에서
When 설문 페이지를 볼 때
Then 옵션 카드가 1열 세로로 배치된다
And 카드 텍스트가 잘리지 않는다
And 터치 영역이 최소 44x44px 이상이다
```

### AC-13: 제휴 고지

```
Given 결과 페이지에서
When 페이지 하단을 스크롤하면
Then "이 페이지의 일부 링크는 제휴 링크입니다" 고지문이 표시된다
```

---

## 14. 태스크 분해

### 사이클 2: 설문 UI + 알고리즘

| # | 태스크 | 복잡도 | 의존성 | 예상 시간 |
|---|--------|--------|--------|----------|
| 1 | `src/data/onboarding.json` 데이터 파일 작성 | S | 없음 | 20분 |
| 2 | `src/types/onboarding.ts` 타입 정의 | S | 없음 | 15분 |
| 3 | `src/lib/onboardingEngine.ts` 추천 알고리즘 구현 | L | 1, 2 | 60분 |
| 4 | `src/lib/onboardingStorage.ts` localStorage 관리 | S | 2 | 15분 |
| 5 | `src/components/onboarding/QuestionCard.tsx` | S | 2 | 20분 |
| 6 | `src/components/onboarding/StepIndicator.tsx` | S | 없음 | 15분 |
| 7 | `src/components/onboarding/OnboardingWizard.tsx` | M | 3, 4, 5, 6 | 45분 |
| 8 | `src/app/onboarding/page.tsx` 라우트 페이지 | M | 7 | 30분 |
| 9 | 알고리즘 유닛 테스트 작성 | M | 3 | 30분 |

### 사이클 3: 결과 페이지 + 통합

| # | 태스크 | 복잡도 | 의존성 | 예상 시간 |
|---|--------|--------|--------|----------|
| 10 | `src/components/onboarding/ResultPrimaryCard.tsx` | M | 2 | 30분 |
| 11 | `src/components/onboarding/ResultAlternatives.tsx` | S | 2 | 20분 |
| 12 | `src/components/onboarding/ResultSituations.tsx` | S | 2 | 20분 |
| 13 | `src/components/onboarding/ResultShareBar.tsx` | S | 없음 | 15분 |
| 14 | `src/components/onboarding/ReturningUserBanner.tsx` | S | 4 | 15분 |
| 15 | `src/app/onboarding/result/page.tsx` 결과 페이지 | L | 10~14 | 45분 |
| 16 | URL 파라미터 인코딩/디코딩 유틸리티 | S | 없음 | 15분 |
| 17 | `tools.json`에 `affiliateUrl` 필드 추가 | S | 없음 | 10분 |
| 18 | 기존 `OnboardingModal.tsx` 교체 (새 온보딩 CTA로) | S | 8 | 15분 |
| 19 | 랜딩 페이지에 온보딩 CTA 버튼 추가 | S | 8 | 15분 |
| 20 | GA4 이벤트 추적 통합 | M | 8, 15 | 30분 |
| 21 | 모바일 반응형 테스트 및 수정 | M | 8, 15 | 30분 |
| 22 | 결과 페이지 컴포넌트 테스트 | M | 15 | 30분 |

---

## 15. Open Questions

1. **기존 SurveyWizard 질문 세트와의 관계**: 기존 `survey.json`에 6개 질문(context, task, goal, preference, experience, budget)이 있다. 새 온보딩은 4개 질문(role, purpose, experience, budget)으로 설계했다. 기존 SurveyWizard를 병행 운영하는 것이 맞는지, 아니면 새 온보딩으로 완전 교체할지?

   > **PM 판단**: 병행 운영. SurveyWizard는 `/situations` 페이지 내 인라인 용도로 유지. 새 온보딩은 별도 페이지(`/onboarding`)로 분리. 사용 맥락이 다르므로 중복이 아님.

2. **Q1 선택지 "기타"**: 4개 역할에 해당하지 않는 사용자(예: 주부, 은퇴자)를 위한 "기타" 옵션이 필요한가?

   > **PM 판단**: v1에서는 "기타" 생략. 4개 역할이 타겟 페르소나를 충분히 커버하며, "기타"를 추가하면 Q2 동적 옵션 설계가 복잡해짐. 추후 데이터로 누락 비율을 파악한 뒤 추가.

3. **제휴 프로그램 승인 시기**: Phase 1 출시 시점에 제휴 링크가 준비되지 않을 가능성이 높다. 그 경우 어떻게 하는가?

   > **PM 판단**: `affiliateUrl`이 null이면 공식 URL(`url` 필드) 사용. 제휴 링크 고지문도 "일부 링크"로 표현하여 제휴 링크가 없어도 문제없도록 함. 제휴 승인 후 `tools.json`만 업데이트하면 됨.

---

## 16. Out of Scope

| 항목 | 사유 |
|------|------|
| AI API 연동 추천 (GPT/Claude API 호출) | 비용 + 복잡도. 규칙 기반으로 충분 |
| 사용자 계정/로그인 | Phase 3에서 도입 |
| 추천 결과 히스토리 (여러 번 설문 기록) | 복잡도 대비 가치 낮음. localStorage는 최신 1건만 저장 |
| A/B 테스트 (설문 문구/순서 변형) | Phase 2에서 GA4 데이터 기반으로 도입 |
| 설문 중간 이탈 복원 (Q2까지 답하고 나갔다가 돌아옴) | 4단계 짧은 설문이므로 불필요 |
| 다국어 (영어 설문) | Phase 4에서 검토 |

---

## Version History

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| v1.0 | 2026-02-17 | 초기 명세 작성 |
