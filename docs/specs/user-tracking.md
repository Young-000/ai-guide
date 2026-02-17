# User Tracking: 사용자 진행 상황 추적

> **Feature:** 학습 경로 시각화 + 도구 숙련도 + 맞춤 다음 단계 + 학습 리포트
> **Status:** Draft | **작성일:** 2026-02-17 | **사이클:** Phase 3, Cycle 10
> **의존성:** progress-tracking (Cycle 9) — levelSystem.ts, progress.ts, recommendations.ts, streakSystem.ts, achievementSystem.ts

---

## JTBD

**When** AI 가이드를 몇 개 완료하고 나서 "나는 어떤 AI에 얼마나 익숙해진 거지?"가 궁금할 때,
**I want to** 도구별 숙련도, 카테고리별 학습 진행 맵, 그리고 나에게 맞는 다음 단계를 한눈에 확인하고,
**so I can** 내 AI 활용 수준을 객관적으로 파악하고, 빈 영역을 채워나가며 체계적으로 성장할 수 있다.

---

## Problem

- **Who:** 3개 이상의 상황 가이드를 완료한 재방문 사용자 (Cycle 9에서 `/my-progress`를 이미 방문하는 사용자)
- **Pain:** 현재 `/my-progress`는 "총 완료 수, 스트릭, 업적, 타임라인"을 보여주지만, **도구별로 얼마나 깊이 배웠는지**(숙련도), **어떤 영역이 비어있는지**(학습 맵), **시간 흐름에 따른 성장**(리포트)은 알 수 없다. 사용자가 "다음에 뭘 해야 하지?"를 결정할 정보가 부족하다. (빈도: 매 방문, 심각도: 중간 -- 성장 체감과 방향성 부재는 이탈로 이어진다)
- **Current workaround:** `/my-progress`의 SmartRecommendations 섹션이 2-3개 상황을 추천하지만, "왜 이 도구를 더 배워야 하는지", "내 전체 학습 맵에서 어디가 빈 곳인지"에 대한 맥락이 없다.
- **Success metric:**
  - `/my-progress` 내 "학습 맵" 또는 "도구 숙련도" 섹션 클릭/조회율 >= 40% (페이지 방문자 대비)
  - 추천 상황 클릭률 (기존 대비) +20% 향상
  - 7일 내 재방문율 25% -> 30% (PRD KPI #7 추적)

---

## Solution

### Overview

기존 `/my-progress` 페이지를 3가지 차원으로 강화한다:

1. **학습 경로 시각화** -- 카테고리별 진행률 맵과 도구별 학습 히스토리를 시각적으로 보여준다. 사용자는 "업무 영역은 80% 배웠지만 디자인은 0%"를 즉시 파악할 수 있다.

2. **도구 숙련도 시스템** -- 각 AI 도구(ChatGPT, Claude, Midjourney 등)에 대해 beginner/intermediate/advanced 숙련 단계를 부여한다. 해당 도구가 primary인 상황 가이드 완료 수와 프롬프트 복사 횟수로 측정한다.

3. **맞춤 다음 단계 제안 강화** -- 기존 `recommendations.ts`의 스코어링을 확장하여 "같은 도구를 더 깊이"와 "새로운 영역 탐색"을 명시적으로 분리 제안한다. 또한 주간 학습 요약을 제공한다.

모든 데이터는 기존 `UserProgress` 타입에 최소한의 필드만 추가하여 localStorage에 저장한다. Cycle 9의 spread 패턴(`{ ...DEFAULT_PROGRESS, ...parsed }`)으로 하위 호환을 유지한다.

### User Flow

```
[Header 레벨 뱃지 or "내 학습" 클릭]
  -> /my-progress 페이지
      |- [기존] ProgressHero (레벨 + XP)
      |- [기존] StatsGrid (4개 카드)
      |
      |- [신규] CategoryProgressMap (카테고리별 진행률)
      |    - 6개 카테고리 프로그레스 바 (업무/학습/개발/디자인/콘텐츠/리서치)
      |    - 각 카테고리 클릭 -> 해당 카테고리 미완료 상황 리스트 표시
      |
      |- [신규] ToolProficiencyPanel (도구별 숙련도)
      |    - 도구별 카드: 아이콘 + 이름 + 숙련도 단계 배지
      |    - beginner(1~2개 완료) / intermediate(3~4개) / advanced(5개+)
      |    - "이 도구로 다음에 도전할 가이드" 링크
      |
      |- [강화] SmartRecommendations
      |    - 2가지 트랙: "더 깊이 배우기" + "새로운 영역 탐색"
      |    - 각 추천에 맥락 이유 ("Claude 숙련도를 높여보세요", "디자인은 아직 시도하지 않았어요")
      |
      |- [신규] WeeklyLearningReport (주간 학습 리포트)
      |    - 이번 주 완료한 가이드, 획득 XP, 새 도구 시도 여부
      |    - 지난 주 대비 변화 표시
      |
      |- [기존] AchievementsGrid
      |- [기존] CompletionTimeline

[카테고리 프로그레스 바 클릭]
  -> 해당 카테고리 미완료 상황 목록 인라인 펼침
  -> 상황 클릭 -> /situations/{slug}

[도구 숙련도 카드 클릭]
  -> 해당 도구 관련 미완료 상황 인라인 표시
  -> 상황 클릭 -> /situations/{slug}
```

### Scope (MoSCoW)

**Must:**
- 카테고리별 진행률 시각화 (`CategoryProgressMap` 컴포넌트)
- 도구별 숙련도 계산 로직 + UI (`ToolProficiencyPanel` 컴포넌트)
- 숙련도 단계 정의 (beginner / intermediate / advanced) + 계산 함수
- SmartRecommendations 2-트랙 분리 ("더 깊이" + "새 영역")
- `UserProgress`에 도구별 프롬프트 복사 추적 필드 추가 (`promptCopyByTool`)
- `/my-progress` 페이지에 신규 섹션 통합 (기존 섹션 사이에 배치)
- 하위 호환 유지 (기존 사용자 데이터 보존)

**Should:**
- 주간 학습 리포트 섹션 (`WeeklyLearningReport`)
- 카테고리 프로그레스 바 클릭 시 미완료 상황 리스트 펼침
- 도구 숙련도 카드 클릭 시 관련 미완료 상황 인라인 표시
- 숙련도 레벨업 시 간단한 축하 표시 (텍스트 기반, Toast 재사용)
- 카테고리/도구 필터를 통한 추천 상황 탐색

**Could:**
- 도구별 학습 히스토리 타임라인 (어떤 날짜에 어떤 도구를 처음 사용했는지)
- 카테고리 레이더 차트 시각화 (6각형 그래프)
- 월간 학습 요약 (이번 달 vs 지난 달 비교)
- 도구 숙련도에 따른 새 업적 추가 ("ChatGPT 달인", "멀티 도구 마스터" 등)

**Won't (this cycle):**
- Supabase 연동 / 크로스 디바이스 동기화
- 사용자 간 비교 / 리더보드
- AI 기반 개인화 추천 (현재는 규칙 기반)
- 학습 일정/캘린더 기능
- 도구별 퀴즈 / 실력 테스트

---

## Data Model

### UserProgress 확장 (최소 추가)

```typescript
// src/lib/levelSystem.ts 에 추가

export interface UserProgress {
  // --- 기존 필드 (Cycle 9, 변경 없음) ---
  completedSituations: string[];
  completedSteps: Record<string, number[]>;
  totalXp: number;
  currentLevel: number;
  lastVisit: string;
  isOnboarded: boolean;
  achievements: EarnedAchievement[];
  dailyActivities: DailyActivity[];
  situationCompletions: SituationCompletion[];
  toolsUsed: string[];
  promptCopyCount: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;

  // --- Cycle 10 신규 필드 ---
  promptCopyByTool: Record<string, number>;  // { "chatgpt": 5, "claude": 3 } - 도구별 프롬프트 복사 횟수
  toolFirstUsedAt: Record<string, string>;   // { "chatgpt": "2026-02-10" } - 도구 첫 사용 날짜
}
```

### DEFAULT_PROGRESS 확장

```typescript
const DEFAULT_PROGRESS: UserProgress = {
  // 기존 필드 유지...
  // 신규
  promptCopyByTool: {},
  toolFirstUsedAt: {},
};
```

### 도구 숙련도 타입 (새 모듈)

```typescript
// src/lib/toolProficiency.ts

export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced';

export type ToolProficiency = {
  toolSlug: string;
  toolName: string;
  level: ProficiencyLevel;
  completedGuides: number;      // 이 도구가 primary인 완료 가이드 수
  totalGuides: number;          // 이 도구가 primary인 전체 가이드 수
  promptsCopied: number;        // 이 도구 관련 프롬프트 복사 수
  firstUsedAt: string | null;   // 첫 사용 날짜
  nextGuide: Situation | null;  // 이 도구로 다음 추천 가이드
};
```

### 숙련도 등급 기준

| 등급 | 조건 | 배지 |
|------|------|------|
| beginner | 해당 도구 primary 가이드 1~2개 완료 | 초보 |
| intermediate | 해당 도구 primary 가이드 3~4개 완료 OR 프롬프트 5회+ 복사 | 중급 |
| advanced | 해당 도구 primary 가이드 5개+ 완료 AND 프롬프트 10회+ 복사 | 고급 |

**참고:** 현재 19개 상황에서 도구별 primary 가이드 수:
- Claude: 7개 (pdf-summary, code-debug, paper-summary, blog-writing, meeting-notes, data-analysis, resume-writing)
- ChatGPT: 7개 (email-writing, concept-explanation, excel-formula, sns-content, english-conversation, brainstorming, code-review 제외...)
- 기타 도구: 1-2개 (Gamma, Cursor, Midjourney, Perplexity)

소수 가이드 도구(Gamma, Cursor 등)의 경우 1개 완료 시 intermediate, 해당 전체 완료 시 advanced로 조정한다.

### 카테고리 진행률 타입

```typescript
// src/lib/categoryProgress.ts

export type CategoryProgress = {
  categoryId: SituationCategory;
  categoryName: string;
  categoryIcon: string;
  completedCount: number;
  totalCount: number;
  percentage: number;        // 0-100
  remainingSituations: Situation[];
};
```

### 주간 리포트 타입

```typescript
// src/lib/weeklyReport.ts

export type WeeklyReport = {
  weekStart: string;          // 'YYYY-MM-DD' (월요일)
  weekEnd: string;            // 'YYYY-MM-DD' (일요일)
  guidesCompleted: number;
  stepsCompleted: number;
  xpEarned: number;
  newToolsTried: string[];    // 이번 주에 처음 시도한 도구 slug
  achievementsEarned: string[]; // 이번 주 달성한 업적 제목
  // 지난 주 대비
  prevWeekGuidesCompleted: number;
  guidesChange: number;       // guidesCompleted - prevWeekGuidesCompleted
};
```

---

## Core Logic

### 1. 도구 숙련도 계산 (`src/lib/toolProficiency.ts`)

```typescript
import type { Situation } from '@/types';
import type { UserProgress } from './levelSystem';

/**
 * 모든 도구의 숙련도 계산
 *
 * 1. allSituations에서 도구별 primary 가이드 목록 집계
 * 2. 완료한 가이드 수 + 프롬프트 복사 수로 등급 판정
 * 3. 다음 추천 가이드 (미완료 중 가장 쉬운 것) 계산
 */
export function calculateToolProficiencies(
  progress: UserProgress,
  allSituations: Situation[],
): ToolProficiency[];

/**
 * 단일 도구의 숙련도 등급 계산
 *
 * 가이드가 3개 이상인 도구 (claude, chatgpt):
 *   beginner: 1-2개 완료
 *   intermediate: 3-4개 완료 OR 프롬프트 5회+
 *   advanced: 5개+ 완료 AND 프롬프트 10회+
 *
 * 가이드가 1-2개인 도구 (gamma, cursor, midjourney 등):
 *   beginner: 0개 완료 (toolsUsed에만 포함)
 *   intermediate: 1개 완료
 *   advanced: 전체 완료 AND 프롬프트 3회+
 */
export function calculateProficiencyLevel(
  completedCount: number,
  totalCount: number,
  promptsCopied: number,
): ProficiencyLevel;
```

### 2. 카테고리 진행률 계산 (`src/lib/categoryProgress.ts`)

```typescript
import type { Situation, SituationCategory } from '@/types';
import type { UserProgress } from './levelSystem';

/**
 * 6개 카테고리의 진행률 계산
 * 각 카테고리의 전체 가이드 수 대비 완료 수를 백분율로 반환
 */
export function calculateCategoryProgress(
  progress: UserProgress,
  allSituations: Situation[],
  categories: Array<{ id: SituationCategory; name: string; icon: string }>,
): CategoryProgress[];
```

### 3. 주간 리포트 계산 (`src/lib/weeklyReport.ts`)

```typescript
import type { UserProgress } from './levelSystem';

/**
 * 이번 주(월~일) 학습 리포트 생성
 * dailyActivities와 situationCompletions 데이터를 기반으로 집계
 */
export function generateWeeklyReport(progress: UserProgress): WeeklyReport;

/**
 * 주어진 날짜가 포함된 주의 월요일 반환
 */
export function getWeekStart(date: string): string;
```

### 4. SmartRecommendations 확장 (`src/lib/recommendations.ts`)

```typescript
// 기존 getRecommendations 유지 + 새 함수 추가

export type RecommendationTrack = 'deepen' | 'explore';

export type EnhancedRecommendation = {
  situation: Situation;
  reason: string;
  score: number;
  track: RecommendationTrack;
  trackLabel: string;  // "더 깊이 배우기" | "새로운 영역 탐색"
  context: string;     // "Claude 숙련도: 중급 -> 이 가이드로 고급 달성 가능" 등
};

/**
 * 2-트랙 추천: "더 깊이"(같은 도구 심화) + "새 영역"(미시도 카테고리/도구)
 * 기존 getRecommendations의 스코어링을 확장하여 트랙 분류
 *
 * "더 깊이" 트랙 (deepen):
 *   - 사용자가 이미 시작한 도구 중 intermediate인 도구의 미완료 가이드
 *   - "이 도구를 더 사용하면 advanced 달성!" 컨텍스트
 *
 * "새 영역" 트랙 (explore):
 *   - 사용자가 아직 시도하지 않은 카테고리의 easy 상황
 *   - "디자인 영역은 아직 시작하지 않았어요" 컨텍스트
 */
export function getEnhancedRecommendations(
  progress: UserProgress,
  allSituations: Situation[],
  toolProficiencies: ToolProficiency[],
  categoryProgress: CategoryProgress[],
): { deepen: EnhancedRecommendation[]; explore: EnhancedRecommendation[] };
```

### 5. 도구별 프롬프트 복사 추적 (ProgressManager 확장)

```typescript
// progress.ts의 ProgressManager.trackPromptCopy() 확장

/**
 * 프롬프트 복사 추적 (도구 정보 포함)
 * 기존 promptCopyCount 증가 + promptCopyByTool 도구별 카운트 추가
 */
trackPromptCopy(toolSlug?: string): void {
  this.progress = {
    ...this.progress,
    promptCopyCount: this.progress.promptCopyCount + 1,
    ...(toolSlug ? {
      promptCopyByTool: {
        ...this.progress.promptCopyByTool,
        [toolSlug]: (this.progress.promptCopyByTool[toolSlug] ?? 0) + 1,
      },
    } : {}),
  };

  this.checkAndApplyAchievements();
  this.save();
  this.notifyListeners();
}
```

### 6. 도구 첫 사용 날짜 기록

```typescript
// progress.ts의 markStepComplete() 확장 (기존 도구 추적 부분)

if (stepOrder === 1) {
  const situation = allSituations.find((s) => s.slug === situationSlug);
  const primaryTool = situation?.recommendedTools.find((t) => t.isPrimary);
  if (primaryTool && !this.progress.toolsUsed.includes(primaryTool.slug)) {
    const today = getToday();
    this.progress = {
      ...this.progress,
      toolsUsed: [...this.progress.toolsUsed, primaryTool.slug],
      toolFirstUsedAt: {
        ...this.progress.toolFirstUsedAt,
        [primaryTool.slug]: today,
      },
    };
  }
}
```

---

## Component Design

### 1. CategoryProgressMap (`src/components/CategoryProgressMap.tsx`)

카테고리별 학습 진행률을 프로그레스 바로 시각화.

```
+----------------------------------------------+
|  학습 맵                                       |
|                                               |
|  💼 업무     ████████████░░░  4/5  (80%)       |
|  📚 학습     ██████░░░░░░░░  2/4  (50%)       |
|  💻 개발     ████░░░░░░░░░░  1/3  (33%)       |
|  🎨 디자인   ░░░░░░░░░░░░░░  0/2  (0%)        |
|  ✍️ 콘텐츠   ██████████░░░░  3/4  (75%)       |
|  🔍 리서치   ░░░░░░░░░░░░░░  0/1  (0%)        |
|                                               |
|  [디자인 클릭 시 펼침]                           |
|  ├─ 🎨 UI 레퍼런스 디자인 (쉬움, 15분)    [시작]  |
|  └─ 🖼️ 썸네일 만들기 (보통, 20분)        [시작]  |
+----------------------------------------------+
```

**Props:**
- `categoryProgress: CategoryProgress[]`
- `onCategoryClick?: (categoryId: SituationCategory) => void`

**동작:**
- 카테고리 행 클릭 시 미완료 상황 목록 아코디언 펼침
- 0% 카테고리는 연한 배경 + "아직 시작하지 않았어요" 힌트
- 100% 카테고리는 초록색 배경 + 체크 아이콘

### 2. ToolProficiencyPanel (`src/components/ToolProficiencyPanel.tsx`)

도구별 숙련도를 카드 그리드로 표시.

```
+----------------------------------------------+
|  도구별 숙련도                                   |
|                                               |
|  ┌──────────┐ ┌──────────┐ ┌──────────┐       |
|  │ 🤖       │ │ 💬       │ │ 🎨       │       |
|  │ Claude   │ │ ChatGPT  │ │ Midjourney│       |
|  │ ██████░  │ │ ████░░░  │ │ ██░░░░░  │       |
|  │ 중급      │ │ 중급      │ │ 초보      │       |
|  │ 3/7 완료  │ │ 2/5 완료  │ │ 1/2 완료  │       |
|  └──────────┘ └──────────┘ └──────────┘       |
|                                               |
|  [Claude 클릭 시]                               |
|  다음 가이드: 📊 데이터 분석하기 (중급)     [시작] |
+----------------------------------------------+
```

**Props:**
- `proficiencies: ToolProficiency[]`
- `onToolClick?: (toolSlug: string) => void`

**동작:**
- 도구 카드 클릭 시 해당 도구의 다음 추천 가이드 인라인 표시
- 숙련도 레벨별 색상: beginner(gray-400), intermediate(blue-500), advanced(green-500)
- toolsUsed에 없는 도구(한 번도 시도 안한)는 표시하지 않음 (깔끔한 UI)

### 3. EnhancedRecommendations (`src/components/EnhancedRecommendations.tsx`)

기존 SmartRecommendations를 2-트랙으로 강화.

```
+----------------------------------------------+
|  다음에 도전해보세요                              |
|                                               |
|  [더 깊이 배우기]                                |
|  ┌──────────────────────────────────────┐     |
|  │ 📊 데이터 분석하기  · 보통 · 20분       │     |
|  │ "Claude 중급 -> 고급 달성 가능"         │     |
|  │                              [시작하기] │     |
|  └──────────────────────────────────────┘     |
|                                               |
|  [새로운 영역 탐색]                              |
|  ┌──────────────────────────────────────┐     |
|  │ 🎨 UI 레퍼런스 디자인  · 쉬움 · 15분    │     |
|  │ "디자인 영역을 아직 시도하지 않았어요"    │     |
|  │                              [시작하기] │     |
|  └──────────────────────────────────────┘     |
+----------------------------------------------+
```

**Props:**
- `deepen: EnhancedRecommendation[]`
- `explore: EnhancedRecommendation[]`
- 기존 `allCompleted: boolean` (전체 완료 시 축하 메시지)

### 4. WeeklyLearningReport (`src/components/WeeklyLearningReport.tsx`)

이번 주 학습 요약.

```
+----------------------------------------------+
|  이번 주 학습 리포트  (2/10 ~ 2/16)              |
|                                               |
|  ┌────────┐ ┌────────┐ ┌────────┐             |
|  │  3개   │ │ 120 XP │ │  1개   │             |
|  │ 가이드  │ │ 획득    │ │ 새 도구│             |
|  │ ↑2     │ │ ↑50    │ │        │             |
|  └────────┘ └────────┘ └────────┘             |
|                                               |
|  지난 주 대비: 가이드 +2개, XP +50 더 획득        |
+----------------------------------------------+
```

**Props:**
- `report: WeeklyReport`

**동작:**
- 활동이 없는 주는 "이번 주는 아직 학습 기록이 없어요. 한 개만 시작해볼까요?" 표시
- 지난 주 대비 변화: 양수면 초록 화살표, 음수면 회색, 동일하면 "-"

---

## Integration Points

### /my-progress 페이지 섹션 순서 (통합 후)

```
1. ProgressHero (기존, 변경 없음)
2. StatsGrid (기존, 변경 없음)
3. CategoryProgressMap (신규)
4. ToolProficiencyPanel (신규)
5. EnhancedRecommendations (기존 SmartRecommendations 교체)
6. WeeklyLearningReport (신규)
7. AchievementsGrid (기존, 변경 없음)
8. CompletionTimeline (기존, 변경 없음)
```

### ProgressManager 변경 사항

1. `trackPromptCopy(toolSlug?: string)` -- 시그니처 변경 (선택적 toolSlug 파라미터 추가)
2. `markStepComplete()` -- 도구 첫 사용 날짜 기록 추가 (`toolFirstUsedAt`)

### 프롬프트 복사 버튼 변경

현재 프롬프트 복사 시 `trackPromptCopy()`를 호출하는 곳에서 해당 상황의 primary tool slug를 함께 전달:

```typescript
// situation detail 페이지 내 프롬프트 복사 핸들러
const handleCopyPrompt = () => {
  navigator.clipboard.writeText(prompt.content);
  const primaryTool = situation.recommendedTools.find(t => t.isPrimary);
  progressManager.trackPromptCopy(primaryTool?.slug);
};
```

### 기존 SmartRecommendations 교체

기존 `/my-progress/page.tsx`의 `SmartRecommendations` 컴포넌트를 `EnhancedRecommendations`로 교체한다. 기존 `getRecommendations()` 함수는 삭제하지 않고 유지한다 (다른 곳에서 사용 가능). 새로운 `getEnhancedRecommendations()`는 내부적으로 기존 로직을 활용하되 트랙 분류를 추가한다.

---

## Acceptance Criteria

### 카테고리별 학습 맵

- [ ] **AC-1:** Given 사용자가 "업무" 카테고리의 가이드 5개 중 3개를 완료했을 때, When `/my-progress`의 학습 맵 섹션을 보면, Then "업무" 행에 60% 프로그레스 바와 "3/5" 텍스트가 표시된다.

- [ ] **AC-2:** Given 사용자가 "디자인" 카테고리의 가이드를 하나도 완료하지 않았을 때, When 학습 맵의 "디자인" 행을 보면, Then 0% 프로그레스 바와 "0/2" 텍스트가 표시되고, 해당 행을 클릭하면 미완료 상황 2개가 리스트로 펼쳐진다.

- [ ] **AC-3:** Given 사용자가 "학습" 카테고리의 모든 가이드를 완료했을 때, When 학습 맵을 보면, Then "학습" 행에 100% 프로그레스 바와 초록색 체크 표시가 보인다.

- [ ] **AC-4:** Given 학습 맵의 카테고리 행을 클릭했을 때, When 미완료 상황 리스트가 펼쳐지면, Then 각 상황의 제목, 난이도, 소요 시간, "/situations/{slug}"로의 링크가 표시된다.

### 도구 숙련도

- [ ] **AC-5:** Given 사용자가 Claude primary 가이드를 3개 완료하고 Claude 관련 프롬프트를 2회 복사했을 때, When 도구 숙련도 패널을 보면, Then Claude 카드에 "중급" 배지, "3/7 완료" 텍스트, 프로그레스 바가 표시된다.

- [ ] **AC-6:** Given 사용자가 Gamma primary 가이드 1개(전체 1개)를 완료하고 프롬프트를 3회 이상 복사했을 때, When 도구 숙련도를 보면, Then Gamma 카드에 "고급" 배지가 표시된다 (소수 가이드 도구의 조정 기준 적용).

- [ ] **AC-7:** Given 사용자가 한 번도 사용하지 않은 도구(toolsUsed에 미포함)가 있을 때, When 도구 숙련도 패널을 보면, Then 해당 도구는 패널에 표시되지 않는다.

- [ ] **AC-8:** Given 도구 숙련도 카드를 클릭했을 때, When 해당 도구의 미완료 가이드가 있으면, Then "다음 추천 가이드" 1개가 인라인으로 표시되고 클릭 시 해당 가이드로 이동한다.

### 맞춤 추천 2-트랙

- [ ] **AC-9:** Given 사용자가 Claude 가이드 3개 완료(중급), 디자인 0개 시도 상태일 때, When 추천 섹션을 보면, Then "더 깊이 배우기" 트랙에 Claude primary 미완료 가이드 1-2개가 "Claude 숙련도를 높여보세요" 컨텍스트와 함께, "새로운 영역 탐색" 트랙에 디자인 카테고리 easy 가이드가 "디자인은 아직 시작하지 않았어요" 컨텍스트와 함께 표시된다.

- [ ] **AC-10:** Given 사용자가 모든 도구를 최소 1개 이상 시도하고 모든 카테고리도 시도한 상태일 때, When 추천 섹션을 보면, Then "더 깊이 배우기" 트랙만 표시되고 "새로운 영역 탐색"은 숨겨진다 (탐색할 새 영역이 없으므로).

- [ ] **AC-11:** Given 모든 상황을 완료한 사용자가 추천 섹션을 보면, Then "모든 가이드를 완료했어요!" 축하 메시지가 표시된다 (기존 동작 유지).

### 주간 학습 리포트

- [ ] **AC-12:** Given 사용자가 이번 주에 가이드 2개를 완료하고 80 XP를 획득했을 때, When 주간 리포트를 보면, Then "2개 가이드", "80 XP", 이번 주 날짜 범위가 표시된다.

- [ ] **AC-13:** Given 사용자가 지난 주에 1개, 이번 주에 3개 가이드를 완료했을 때, When 주간 리포트를 보면, Then 지난 주 대비 "+2개" 변화가 초록색으로 표시된다.

- [ ] **AC-14:** Given 사용자가 이번 주에 아무 활동이 없을 때, When 주간 리포트를 보면, Then "이번 주는 아직 학습 기록이 없어요" 메시지와 "/situations" 링크 CTA가 표시된다.

### 데이터 호환성

- [ ] **AC-15:** Given 기존 사용자(Cycle 9 데이터, `promptCopyByTool`과 `toolFirstUsedAt` 필드 없음)가 업데이트된 앱에 접속할 때, When 데이터가 로드되면, Then 기존 데이터(XP, 레벨, 업적, 스트릭 등)가 모두 보존되고, `promptCopyByTool`은 `{}`, `toolFirstUsedAt`은 `{}`로 초기화된다.

- [ ] **AC-16:** Given `trackPromptCopy()`를 toolSlug 없이 호출해도(기존 호출 방식), When 호출이 완료되면, Then `promptCopyCount`만 증가하고 `promptCopyByTool`에는 변화가 없으며 에러가 발생하지 않는다.

### 빈 상태 및 엣지 케이스

- [ ] **AC-17:** Given 사용자가 아무 상황도 완료하지 않은 상태일 때, When `/my-progress`에 접속하면, Then 기존 EmptyState가 표시되고 신규 섹션(학습 맵, 숙련도 등)은 렌더링되지 않는다.

- [ ] **AC-18:** Given 사용자가 1개 도구만 사용하고 1개 카테고리만 시도한 상태일 때, When 학습 맵과 도구 숙련도를 보면, Then 해당 1개 카테고리/1개 도구의 진행 상황이 정확하게 표시되고, 나머지 카테고리는 0%로 표시된다.

---

## Task Breakdown

### 1단계: 데이터 모델 + 핵심 로직

| # | Task | Complexity | Dependencies |
|---|------|-----------|-------------|
| 1 | `UserProgress` 타입에 `promptCopyByTool`, `toolFirstUsedAt` 추가 + `DEFAULT_PROGRESS` 업데이트 (levelSystem.ts) | S | none |
| 2 | `src/lib/toolProficiency.ts` 생성: `ToolProficiency` 타입 + `calculateToolProficiencies()` + `calculateProficiencyLevel()` | M | 1 |
| 3 | `src/lib/categoryProgress.ts` 생성: `CategoryProgress` 타입 + `calculateCategoryProgress()` | S | none |
| 4 | `src/lib/weeklyReport.ts` 생성: `WeeklyReport` 타입 + `generateWeeklyReport()` + `getWeekStart()` | M | none |
| 5 | `src/lib/recommendations.ts` 확장: `EnhancedRecommendation` 타입 + `getEnhancedRecommendations()` | M | 2, 3 |

### 2단계: ProgressManager 확장

| # | Task | Complexity | Dependencies |
|---|------|-----------|-------------|
| 6 | `ProgressManager.trackPromptCopy(toolSlug?)` 시그니처 변경 + `promptCopyByTool` 업데이트 로직 | S | 1 |
| 7 | `ProgressManager.markStepComplete()` 확장: `toolFirstUsedAt` 기록 | S | 1 |
| 8 | 프롬프트 복사 호출 위치에서 toolSlug 전달하도록 수정 (GuidePanel 또는 situation detail) | S | 6 |

### 3단계: UI 컴포넌트

| # | Task | Complexity | Dependencies |
|---|------|-----------|-------------|
| 9 | `CategoryProgressMap` 컴포넌트 (6개 카테고리 프로그레스 바 + 아코디언 펼침) | M | 3 |
| 10 | `ToolProficiencyPanel` 컴포넌트 (도구별 카드 그리드 + 숙련도 배지 + 인라인 추천) | M | 2 |
| 11 | `EnhancedRecommendations` 컴포넌트 (2-트랙 추천 UI + 컨텍스트 텍스트) | M | 5 |
| 12 | `WeeklyLearningReport` 컴포넌트 (주간 요약 카드 + 지난 주 대비 변화 표시) | S | 4 |

### 4단계: 페이지 통합

| # | Task | Complexity | Dependencies |
|---|------|-----------|-------------|
| 13 | `/my-progress/page.tsx` 리팩터링: 신규 섹션 통합 + SmartRecommendations를 EnhancedRecommendations로 교체 + 섹션 순서 배치 | M | 9, 10, 11, 12 |

### 5단계: 테스트

| # | Task | Complexity | Dependencies |
|---|------|-----------|-------------|
| 14 | `toolProficiency.ts` 유닛 테스트: 숙련도 등급 계산 (일반 도구, 소수 가이드 도구, 엣지 케이스) | M | 2 |
| 15 | `categoryProgress.ts` 유닛 테스트: 카테고리별 진행률, 0%, 100% 케이스 | S | 3 |
| 16 | `weeklyReport.ts` 유닛 테스트: 주간 집계, 지난 주 비교, 빈 주간 | M | 4 |
| 17 | `recommendations.ts` 확장 유닛 테스트: 2-트랙 분류 정확성 | M | 5 |
| 18 | 하위 호환 테스트: Cycle 9 데이터 마이그레이션 검증 | S | 1 |
| 19 | `/my-progress` 페이지 통합 테스트: 빈 상태, 부분 진행, 전체 완료 시나리오 | M | 13 |

**총 예상: 19 tasks, ~14시간 작업량**

---

## GA4 이벤트 추적

```typescript
const USER_TRACKING_EVENTS = {
  'category_map_view': {},
  'category_map_expand': { category_id: string },
  'tool_proficiency_view': {},
  'tool_proficiency_click': { tool_slug: string, proficiency_level: string },
  'recommendation_track_click': { track: 'deepen' | 'explore', situation_slug: string },
  'weekly_report_view': { guides_completed: number, xp_earned: number },
};
```

---

## Open Questions

1. **소수 가이드 도구의 숙련도 기준:** Gamma(1개), Cursor(1개), Midjourney(2개) 등 primary 가이드가 1-2개인 도구의 숙련도 기준을 어떻게 잡을지. 현재 제안: 1개 완료 = intermediate, 전체 완료 + 프롬프트 3회 = advanced. 이 기준이 적절한지 개발 중 확인 필요.

2. **주간 리포트의 "주" 기준:** 월요일~일요일 vs 일요일~토요일. 한국 관례상 월~일이 자연스러우나, `Date.getDay()`는 일요일=0이라 구현 시 주의 필요.

3. **카테고리 진행률 표시 위치:** StatsGrid 바로 아래 vs 추천 섹션 위. 정보 탐색 흐름(전체 현황 파악 -> 구체적 추천)을 고려하면 StatsGrid 직후가 적합해 보이나, 페이지가 길어지는 단점.

4. **프롬프트 복사의 toolSlug 전달:** 현재 프롬프트 복사 버튼이 어떤 컴포넌트에 있고, 해당 상황의 primary tool 정보에 접근 가능한지 확인 필요. 접근 불가한 경우 상황 slug로부터 runtime에 primary tool을 조회해야 함.

---

## Out of Scope

- **Supabase 연동 / 크로스 디바이스 동기화:** 이번 사이클은 localStorage only. Phase 3 후반 또는 Phase 4에서 도입.
- **리더보드 / 소셜 기능:** PRD에서 Phase 4 이후로 제외.
- **AI 기반 개인화 추천:** 현재는 규칙 기반 스코어링. LLM 기반 추천은 백엔드 필요.
- **학습 캘린더 / 히트맵:** GitHub 기여 그래프 스타일의 캘린더는 Could-have에서도 제외 (복잡도 대비 가치 낮음).
- **도구별 퀴즈 / 실력 측정:** 별도 feature로 분리 (seo-content 또는 별도 스펙).
- **새 업적 추가:** "ChatGPT 달인", "멀티 도구 마스터" 등 숙련도 기반 업적은 Could-have 수준. 이번 사이클에서는 기존 5개 업적 유지.
