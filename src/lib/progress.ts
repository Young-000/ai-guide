/**
 * 진도 관리 로직
 * React Context와 함께 사용할 수 있는 진도 관리 헬퍼 함수들
 */

import {
  loadProgress,
  saveProgress,
  completeStep,
  completeOnboarding,
  type UserProgress,
} from './levelSystem';

/**
 * 진도 관리자 클래스
 * 상태 변경을 추적하고 자동 저장을 처리합니다.
 */
export class ProgressManager {
  private progress: UserProgress;
  private listeners: Set<(progress: UserProgress) => void> = new Set();

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
    this.progress = completeStep(this.progress, situationSlug, stepOrder, totalSteps);
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
