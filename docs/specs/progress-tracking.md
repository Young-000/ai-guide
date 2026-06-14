# Progress Tracking System Enhancement

> **Feature:** `/my-progress` 페이지 + 업적 시스템 + 스트릭 + 스마트 추천
> **Status:** Draft | **작성일:** 2026-02-17 | **사이클:** Phase 2, Cycle 9
> **의존성:** 기존 levelSystem.ts, progress.ts, LevelBadge.tsx

---

## JTBD

**When** AI 활용을 시작해서 몇 개 가이드를 완료했을 때,
**I want to** 내가 어디까지 배웠는지, 다음에 뭘 해야 하는지 한눈에 확인하고,
**so I can** 동기를 잃지 않고 꾸준히 AI 활용 능력을 키워나갈 수 있다.

---

## Problem

- **Who:** 가이드를 1개 이상 완료한 재방문 사용자 (페르소나 1: 김지영, 페르소나 2: 박민수)
- **Pain:** 가이드를 완료해도 "그래서 다음에 뭘 해야 하지?"가 불명확하고, 자신의 성장을 체감할 수 없어 재방문 동기가 약함 (빈도: 매 방문, 심각도: 높음 -- 리텐션 직결)
- **Current workaround:** 없음. 헤더의 작은 레벨 뱃지만 존재. 완료 기록은 localStorage에 있지만 사용자에게 보여주는 전용 화면 없음.
- **Success metric:**
  - 7일 내 재방문율 15% -> 25% (PRD KPI #7)
  - 가이드 완료율 50% -> 65% (PRD KPI #6)
  - `/my-progress` 페이지 주간 방문 횟수/사용자 >= 2회

---

## Solution

### Overview

사용자의 전체 학습 여정을 시각화하는 `/my-progress` 전용 페이지를 신설하고, 기존 레벨/XP 시스템 위에 **업적(Achievement)**, **스트릭(Streak)**, **스마트 추천(Smart Recommendations)** 3가지 게이미피케이션 레이어를 추가한다.

모든 데이터는 localStorage에 저장한다 (Supabase는 Phase 3). 기존 `UserProgress` 타입을 확장하되, 이전 데이터와 하위 호환성을 유지한다 (`loadProgress`의 기존 마이그레이션 패턴 활용).

### User Flow

```
[Header 레벨 뱃지 클릭] or [Header '내 학습' 링크]
  → /my-progress 페이지
    ├─ 레벨 + XP 프로그레스 바 (히어로 영역)
    ├─ 통계 요약 카드 (완료 상황, 도전한 도구, 활동 일수, 스트릭)
    ├─ 스마트 추천 섹션 ("다음에 도전해보세요")
    ├─ 업적 그리드 (획득/잠김 뱃지)
    └─ 완료한 상황 타임라인 (최근순)

[가이드 완료 시]
  → 업적 조건 체크
    → [조건 충족] → Toast 알림 "🏆 업적 달성! '첫 발걸음'"
    → XP 보너스 지급

[매일 스텝 1개 이상 완료]
  → 스트릭 +1
  → 보너스 XP (스트릭 길이에 비례)
  → Header에 스트릭 카운터 표시
```

### Scope (MoSCoW)

**Must:**
- `/my-progress` 페이지 (레벨+XP 바, 통계 카드, 완료 목록, 추천)
- 업적 시스템 5개 (정의 + 잠금 해제 로직 + 뱃지 UI)
- 업적 달성 시 Toast 알림
- 스트릭 추적 (일별 활동 기록, 연속 일수 계산)
- Header에 스트릭 카운터 표시
- 스마트 추천 (미완료 상황 기반, 난이도 순차 고려)
- `UserProgress` 타입 확장 (하위 호환)

**Should:**
- 스트릭 보너스 XP (연속 3일: +5 XP, 7일: +10 XP, 30일: +20 XP)
- 도구 다양성 추천 (이미 시도한 도구 외 다른 도구 추천)
- 완료한 상황에 완료 날짜 표시
- 빈 상태(empty state) 디자인 (아직 아무것도 완료하지 않은 사용자)
- `/my-progress` 링크를 상황 완료 축하 메시지에 추가

**Could:**
- 레벨업 시 축하 애니메이션 (confetti)
- 카테고리별 진행률 시각화 (레이더 차트 또는 프로그레스 바)
- 주간 활동 요약 ("이번 주: 3개 상황 완료, 80 XP 획득")
- 프롬프트 복사 횟수 추적 (업적 "프롬프트 마스터" 용)

**Won't (this cycle):**
- Supabase 연동 / 크로스 디바이스 동기화 (Phase 3)
- 리더보드 / 소셜 공유 (PRD에서 명시적으로 제외)
- 주간 리포트 이메일 (Phase 3)
- 커스텀 업적 / 사용자 생성 목표

---

## Data Model

### 확장된 UserProgress 타입

```typescript
// src/lib/levelSystem.ts 에 추가/확장

export type AchievementId =
  | 'first-step'        // 첫 발걸음: 첫 상황 완료
  | 'habit-forming'     // 습관 형성: 3일 연속 스트릭
  | 'ai-explorer'       // AI 탐험가: 3개 이상의 다른 도구 사용
  | 'expert-path'       // 전문가의 길: 10개 상황 완료
  | 'prompt-master';    // 프롬프트 마스터: 프롬프트 10회 복사

export type Achievement = {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  condition: string; // 사용자에게 보여줄 조건 설명
};

export type EarnedAchievement = {
  id: AchievementId;
  earnedAt: string; // ISO date string
};

export type DailyActivity = {
  date: string; // 'YYYY-MM-DD' 형식
  stepsCompleted: number;
  xpEarned: number;
};

export type SituationCompletion = {
  slug: string;
  completedAt: string; // ISO date string
};

// 기존 UserProgress 확장
export type UserProgress = {
  // --- 기존 필드 (변경 없음) ---
  completedSituations: string[];
  completedSteps: Record<string, number[]>;
  totalXp: number;
  currentLevel: number;
  lastVisit: string;
  isOnboarded: boolean;

  // --- 신규 필드 ---
  achievements: EarnedAchievement[];       // 획득한 업적 목록
  dailyActivities: DailyActivity[];        // 일별 활동 기록 (최근 90일)
  situationCompletions: SituationCompletion[]; // 상황별 완료 타임스탬프
  toolsUsed: string[];                     // 시도한 도구 slug 목록
  promptCopyCount: number;                 // 프롬프트 복사 횟수
  currentStreak: number;                   // 현재 연속 스트릭 (일)
  longestStreak: number;                   // 최장 스트릭 기록
  lastActiveDate: string;                  // 마지막 활동 날짜 ('YYYY-MM-DD')
};
```

### DEFAULT_PROGRESS 확장

```typescript
const DEFAULT_PROGRESS: UserProgress = {
  // 기존
  completedSituations: [],
  completedSteps: {},
  totalXp: 0,
  currentLevel: 1,
  lastVisit: new Date().toISOString(),
  isOnboarded: false,
  // 신규
  achievements: [],
  dailyActivities: [],
  situationCompletions: [],
  toolsUsed: [],
  promptCopyCount: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: '',
};
```

### 하위 호환성

기존 `loadProgress()`의 `{ ...DEFAULT_PROGRESS, ...parsed }` 패턴이 신규 필드에 대해 기본값을 자동 적용하므로, 기존 사용자 데이터가 그대로 마이그레이션된다. 추가적인 마이그레이션 로직 불필요.

### 업적 정의 (상수 데이터)

```typescript
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-step',
    title: '첫 발걸음',
    description: '첫 번째 상황 가이드를 완료했어요!',
    icon: '👣',
    xpReward: 20,
    condition: '상황 가이드 1개 완료',
  },
  {
    id: 'habit-forming',
    title: '습관 형성',
    description: '3일 연속으로 학습했어요!',
    icon: '🔥',
    xpReward: 30,
    condition: '3일 연속 스트릭 달성',
  },
  {
    id: 'ai-explorer',
    title: 'AI 탐험가',
    description: '3가지 이상의 AI 도구를 경험했어요!',
    icon: '🧭',
    xpReward: 25,
    condition: '3개 이상 도구 사용',
  },
  {
    id: 'expert-path',
    title: '전문가의 길',
    description: '10개 상황 가이드를 완료한 진정한 전문가!',
    icon: '🎓',
    xpReward: 100,
    condition: '상황 가이드 10개 완료',
  },
  {
    id: 'prompt-master',
    title: '프롬프트 마스터',
    description: '프롬프트를 10번 이상 복사해서 활용했어요!',
    icon: '✨',
    xpReward: 30,
    condition: '프롬프트 10회 복사',
  },
];
```

### XP 보상 확장

```typescript
export const XP_REWARDS = {
  // 기존
  situationView: 5,
  stepComplete: 10,
  situationComplete: 30,
  firstVisit: 10,
  // 신규
  streakBonus3: 5,      // 3일 연속 보너스
  streakBonus7: 10,     // 7일 연속 보너스
  streakBonus30: 20,    // 30일 연속 보너스
  achievementBase: 0,   // 업적별 xpReward로 관리 (Achievement.xpReward)
};
```

---

## Component Design

### 1. `/my-progress` 페이지 (`src/app/my-progress/page.tsx`)

```
+──────────────────────────────────────────+
│  [Hero: Level Card]                       │
│  ┌──────────────────────────────────┐     │
│  │ 🧪 Lv.3 AI 실험가                │     │
│  │ ████████████░░░░  320/600 XP     │     │
│  │ "다양한 AI를 직접 사용해보고 있어요" │     │
│  └──────────────────────────────────┘     │
│                                           │
│  [Stats Cards - 4-grid]                   │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐             │
│  │ 5  │ │ 18 │ │ 4  │ │ 🔥3│             │
│  │완료│ │스텝│ │도구│ │연속│             │
│  └────┘ └────┘ └────┘ └────┘             │
│                                           │
│  [Smart Recommendations]                  │
│  "다음에 도전해보세요"                      │
│  ┌─────────────────┐ ┌──────────────┐     │
│  │ 📊 데이터 분석   │ │ 🎨 UI 디자인 │     │
│  │ 중급 · 15분      │ │ 중급 · 20분  │     │
│  │ [시작하기]        │ │ [시작하기]    │     │
│  └─────────────────┘ └──────────────┘     │
│                                           │
│  [Achievements Grid]                      │
│  "업적"                                    │
│  👣 🔥 🧭 🔒 🔒                           │
│  첫  습관 AI  전문 프롬                    │
│  발걸 형성 탐험 가의 프트                   │
│  음       가  길  마스터                   │
│                                           │
│  [Completed Timeline]                     │
│  "완료한 가이드"                           │
│  ── 2/17 ── 📄 PDF 문서 빠르게 요약하기    │
│  ── 2/16 ── 📧 비즈니스 이메일 작성하기     │
│  ── 2/15 ── 📊 발표 자료 만들기            │
+──────────────────────────────────────────+
```

**서브컴포넌트:**
- `ProgressHero` -- 레벨 카드 + XP 바 (대형 버전)
- `StatsGrid` -- 4개 통계 카드
- `SmartRecommendations` -- 추천 상황 카드 2~3개
- `AchievementsGrid` -- 업적 뱃지 그리드 (획득/잠김)
- `CompletionTimeline` -- 완료 상황 시간순 리스트

### 2. StreakCounter (`src/components/StreakCounter.tsx`)

Header에 표시되는 소형 스트릭 카운터.

```
🔥 3  (스트릭 있을 때)
      (스트릭 없을 때: 비표시)
```

- 스트릭이 0이면 렌더링하지 않음
- 클릭 시 `/my-progress`로 이동

### 3. AchievementToast (`src/components/AchievementToast.tsx`)

업적 달성 시 화면 하단에 3초간 표시되는 Toast 알림.

```
┌───────────────────────────────────┐
│ 🏆 업적 달성!                      │
│ 👣 첫 발걸음 — +20 XP             │
└───────────────────────────────────┘
```

- 3초 후 자동 사라짐 (fade-out 애니메이션)
- 동시에 여러 업적 달성 시 큐로 순차 표시

### 4. AchievementBadge (`src/components/AchievementBadge.tsx`)

업적 그리드에 사용되는 단일 뱃지 컴포넌트.

- 획득 상태: 컬러 아이콘 + 제목
- 잠김 상태: 그레이스케일 + 자물쇠 + 조건 툴팁

---

## Core Logic

### 스트릭 계산 로직

```typescript
// src/lib/streakSystem.ts

/**
 * 오늘 날짜를 'YYYY-MM-DD' 형식으로 반환 (한국 시간)
 */
function getToday(): string {
  return new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    timeZone: 'Asia/Seoul',
  }).replace(/\. /g, '-').replace('.', '');
  // 또는 Intl.DateTimeFormat 활용
}

/**
 * 스트릭 업데이트
 * - 오늘 첫 활동이면 스트릭 +1 (어제 활동이 있었을 때) 또는 리셋
 * - 이미 오늘 활동했으면 변경 없음
 */
function updateStreak(progress: UserProgress): UserProgress {
  const today = getToday();

  if (progress.lastActiveDate === today) {
    return progress; // 이미 오늘 활동함
  }

  const yesterday = getYesterday(); // 어제 날짜 계산

  let newStreak: number;
  if (progress.lastActiveDate === yesterday) {
    newStreak = progress.currentStreak + 1; // 연속!
  } else {
    newStreak = 1; // 리셋 (오늘부터 새로 시작)
  }

  return {
    ...progress,
    currentStreak: newStreak,
    longestStreak: Math.max(progress.longestStreak, newStreak),
    lastActiveDate: today,
  };
}
```

**Edge Cases:**
- 자정 전후 활동: KST (Asia/Seoul) 기준으로 날짜 판단
- 하루 건너뛰면 스트릭 1로 리셋
- 첫 활동이면 스트릭 1로 시작

### 업적 체크 로직

```typescript
// src/lib/achievementSystem.ts

type AchievementChecker = (progress: UserProgress) => boolean;

const ACHIEVEMENT_CHECKERS: Record<AchievementId, AchievementChecker> = {
  'first-step': (p) => p.completedSituations.length >= 1,
  'habit-forming': (p) => p.currentStreak >= 3,
  'ai-explorer': (p) => p.toolsUsed.length >= 3,
  'expert-path': (p) => p.completedSituations.length >= 10,
  'prompt-master': (p) => p.promptCopyCount >= 10,
};

/**
 * 진행 상태 업데이트 후 새로 달성된 업적 확인
 * @returns 새로 달성된 업적 ID 배열
 */
function checkNewAchievements(progress: UserProgress): AchievementId[] {
  const earnedIds = new Set(progress.achievements.map(a => a.id));
  const newAchievements: AchievementId[] = [];

  for (const [id, checker] of Object.entries(ACHIEVEMENT_CHECKERS)) {
    if (!earnedIds.has(id as AchievementId) && checker(progress)) {
      newAchievements.push(id as AchievementId);
    }
  }

  return newAchievements;
}
```

**통합 포인트:**
- `ProgressManager.markStepComplete()` 후에 `checkNewAchievements()` 호출
- 새 업적이 있으면 `progress.achievements`에 추가 + XP 보너스 + Toast 발행

### 스마트 추천 로직

```typescript
// src/lib/recommendations.ts

type RecommendedSituation = {
  situation: Situation;
  reason: string;
  score: number;
};

/**
 * 사용자에게 다음으로 추천할 상황 2~3개 반환
 *
 * 점수 기준:
 * 1. 난이도 순차 (easy 미완료 우선 → medium → hard)
 * 2. 카테고리 다양성 (아직 안 해본 카테고리 가중치)
 * 3. 도구 다양성 (아직 안 써본 도구가 primary인 상황 가중치)
 * 4. 우선도(priority) 높은 상황 가중치
 */
function getRecommendations(
  progress: UserProgress,
  allSituations: Situation[],
  count?: number, // default 3
): RecommendedSituation[];
```

**추천 우선순위 규칙:**
1. 이미 완료한 상황 제외
2. easy 난이도 중 미완료가 있으면 우선 추천 (초보자는 easy부터)
3. 사용자가 아직 시도하지 않은 카테고리의 상황 가중치 +2
4. 사용자가 아직 써보지 않은 도구가 primary인 상황 가중치 +1
5. `priority` 값이 낮을수록(높은 우선도) 가중치 +1
6. 상위 `count`개 반환, 각각에 추천 이유 문자열 포함

### 도구 사용 추적

상황 가이드를 시작하면(스텝 1 완료 시) 해당 상황의 `recommendedTools` 중 `isPrimary: true`인 도구의 slug를 `toolsUsed`에 추가한다.

```typescript
// completeStep 내부에 추가
if (stepOrder === 1) {
  const situation = findSituation(situationSlug);
  const primaryTool = situation?.recommendedTools.find(t => t.isPrimary);
  if (primaryTool && !progress.toolsUsed.includes(primaryTool.slug)) {
    progress.toolsUsed = [...progress.toolsUsed, primaryTool.slug];
  }
}
```

### 프롬프트 복사 추적

기존 프롬프트 복사 버튼 클릭 시 `promptCopyCount`를 +1 증가시킨다.

```typescript
// ProgressManager에 새 메서드 추가
trackPromptCopy(): void {
  this.progress = {
    ...this.progress,
    promptCopyCount: this.progress.promptCopyCount + 1,
  };
  // 업적 체크
  const newAchievements = checkNewAchievements(this.progress);
  // ... 업적 처리
  this.save();
  this.notifyListeners();
}
```

---

## Integration Points

### Header 변경

1. LevelBadge를 클릭하면 `/my-progress`로 이동하도록 `<Link>` 래핑
2. StreakCounter 컴포넌트 추가 (LevelBadge 옆)
3. "내 학습" 텍스트 링크 추가 (모바일에서는 아이콘만)

### ProgressStepper 변경

1. 스텝 완료 시 스트릭 업데이트 호출
2. 스텝 완료 시 업적 체크 + Toast 발행
3. 전체 완료 축하 메시지에 `/my-progress` 링크 추가

### GuidePanel / 프롬프트 복사 버튼

1. 프롬프트 복사 시 `ProgressManager.trackPromptCopy()` 호출

### 랜딩 페이지 (재방문 사용자)

1. `ReturningUserBanner` 또는 `PopularSituationsSection` 내에 스마트 추천 표시 (Could-have)

---

## Acceptance Criteria

### /my-progress 페이지

- [ ] **AC-1:** Given 사용자가 3개 상황을 완료했을 때, When `/my-progress`에 접속하면, Then 현재 레벨, XP 프로그레스 바(다음 레벨까지 %), 통계(완료 3개, 스텝 수, 도구 수, 스트릭), 완료한 3개 상황의 타임라인이 표시된다.

- [ ] **AC-2:** Given 사용자가 아직 아무 상황도 완료하지 않았을 때, When `/my-progress`에 접속하면, Then 빈 상태 UI가 표시되고 "첫 가이드 시작하기" CTA 버튼이 `/situations`로 연결된다.

- [ ] **AC-3:** Given 사용자가 19개 중 5개 상황을 완료했을 때, When `/my-progress`에 접속하면, Then "다음에 도전해보세요" 섹션에 미완료 상황 중 2~3개가 추천 이유와 함께 표시된다.

- [ ] **AC-4:** Given 페이지를 새로고침하거나 재방문했을 때, When `/my-progress`에 접속하면, Then localStorage에서 모든 데이터가 정확하게 복원된다.

### 업적 시스템

- [ ] **AC-5:** Given 사용자가 첫 번째 상황을 막 완료했을 때, When 상황 완료가 처리되면, Then "첫 발걸음" 업적이 해제되고 Toast 알림이 표시되며 20 XP가 추가된다.

- [ ] **AC-6:** Given 사용자가 이미 "첫 발걸음" 업적을 보유한 상태에서, When 또 다른 상황을 완료하면, Then "첫 발걸음" 업적이 중복 지급되지 않고, Toast도 표시되지 않는다.

- [ ] **AC-7:** Given `/my-progress` 페이지에서, When 업적 그리드를 볼 때, Then 획득한 업적은 컬러 아이콘 + 획득일자로, 미획득 업적은 잠김(그레이) 상태 + 달성 조건으로 표시된다.

- [ ] **AC-8:** Given 사용자가 3개 다른 도구의 상황을 각각 시작(스텝 1 완료)했을 때, When 세 번째 도구의 스텝 1을 완료하면, Then "AI 탐험가" 업적이 해제되고 Toast + 25 XP가 지급된다.

### 스트릭 시스템

- [ ] **AC-9:** Given 사용자가 어제와 오늘 각각 1개 이상의 스텝을 완료했을 때, When 오늘의 첫 스텝을 완료하면, Then `currentStreak`이 2가 된다.

- [ ] **AC-10:** Given 사용자가 이틀 전에 마지막 활동을 했을 때, When 오늘 스텝을 완료하면, Then `currentStreak`이 1로 리셋된다 (하루 건너뜀).

- [ ] **AC-11:** Given 사용자의 currentStreak이 3 이상일 때, When Header를 보면, Then 스트릭 카운터가 불꽃 아이콘 + 숫자로 표시된다.

- [ ] **AC-12:** Given 사용자의 currentStreak이 0일 때, When Header를 보면, Then 스트릭 카운터가 표시되지 않는다.

### 스마트 추천

- [ ] **AC-13:** Given 사용자가 easy 난이도만 완료했을 때, When 추천을 받으면, Then 남은 easy가 있으면 easy 우선, 없으면 medium 상황이 추천된다.

- [ ] **AC-14:** Given 사용자가 'work' 카테고리 상황만 완료했을 때, When 추천을 받으면, Then 다른 카테고리(study, coding 등)의 상황이 우선 추천된다.

- [ ] **AC-15:** Given 모든 상황을 완료한 사용자가 `/my-progress`에 접속하면, When 추천 섹션을 보면, Then "모든 가이드를 완료했어요!" 축하 메시지가 표시된다.

### 하위 호환

- [ ] **AC-16:** Given 기존 사용자가 신규 필드 없이 localStorage에 데이터가 있을 때, When 업데이트된 앱에 접속하면, Then 기존 데이터(XP, 레벨, 완료 상황)가 보존되고 신규 필드는 기본값으로 초기화된다.

### Header 통합

- [ ] **AC-17:** Given 온보딩을 완료한 사용자일 때, When Header의 레벨 뱃지를 클릭하면, Then `/my-progress` 페이지로 이동한다.

---

## Task Breakdown

### 1단계: 데이터 모델 확장

| # | Task | Complexity | Dependencies |
|---|------|-----------|-------------|
| 1 | `UserProgress` 타입 확장 + `DEFAULT_PROGRESS` 업데이트 (levelSystem.ts) | S | none |
| 2 | `ACHIEVEMENTS` 상수 + `AchievementId` 타입 정의 (levelSystem.ts) | S | 1 |
| 3 | `XP_REWARDS` 확장 (스트릭 보너스) | S | 1 |

### 2단계: 핵심 로직

| # | Task | Complexity | Dependencies |
|---|------|-----------|-------------|
| 4 | 스트릭 계산 로직 (`src/lib/streakSystem.ts`): `getToday`, `updateStreak` | M | 1 |
| 5 | 업적 체크 로직 (`src/lib/achievementSystem.ts`): `checkNewAchievements` | M | 2 |
| 6 | 스마트 추천 로직 (`src/lib/recommendations.ts`): `getRecommendations` | M | 1 |
| 7 | `ProgressManager` 확장: `trackPromptCopy`, 스트릭 통합, 업적 통합 | M | 4, 5 |

### 3단계: UI 컴포넌트

| # | Task | Complexity | Dependencies |
|---|------|-----------|-------------|
| 8 | `AchievementBadge` 컴포넌트 (획득/잠김 상태) | S | 2 |
| 9 | `AchievementToast` 컴포넌트 (알림 + 자동 사라짐) | S | 5 |
| 10 | `StreakCounter` 컴포넌트 (Header용) | S | 4 |
| 11 | `ProgressHero` 컴포넌트 (레벨 + XP 대형 바) | S | 1 |
| 12 | `StatsGrid` 컴포넌트 (4개 통계 카드) | S | 1 |
| 13 | `SmartRecommendations` 컴포넌트 (추천 카드 목록) | M | 6 |
| 14 | `AchievementsGrid` 컴포넌트 (업적 목록) | S | 8 |
| 15 | `CompletionTimeline` 컴포넌트 (완료 상황 타임라인) | S | 1 |

### 4단계: 페이지 조립 + 통합

| # | Task | Complexity | Dependencies |
|---|------|-----------|-------------|
| 16 | `/my-progress` 페이지 조립 (page.tsx + 빈 상태 + 전체 완료 상태) | M | 11~15 |
| 17 | Header에 StreakCounter + LevelBadge 링크 + "내 학습" 링크 추가 | S | 10 |
| 18 | ProgressStepper에 스트릭/업적/도구추적 통합 | M | 7 |
| 19 | 프롬프트 복사 버튼에 `trackPromptCopy` 연결 | S | 7 |

### 5단계: 테스트

| # | Task | Complexity | Dependencies |
|---|------|-----------|-------------|
| 20 | 스트릭 계산 유닛 테스트 (연속, 리셋, edge cases) | M | 4 |
| 21 | 업적 체크 유닛 테스트 (각 업적별 조건, 중복 방지) | M | 5 |
| 22 | 추천 로직 유닛 테스트 (난이도 순차, 카테고리 다양성) | M | 6 |
| 23 | 하위 호환 테스트 (기존 데이터 마이그레이션) | S | 1 |
| 24 | `/my-progress` 페이지 통합 테스트 (빈 상태, 정상 상태, 전체 완료) | M | 16 |

**총 예상: 24 tasks, ~16시간 작업량**

---

## GA4 이벤트 추적

```typescript
const PROGRESS_EVENTS = {
  'progress_page_view': {},
  'achievement_earned': { achievement_id: string, achievement_title: string },
  'streak_updated': { streak_count: number, is_new_record: boolean },
  'recommendation_click': { situation_slug: string, recommendation_rank: number },
  'progress_stats_view': { total_completed: number, current_level: number },
};
```

---

## Open Questions

1. **프롬프트 복사 추적 시점:** 현재 프롬프트 복사 버튼이 어떤 컴포넌트에 있는가? GuidePanel 내부인지, situation-detail 페이지인지 확인 필요. (확인 결과: situation-detail 페이지 내 프롬프트 섹션에 복사 버튼 존재)
2. **dailyActivities 보관 기간:** 90일로 제한할지, 무제한으로 할지. localStorage 용량(~5MB) 고려 시 90일이 안전.
3. **Toast 구현 방식:** 전역 Toast 시스템이 있는가? 없으면 간단한 portal 기반 Toast 컴포넌트 신규 생성 필요.
4. **스트릭 보너스 XP 시점:** 스트릭 3일 도달 시점에 1회 지급? 매일 보너스 XP 누적?
   - **제안:** 3일, 7일, 30일 도달 시점에 각 1회 지급 (업적과 유사한 방식).

---

## Out of Scope

- **Supabase 연동:** Phase 3에서 도입 예정. 이번 사이클은 localStorage만.
- **리더보드/랭킹:** PRD에서 Phase 4 이후로 명시적 제외.
- **소셜 공유:** PRD에서 Phase 4 이후로 명시적 제외.
- **주간 리포트 이메일:** 사용자 계정 없이 불가. Phase 3.
- **커스텀 업적 생성:** 복잡도 대비 가치 낮음. 향후 검토.
- **오프라인 지원/PWA 캐싱:** 별도 스펙 필요.
