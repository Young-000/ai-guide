/**
 * 업적 시스템
 * 진행 상태를 기반으로 업적 달성 여부를 판단합니다.
 */

import type { UserProgress, AchievementId } from './levelSystem';
import { ACHIEVEMENTS } from './levelSystem';

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
export function checkNewAchievements(progress: UserProgress): AchievementId[] {
  const earnedIds = new Set(progress.achievements.map((a) => a.id));
  const newAchievements: AchievementId[] = [];

  for (const [id, checker] of Object.entries(ACHIEVEMENT_CHECKERS)) {
    const achievementId = id as AchievementId;
    if (!earnedIds.has(achievementId) && checker(progress)) {
      newAchievements.push(achievementId);
    }
  }

  return newAchievements;
}

/**
 * 업적 ID로 업적 정보 가져오기
 */
export function getAchievementById(id: AchievementId): typeof ACHIEVEMENTS[number] | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

/**
 * 새 업적을 진행 상태에 추가하고 XP 보상 적용
 */
export function applyAchievements(
  progress: UserProgress,
  newAchievementIds: AchievementId[],
): UserProgress {
  if (newAchievementIds.length === 0) {
    return progress;
  }

  const now = new Date().toISOString();
  const newEarned = newAchievementIds.map((id) => ({
    id,
    earnedAt: now,
  }));

  let bonusXp = 0;
  for (const id of newAchievementIds) {
    const achievement = getAchievementById(id);
    if (achievement) {
      bonusXp += achievement.xpReward;
    }
  }

  return {
    ...progress,
    achievements: [...progress.achievements, ...newEarned],
    totalXp: progress.totalXp + bonusXp,
  };
}
