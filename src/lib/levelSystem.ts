/**
 * AI 레벨업 시스템
 * 사용자의 AI 학습 진도를 추적하고 레벨을 관리합니다.
 */

export interface UserProgress {
  completedSituations: string[]; // 완료한 상황 slug 목록
  completedSteps: Record<string, number[]>; // 상황별 완료한 스텝 번호
  totalXp: number;
  currentLevel: number;
  lastVisit: string; // ISO date string
  isOnboarded: boolean;
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
  situationView: 5, // 상황 가이드 열람
  stepComplete: 10, // 스텝 1개 완료
  situationComplete: 30, // 상황 전체 완료
  firstVisit: 10, // 첫 방문
};

// 초기 상태
const DEFAULT_PROGRESS: UserProgress = {
  completedSituations: [],
  completedSteps: {},
  totalXp: 0,
  currentLevel: 1,
  lastVisit: new Date().toISOString(),
  isOnboarded: false,
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
