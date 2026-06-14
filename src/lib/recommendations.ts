/**
 * 스마트 추천 시스템
 * 사용자 진행 상태를 기반으로 다음 추천 상황을 계산합니다.
 */

import type { Situation, SituationCategory } from '@/types';
import type { UserProgress } from './levelSystem';
import type { ToolProficiency } from './toolProficiency';
import type { CategoryProgress } from './categoryProgress';

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

// --- Enhanced Recommendations (Cycle 10) ---

export type RecommendationTrack = 'deepen' | 'explore';

export type EnhancedRecommendation = {
  situation: Situation;
  reason: string;
  score: number;
  track: RecommendationTrack;
  trackLabel: string;
  context: string;
};

const PROFICIENCY_LABELS: Record<string, string> = {
  beginner: '초보',
  intermediate: '중급',
  advanced: '고급',
};

/**
 * 2-트랙 추천: "더 깊이"(같은 도구 심화) + "새 영역"(미시도 카테고리/도구)
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
): { deepen: EnhancedRecommendation[]; explore: EnhancedRecommendation[] } {
  const completedSlugs = new Set(progress.completedSituations);

  // --- "더 깊이 배우기" 트랙 ---
  const deepenRecs: EnhancedRecommendation[] = [];

  for (const prof of toolProficiencies) {
    if (prof.level === 'advanced' || !prof.nextGuide) continue;

    const nextLevelLabel = prof.level === 'beginner' ? '중급' : '고급';
    const context = `${prof.toolName} ${PROFICIENCY_LABELS[prof.level]} → ${nextLevelLabel} 달성 가능`;

    deepenRecs.push({
      situation: prof.nextGuide,
      reason: `${prof.toolName} 숙련도를 높여보세요`,
      score: prof.level === 'intermediate' ? 10 : 5,
      track: 'deepen',
      trackLabel: '더 깊이 배우기',
      context,
    });
  }

  // 점수 내림차순, 최대 3개
  deepenRecs.sort((a, b) => b.score - a.score);
  const topDeepen = deepenRecs.slice(0, 3);

  // --- "새로운 영역 탐색" 트랙 ---
  const exploreRecs: EnhancedRecommendation[] = [];

  // 시도하지 않은 카테고리 찾기
  const triedCategories = new Set<SituationCategory>();
  for (const s of allSituations) {
    if (completedSlugs.has(s.slug)) {
      triedCategories.add(s.category);
    }
  }

  for (const cp of categoryProgress) {
    if (triedCategories.has(cp.categoryId)) continue;
    if (cp.remainingSituations.length === 0) continue;

    // 해당 카테고리의 easy 상황 우선, 없으면 medium
    const easySituations = cp.remainingSituations
      .filter((s) => s.difficulty === 'easy');
    const target = easySituations[0] ?? cp.remainingSituations[0];
    if (!target) continue;

    exploreRecs.push({
      situation: target,
      reason: `${cp.categoryName} 영역을 시도해보세요`,
      score: 8,
      track: 'explore',
      trackLabel: '새로운 영역 탐색',
      context: `${cp.categoryIcon} ${cp.categoryName}은(는) 아직 시작하지 않았어요`,
    });
  }

  // 시도하지 않은 도구도 탐색 후보에 추가
  const usedTools = new Set(progress.toolsUsed);
  const toolSituationMap: Record<string, { name: string; situations: Situation[] }> = {};

  for (const s of allSituations) {
    if (completedSlugs.has(s.slug)) continue;
    const primaryTool = s.recommendedTools.find((t) => t.isPrimary);
    if (!primaryTool || usedTools.has(primaryTool.slug)) continue;

    const existing = toolSituationMap[primaryTool.slug];
    if (existing) {
      existing.situations.push(s);
    } else {
      toolSituationMap[primaryTool.slug] = {
        name: primaryTool.name,
        situations: [s],
      };
    }
  }

  for (const toolSlug of Object.keys(toolSituationMap)) {
    const entry = toolSituationMap[toolSlug];
    if (!entry) continue;
    const { name, situations } = entry;
    const easySituations = situations.filter((s) => s.difficulty === 'easy');
    const target = easySituations[0] ?? situations[0];
    if (!target) continue;

    // 이미 같은 상황이 exploreRecs에 있으면 스킵
    if (exploreRecs.some((r) => r.situation.slug === target.slug)) continue;

    exploreRecs.push({
      situation: target,
      reason: `${name}을(를) 처음 사용해보세요`,
      score: 6,
      track: 'explore',
      trackLabel: '새로운 영역 탐색',
      context: `${name}은(는) 아직 사용해보지 않았어요`,
    });
  }

  exploreRecs.sort((a, b) => b.score - a.score);
  const topExplore = exploreRecs.slice(0, 3);

  return { deepen: topDeepen, explore: topExplore };
}
