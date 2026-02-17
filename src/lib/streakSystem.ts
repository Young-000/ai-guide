/**
 * 스트릭 시스템
 * 일별 활동 추적 및 연속 스트릭 계산 (KST 기준)
 */

import type { UserProgress } from './levelSystem';

/**
 * 오늘 날짜를 'YYYY-MM-DD' 형식으로 반환 (한국 시간)
 */
export function getToday(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

/**
 * 어제 날짜를 'YYYY-MM-DD' 형식으로 반환 (한국 시간)
 */
export function getYesterday(): string {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(yesterday);
}

/**
 * 스트릭 업데이트
 * - 오늘 첫 활동이면 스트릭 +1 (어제 활동이 있었을 때) 또는 1로 리셋
 * - 이미 오늘 활동했으면 변경 없음
 */
export function updateStreak(progress: UserProgress): UserProgress {
  const today = getToday();

  if (progress.lastActiveDate === today) {
    return progress;
  }

  const yesterday = getYesterday();

  let newStreak: number;
  if (progress.lastActiveDate === yesterday) {
    newStreak = progress.currentStreak + 1;
  } else {
    newStreak = 1;
  }

  return {
    ...progress,
    currentStreak: newStreak,
    longestStreak: Math.max(progress.longestStreak, newStreak),
    lastActiveDate: today,
  };
}

/**
 * 일별 활동 기록 업데이트
 * 최근 90일만 보관
 */
export function recordDailyActivity(
  progress: UserProgress,
  stepsCompleted: number,
  xpEarned: number,
): UserProgress {
  const today = getToday();
  const existing = progress.dailyActivities.find((a) => a.date === today);

  let updatedActivities;
  if (existing) {
    updatedActivities = progress.dailyActivities.map((a) =>
      a.date === today
        ? {
            ...a,
            stepsCompleted: a.stepsCompleted + stepsCompleted,
            xpEarned: a.xpEarned + xpEarned,
          }
        : a,
    );
  } else {
    updatedActivities = [
      ...progress.dailyActivities,
      { date: today, stepsCompleted, xpEarned },
    ];
  }

  // 최근 90일만 보관
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);
  const cutoffStr = cutoffDate.toISOString().split('T')[0];

  updatedActivities = updatedActivities.filter((a) => a.date >= (cutoffStr ?? ''));

  return {
    ...progress,
    dailyActivities: updatedActivities,
  };
}
