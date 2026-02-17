/**
 * 진도 관리 로직
 * React Context와 함께 사용할 수 있는 진도 관리 헬퍼 함수들
 */

import {
  loadProgress,
  saveProgress,
  completeStep,
  completeOnboarding,
  calculateLevel,
  ACHIEVEMENTS,
  type UserProgress,
  type AchievementId,
} from './levelSystem';
import { updateStreak, recordDailyActivity } from './streakSystem';
import { checkNewAchievements, applyAchievements } from './achievementSystem';
import situationsData from '@/data/situations.json';
import type { Situation } from '@/types';

const allSituations = situationsData.situations as Situation[];

export type AchievementEvent = {
  id: AchievementId;
  title: string;
  icon: string;
  xpReward: number;
};

type AchievementListener = (achievements: AchievementEvent[]) => void;

/**
 * 진도 관리자 클래스
 * 상태 변경을 추적하고 자동 저장을 처리합니다.
 */
export class ProgressManager {
  private progress: UserProgress;
  private listeners: Set<(progress: UserProgress) => void> = new Set();
  private achievementListeners: Set<AchievementListener> = new Set();

  constructor() {
    this.progress = loadProgress();
  }

  /**
   * 현재 진도 가져오기
   */
  getProgress(): UserProgress {
    return this.progress;
  }

  /**
   * 스텝 완료 처리
   */
  markStepComplete(situationSlug: string, stepOrder: number, totalSteps: number): void {
    const prevCompleted = [...this.progress.completedSituations];
    this.progress = completeStep(this.progress, situationSlug, stepOrder, totalSteps);

    // 스트릭 업데이트
    this.progress = updateStreak(this.progress);

    // 일별 활동 기록
    this.progress = recordDailyActivity(this.progress, 1, 10);

    // 도구 사용 추적 (스텝 1 완료 시)
    if (stepOrder === 1) {
      const situation = allSituations.find((s) => s.slug === situationSlug);
      const primaryTool = situation?.recommendedTools.find((t) => t.isPrimary);
      if (primaryTool && !this.progress.toolsUsed.includes(primaryTool.slug)) {
        const today = new Date().toISOString().split('T')[0] ?? '';
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

    // 상황 완료 추적 (새로 완료된 경우)
    const newlyCompleted = this.progress.completedSituations.filter(
      (slug) => !prevCompleted.includes(slug),
    );
    if (newlyCompleted.length > 0) {
      const now = new Date().toISOString();
      this.progress = {
        ...this.progress,
        situationCompletions: [
          ...this.progress.situationCompletions,
          ...newlyCompleted.map((slug) => ({ slug, completedAt: now })),
        ],
      };
    }

    // 업적 체크
    this.checkAndApplyAchievements();

    this.save();
    this.notifyListeners();
  }

  /**
   * 온보딩 완료 처리
   */
  markOnboardingComplete(): void {
    this.progress = completeOnboarding(this.progress);
    this.save();
    this.notifyListeners();
  }

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

    // 업적 체크
    this.checkAndApplyAchievements();

    this.save();
    this.notifyListeners();
  }

  /**
   * 특정 상황의 완료된 스텝 가져오기
   */
  getCompletedSteps(situationSlug: string): number[] {
    return this.progress.completedSteps[situationSlug] || [];
  }

  /**
   * 상황이 완료되었는지 확인
   */
  isSituationCompleted(situationSlug: string): boolean {
    return this.progress.completedSituations.includes(situationSlug);
  }

  /**
   * 변경 감지 리스너 등록
   */
  subscribe(listener: (progress: UserProgress) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 업적 달성 이벤트 리스너 등록
   */
  onAchievement(listener: AchievementListener): () => void {
    this.achievementListeners.add(listener);
    return () => this.achievementListeners.delete(listener);
  }

  /**
   * 업적 체크 및 적용
   */
  private checkAndApplyAchievements(): void {
    const newIds = checkNewAchievements(this.progress);
    if (newIds.length === 0) return;

    this.progress = applyAchievements(this.progress, newIds);
    // 업적 XP로 인한 레벨 재계산
    this.progress = {
      ...this.progress,
      currentLevel: calculateLevel(this.progress.totalXp),
    };

    // 업적 이벤트 발행
    const events: AchievementEvent[] = newIds
      .map((id) => {
        const achievement = ACHIEVEMENTS.find((a) => a.id === id);
        if (!achievement) return null;
        return {
          id,
          title: achievement.title,
          icon: achievement.icon,
          xpReward: achievement.xpReward,
        };
      })
      .filter((e): e is AchievementEvent => e !== null);

    if (events.length > 0) {
      this.achievementListeners.forEach((listener) => listener(events));
    }
  }

  /**
   * 저장
   */
  private save(): void {
    saveProgress(this.progress);
  }

  /**
   * 리스너들에게 알림
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.progress));
  }
}

// 싱글톤 인스턴스
let progressManager: ProgressManager | null = null;

/**
 * ProgressManager 싱글톤 인스턴스 가져오기
 */
export function getProgressManager(): ProgressManager {
  if (typeof window === 'undefined') {
    // SSR에서는 매번 새 인스턴스 (저장 안됨)
    return new ProgressManager();
  }

  if (!progressManager) {
    progressManager = new ProgressManager();
  }

  return progressManager;
}
