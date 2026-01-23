import type { Tool } from '@/types';
import toolsData from '@/data/tools.json';

// 모듈 레벨에서 한 번만 파싱
const tools = toolsData.tools as Tool[];

/**
 * slug로 도구 정보 조회
 */
export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

/**
 * 여러 slug로 도구 목록 조회
 */
export function getToolsBySlugs(slugs: string[]): Tool[] {
  return slugs
    .map((slug) => getToolBySlug(slug))
    .filter((t): t is Tool => t !== undefined);
}

/**
 * 카테고리별 도구 목록 조회
 */
export function getToolsByCategory(category: string): Tool[] {
  return tools.filter((t) => t.category === category);
}

/**
 * 무료 도구만 조회
 */
export function getFreeTools(): Tool[] {
  return tools.filter((t) => t.pricing.free);
}

/**
 * 모든 도구 목록 조회
 */
export function getAllTools(): Tool[] {
  return [...tools];
}

/**
 * 도구 URL 가져오기
 */
export function getToolUrl(slug: string): string | undefined {
  return getToolBySlug(slug)?.url;
}
