import { getArticleSection } from '@/lib/news-sections';
import type { NewsMeta } from '@/types/news';

/** 기사 하나에 싣는 관련 기사의 최대 개수. 상세 화면의 3열 그리드에 맞춘다. */
export const MAX_RELATED_ITEMS = 3;

/*
  왜 (2026-10-19): 예전에는 첫 태그 하나로만 골랐다. 태그 1,027개 중 64%가 기사 1건짜리라
  첫 태그가 thin 이면 관련 기사가 0건이 되어 그 기사는 어디로도 이어지지 않는 고립
  페이지가 됐다. 모든 태그의 겹침을 점수로 보고, 모자라면 같은 섹션의 최신 기사로 채운다.
*/

function countSharedTags(a: NewsMeta, b: NewsMeta): number {
  return a.tags.filter((tag) => b.tags.includes(tag)).length;
}

/**
 * 현재 기사와 이어 볼 기사. 공유 태그가 많은 순(동률은 최신순) → 같은 섹션 최신순.
 * `all` 은 날짜 내림차순이라고 가정한다(getAllNews 보장).
 */
export function selectRelatedArticles(
  all: readonly NewsMeta[],
  current: NewsMeta,
  excludeSlugs: readonly string[] = [],
  limit: number = MAX_RELATED_ITEMS,
): NewsMeta[] {
  const candidates = all.filter(
    (item) => item.slug !== current.slug && !excludeSlugs.includes(item.slug),
  );

  const byTags = candidates
    .map((item) => ({ item, shared: countSharedTags(item, current) }))
    .filter(({ shared }) => shared > 0)
    .sort((a, b) => b.shared - a.shared || (a.item.date < b.item.date ? 1 : -1))
    .map(({ item }) => item);

  const picked = byTags.slice(0, limit);
  if (picked.length >= limit) return picked;

  const section = getArticleSection(current);
  const pickedSlugs = new Set(picked.map((item) => item.slug));
  const bySection = candidates.filter(
    (item) => !pickedSlugs.has(item.slug) && getArticleSection(item) === section,
  );
  return [...picked, ...bySection.slice(0, limit - picked.length)];
}
