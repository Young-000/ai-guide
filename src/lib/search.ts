import type { Situation } from '@/types';
import { expandWithSynonyms } from './synonyms';

export interface SearchResult {
  situation: Situation;
  score: number;
  matchedKeywords: string[];
}

/**
 * 상황 검색 함수
 * @param query 검색어
 * @param situations 상황 목록
 * @param category 카테고리 필터 (선택)
 * @returns 점수순 정렬된 검색 결과
 */
export function searchSituations(
  query: string,
  situations: Situation[],
  category?: string | null
): SearchResult[] {
  // 카테고리 필터 적용
  let filtered = situations;
  if (category) {
    filtered = situations.filter(s => s.category === category);
  }

  // 검색어가 없으면 priority 순으로 반환
  if (!query.trim()) {
    return filtered
      .sort((a, b) => (a.priority || 99) - (b.priority || 99))
      .map(situation => ({
        situation,
        score: 0,
        matchedKeywords: [],
      }));
  }

  // 검색어 확장 (동의어 포함)
  const expandedTerms = expandWithSynonyms(query.toLowerCase());

  // 각 상황에 대해 점수 계산
  const results: SearchResult[] = [];

  for (const situation of filtered) {
    const { score, matchedKeywords } = calculateScore(situation, expandedTerms);

    if (score > 0) {
      results.push({
        situation,
        score,
        matchedKeywords,
      });
    }
  }

  // 점수순 정렬 (동점이면 priority 순)
  return results.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return (a.situation.priority || 99) - (b.situation.priority || 99);
  });
}

/**
 * 상황에 대한 검색 점수 계산
 */
function calculateScore(
  situation: Situation,
  searchTerms: string[]
): { score: number; matchedKeywords: string[] } {
  let score = 0;
  const matchedKeywords: string[] = [];

  const titleLower = situation.title.toLowerCase();
  const subtitleLower = situation.subtitle.toLowerCase();
  const problemLower = situation.problem.toLowerCase();
  const keywords = situation.searchKeywords || [];
  const naturalQueries = situation.naturalQueries || [];

  for (const term of searchTerms) {
    // 제목 매칭 (가중치 5)
    if (titleLower.includes(term)) {
      score += 5;
      matchedKeywords.push(term);
    }

    // 부제목 매칭 (가중치 3)
    if (subtitleLower.includes(term)) {
      score += 3;
      if (!matchedKeywords.includes(term)) matchedKeywords.push(term);
    }

    // 문제 설명 매칭 (가중치 2)
    if (problemLower.includes(term)) {
      score += 2;
      if (!matchedKeywords.includes(term)) matchedKeywords.push(term);
    }

    // 검색 키워드 매칭 (가중치 4)
    if (keywords.some(kw => kw.toLowerCase() === term)) {
      score += 4;
      if (!matchedKeywords.includes(term)) matchedKeywords.push(term);
    }

    // 자연어 쿼리 매칭 (가중치 3)
    if (naturalQueries.some(nq => nq.toLowerCase().includes(term))) {
      score += 3;
      if (!matchedKeywords.includes(term)) matchedKeywords.push(term);
    }
  }

  return { score, matchedKeywords };
}

/**
 * 인기 상황 가져오기 (priority 기준)
 */
export function getPopularSituations(
  situations: Situation[],
  limit: number = 6
): Situation[] {
  return [...situations]
    .sort((a, b) => (a.priority || 99) - (b.priority || 99))
    .slice(0, limit);
}

/**
 * 카테고리별 상황 가져오기
 */
export function getSituationsByCategory(
  situations: Situation[],
  category: string
): Situation[] {
  return situations.filter(s => s.category === category);
}
