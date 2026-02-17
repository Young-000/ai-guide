/**
 * 스마트 추천 시스템
 * 사용자 진행 상태를 기반으로 다음 추천 상황을 계산합니다.
 */

import type { Situation } from '@/types';
import type { UserProgress } from './levelSystem';

export type RecommendedSituation = {
  situation: Situation;
  reason: string;
  score: number;
};

const DIFFICULTY_ORDER: Record<string, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

/**
 * 사용자에게 다음으로 추천할 상황 반환
 *
 * 점수 기준:
 * 1. 난이도 순차 (easy 미완료 우선 -> medium -> hard)
 * 2. 카테고리 다양성 (아직 안 해본 카테고리 가중치)
 * 3. 도구 다양성 (아직 안 써본 도구가 primary인 상황 가중치)
 * 4. 우선도(priority) 높은 상황 가중치
 */
export function getRecommendations(
  progress: UserProgress,
  allSituations: Situation[],
  count: number = 3,
): RecommendedSituation[] {
  const completedSlugs = new Set(progress.completedSituations);
  const usedTools = new Set(progress.toolsUsed);

  // 완료한 카테고리 집계
  const completedCategories = new Set(
    allSituations
      .filter((s) => completedSlugs.has(s.slug))
      .map((s) => s.category),
  );

  // 미완료 상황만 필터
  const remaining = allSituations.filter((s) => !completedSlugs.has(s.slug));

  if (remaining.length === 0) {
    return [];
  }

  // 남은 easy 난이도 확인
  const hasRemainingEasy = remaining.some((s) => s.difficulty === 'easy');

  const scored: RecommendedSituation[] = remaining.map((situation) => {
    let score = 0;
    const reasons: string[] = [];

    // 1. 난이도 순차 가중치
    const diffOrder = DIFFICULTY_ORDER[situation.difficulty] ?? 2;
    if (hasRemainingEasy && situation.difficulty === 'easy') {
      score += 3;
      reasons.push('쉬운 난이도');
    } else if (!hasRemainingEasy && situation.difficulty === 'medium') {
      score += 2;
    }
    // hard는 가중치 없음 (자연 순위)
    score += Math.max(0, 4 - diffOrder); // easy=3, medium=2, hard=1

    // 2. 카테고리 다양성
    if (!completedCategories.has(situation.category)) {
      score += 2;
      reasons.push('새로운 분야');
    }

    // 3. 도구 다양성
    const primaryTool = situation.recommendedTools.find((t) => t.isPrimary);
    if (primaryTool && !usedTools.has(primaryTool.slug)) {
      score += 1;
      reasons.push(`${primaryTool.name} 첫 사용`);
    }

    // 4. priority 가중치 (낮은 값 = 높은 우선도)
    const priority = situation.priority ?? 5;
    if (priority <= 2) {
      score += 1;
      if (reasons.length === 0) {
        reasons.push('인기 가이드');
      }
    }

    // 추천 이유 문자열 생성
    const reason = reasons.length > 0
      ? reasons.join(' · ')
      : '추천 가이드';

    return { situation, reason, score };
  });

  // 점수 내림차순 정렬
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, count);
}
