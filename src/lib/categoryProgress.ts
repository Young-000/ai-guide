/**
 * 카테고리별 학습 진행률 시스템
 * 6개 카테고리의 진행률을 계산합니다.
 */

import type { Situation, SituationCategory } from '@/types';
import type { UserProgress } from './levelSystem';

export type CategoryProgress = {
  categoryId: SituationCategory;
  categoryName: string;
  categoryIcon: string;
  completedCount: number;
  totalCount: number;
  percentage: number;
  remainingSituations: Situation[];
};

/**
 * 6개 카테고리의 진행률 계산
 * 각 카테고리의 전체 가이드 수 대비 완료 수를 백분율로 반환
 */
export function calculateCategoryProgress(
  progress: UserProgress,
  allSituations: Situation[],
  categories: ReadonlyArray<{ id: SituationCategory; name: string; icon: string }>,
): CategoryProgress[] {
  const completedSlugs = new Set(progress.completedSituations);

  return categories.map((category) => {
    const categorySituations = allSituations.filter((s) => s.category === category.id);
    const completedCount = categorySituations.filter((s) => completedSlugs.has(s.slug)).length;
    const totalCount = categorySituations.length;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const remainingSituations = categorySituations.filter((s) => !completedSlugs.has(s.slug));

    return {
      categoryId: category.id,
      categoryName: category.name,
      categoryIcon: category.icon,
      completedCount,
      totalCount,
      percentage,
      remainingSituations,
    };
  });
}
