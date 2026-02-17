/**
 * AI 레벨업 시스템
 * 사용자의 AI 학습 진도를 추적하고 레벨을 관리합니다.
 */

// --- Achievement Types ---

export type AchievementId =
  | 'first-step'
  | 'habit-forming'
  | 'ai-explorer'
  | 'expert-path'
  | 'prompt-master';

export type Achievement = {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  condition: string;
};

export type EarnedAchievement = {
  id: AchievementId;
  earnedAt: string;
};

export type DailyActivity = {
  date: string;
  stepsCompleted: number;
  xpEarned: number;
};

export type SituationCompletion = {
  slug: string;
  completedAt: string;
};

// --- Achievement Definitions ---

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

// --- User Progress ---

export interface UserProgress {
  // 기존 필드
  completedSituations: string[];
  completedSteps: Record<string, number[]>;
  totalXp: number;
  currentLevel: number;
  lastVisit: string;
  isOnboarded: boolean;
  // 신규 필드
  achievements: EarnedAchievement[];
  dailyActivities: DailyActivity[];
  situationCompletions: SituationCompletion[];
  toolsUsed: string[];
  promptCopyCount: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
}

export interface LevelInfo {
  level: number;
  title: string;
  icon: string;
  minXp: number;
  maxXp: number;
  description: string;
}

// 레벨 정의
export const LEVELS: LevelInfo[] = [
  { level: 1, title: 'AI 새싹', icon: '🌱', minXp: 0, maxXp: 100, description: 'AI 여정을 시작했어요!' },
  { level: 2, title: 'AI 탐험가', icon: '🔍', minXp: 100, maxXp: 300, description: 'AI 도구들을 탐험하고 있어요' },
  { level: 3, title: 'AI 실험가', icon: '🧪', minXp: 300, maxXp: 600, description: '다양한 AI를 직접 사용해보고 있어요' },
  { level: 4, title: 'AI 숙련자', icon: '⚡', minXp: 600, maxXp: 1000, description: 'AI 사용이 익숙해졌어요' },
  { level: 5, title: 'AI 마스터', icon: '🏆', minXp: 1000, maxXp: Infinity, description: 'AI를 자유자재로 활용해요' },
];

// XP 보상 정의
export const XP_REWARDS = {
  situationView: 5,
  stepComplete: 10,
  situationComplete: 30,
  firstVisit: 10,
  streakBonus3: 5,
  streakBonus7: 10,
  streakBonus30: 20,
};

// 초기 상태
const DEFAULT_PROGRESS: UserProgress = {
  completedSituations: [],
  completedSteps: {},
  totalXp: 0,
  currentLevel: 1,
  lastVisit: new Date().toISOString(),
  isOnboarded: false,
  achievements: [],
  dailyActivities: [],
  situationCompletions: [],
  toolsUsed: [],
  promptCopyCount: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: '',
};

const STORAGE_KEY = 'ai-guide-progress';

/**
 * 로컬스토리지에서 진도 로드
 */
export function loadProgress(): UserProgress {
  if (typeof window === 'undefined') {
    return DEFAULT_PROGRESS;
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as UserProgress;
      // 마이그레이션: 새 필드가 없으면 기본값 추가
      return {
        ...DEFAULT_PROGRESS,
        ...parsed,
      };
    }
  } catch (error) {
    console.error('진도 로드 실패:', error);
  }

  return DEFAULT_PROGRESS;
}

/**
 * 로컬스토리지에 진도 저장
 */
export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('진도 저장 실패:', error);
  }
}

/**
 * XP로 레벨 계산
 */
export function calculateLevel(xp: number): number {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) {
      return LEVELS[i].level;
    }
  }
  return 1;
}

/**
 * 현재 레벨 정보 가져오기
 */
export function getLevelInfo(level: number): LevelInfo {
  return LEVELS.find((l) => l.level === level) || LEVELS[0];
}

/**
 * 다음 레벨까지 필요한 XP 계산
 */
export function getXpToNextLevel(currentXp: number): { current: number; needed: number; progress: number } {
  const currentLevel = calculateLevel(currentXp);
  const currentLevelInfo = getLevelInfo(currentLevel);
  const nextLevelInfo = getLevelInfo(currentLevel + 1);

  if (currentLevel >= LEVELS.length) {
    return { current: currentXp, needed: 0, progress: 100 };
  }

  const xpInCurrentLevel = currentXp - currentLevelInfo.minXp;
  const xpNeededForLevel = nextLevelInfo.minXp - currentLevelInfo.minXp;
  const progress = Math.min((xpInCurrentLevel / xpNeededForLevel) * 100, 100);

  return {
    current: xpInCurrentLevel,
    needed: xpNeededForLevel,
    progress,
  };
}

/**
 * 스텝 완료 처리
 */
export function completeStep(
  progress: UserProgress,
  situationSlug: string,
  stepOrder: number,
  totalSteps: number
): UserProgress {
  const completedSteps = { ...progress.completedSteps };
  const situationSteps = completedSteps[situationSlug] || [];

  // 이미 완료한 스텝이면 무시
  if (situationSteps.includes(stepOrder)) {
    return progress;
  }

  // 스텝 완료 추가
  completedSteps[situationSlug] = [...situationSteps, stepOrder];
  let newXp = progress.totalXp + XP_REWARDS.stepComplete;

  // 모든 스텝 완료 시 보너스
  const newCompletedSituations = [...progress.completedSituations];
  if (completedSteps[situationSlug].length === totalSteps) {
    if (!newCompletedSituations.includes(situationSlug)) {
      newCompletedSituations.push(situationSlug);
      newXp += XP_REWARDS.situationComplete;
    }
  }

  const newLevel = calculateLevel(newXp);

  return {
    ...progress,
    completedSteps,
    completedSituations: newCompletedSituations,
    totalXp: newXp,
    currentLevel: newLevel,
    lastVisit: new Date().toISOString(),
  };
}

/**
 * 상황 열람 XP 추가
 */
export function addViewXp(progress: UserProgress): UserProgress {
  const newXp = progress.totalXp + XP_REWARDS.situationView;
  const newLevel = calculateLevel(newXp);

  return {
    ...progress,
    totalXp: newXp,
    currentLevel: newLevel,
    lastVisit: new Date().toISOString(),
  };
}

/**
 * 온보딩 완료 처리
 */
export function completeOnboarding(progress: UserProgress): UserProgress {
  if (progress.isOnboarded) {
    return progress;
  }

  const newXp = progress.totalXp + XP_REWARDS.firstVisit;
  const newLevel = calculateLevel(newXp);

  return {
    ...progress,
    isOnboarded: true,
    totalXp: newXp,
    currentLevel: newLevel,
    lastVisit: new Date().toISOString(),
  };
}

/**
 * 진도 초기화 (개발/테스트용)
 */
export function resetProgress(): UserProgress {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  return DEFAULT_PROGRESS;
}
