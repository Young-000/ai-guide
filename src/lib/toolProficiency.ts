/**
 * 도구 숙련도 시스템
 * 사용자의 도구별 학습 진행도를 계산합니다.
 */

import type { Situation } from '@/types';
import type { UserProgress } from './levelSystem';

export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced';

export type ToolProficiency = {
  toolSlug: string;
  toolName: string;
  level: ProficiencyLevel;
  completedGuides: number;
  totalGuides: number;
  promptsCopied: number;
  firstUsedAt: string | null;
  nextGuide: Situation | null;
};

/**
 * 단일 도구의 숙련도 등급 계산
 *
 * 가이드가 3개 이상인 도구 (claude, chatgpt):
 *   beginner: 1-2개 완료
 *   intermediate: 3-4개 완료 OR 프롬프트 5회+
 *   advanced: 5개+ 완료 AND 프롬프트 10회+
 *
 * 가이드가 1-2개인 도구 (gamma, cursor, midjourney 등):
 *   beginner: 0개 완료 (toolsUsed에만 포함)
 *   intermediate: 1개 완료
 *   advanced: 전체 완료 AND 프롬프트 3회+
 */
export function calculateProficiencyLevel(
  completedCount: number,
  totalCount: number,
  promptsCopied: number,
): ProficiencyLevel {
  const isSmallToolPool = totalCount <= 2;

  if (isSmallToolPool) {
    if (completedCount >= totalCount && promptsCopied >= 3) {
      return 'advanced';
    }
    if (completedCount >= 1) {
      return 'intermediate';
    }
    return 'beginner';
  }

  // 가이드가 3개 이상인 도구
  if (completedCount >= 5 && promptsCopied >= 10) {
    return 'advanced';
  }
  if (completedCount >= 3 || promptsCopied >= 5) {
    return 'intermediate';
  }
  return 'beginner';
}

/**
 * 모든 도구의 숙련도 계산
 *
 * 1. allSituations에서 도구별 primary 가이드 목록 집계
 * 2. 완료한 가이드 수 + 프롬프트 복사 수로 등급 판정
 * 3. 다음 추천 가이드 (미완료 중 가장 쉬운 것) 계산
 */
export function calculateToolProficiencies(
  progress: UserProgress,
  allSituations: Situation[],
): ToolProficiency[] {
  // 도구별 primary 가이드 집계
  const toolGuidesMap: Record<string, { name: string; situations: Situation[] }> = {};

  for (const situation of allSituations) {
    const primaryTool = situation.recommendedTools.find((t) => t.isPrimary);
    if (!primaryTool) continue;

    const existing = toolGuidesMap[primaryTool.slug];
    if (existing) {
      existing.situations.push(situation);
    } else {
      toolGuidesMap[primaryTool.slug] = {
        name: primaryTool.name,
        situations: [situation],
      };
    }
  }

  const completedSlugs = new Set(progress.completedSituations);
  const usedTools = new Set(progress.toolsUsed);

  const difficultyOrder: Record<string, number> = {
    easy: 1,
    medium: 2,
    hard: 3,
  };

  const proficiencies: ToolProficiency[] = [];

  for (const toolSlug of Object.keys(toolGuidesMap)) {
    const entry = toolGuidesMap[toolSlug];
    if (!entry) continue;
    const { name, situations } = entry;

    // toolsUsed에 없으면 표시하지 않음
    if (!usedTools.has(toolSlug)) continue;

    const completedGuides = situations.filter((s) => completedSlugs.has(s.slug)).length;
    const totalGuides = situations.length;
    const promptsCopied = progress.promptCopyByTool[toolSlug] ?? 0;
    const firstUsedAt = progress.toolFirstUsedAt[toolSlug] ?? null;

    const level = calculateProficiencyLevel(completedGuides, totalGuides, promptsCopied);

    // 다음 추천 가이드: 미완료 중 난이도 쉬운 순
    const remainingGuides = situations
      .filter((s) => !completedSlugs.has(s.slug))
      .sort((a, b) => (difficultyOrder[a.difficulty] ?? 2) - (difficultyOrder[b.difficulty] ?? 2));

    const nextGuide = remainingGuides[0] ?? null;

    proficiencies.push({
      toolSlug,
      toolName: name,
      level,
      completedGuides,
      totalGuides,
      promptsCopied,
      firstUsedAt,
      nextGuide,
    });
  }

  // 완료 가이드 수 내림차순 정렬
  proficiencies.sort((a, b) => b.completedGuides - a.completedGuides);

  return proficiencies;
}
