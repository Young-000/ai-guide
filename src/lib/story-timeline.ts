import type { NewsMeta } from '@/types/news';

/**
 * 이 사건이 놓인 흐름.
 *
 * 🔴 왜 (2026-09-26).
 *
 * 기사 본문 중앙값이 785자다 — 외신 1건을 요약한 분량이라 **원문에 없는 가치가 없다.**
 * AdSense 는 9/12부터 "준비 중"이고 지적사항 칸은 비어 있는데, 승인 기준 중 우리가
 * 미달하는 항목은 "고유하고 가치 있는 콘텐츠" 하나뿐이다. 구글이 색인은 하면서
 * 순위를 주지 않는 이유이기도 하다.
 *
 * 우리에게는 955건의 아카이브가 있다. 외신은 개별 사건만 전하지만, 우리는 그 사건이
 * **어떤 흐름 위에 있는지** 보여줄 수 있다 — "6월 수출 금지 → 7월 해제 → 9월 이 발견".
 * 짧은 브리핑이라는 성격(`scripts/GENERATION_PROMPT.md`: 긴 기사 ✗, 스캔되는 브리핑 ✓)을
 * 지키면서 더할 수 있는 유일한 고유 가치다. 덤으로 내부 링크가 촘촘해진다.
 */

/** 한 기사에 싣는 흐름의 최대 길이. 더 늘리면 브리핑이 아니라 목록이 된다. */
export const MAX_TIMELINE_ITEMS = 4;

/**
 * 태그 하나가 이 아카이브에서 얼마나 흔한지.
 *
 * 'AI' 는 955건 중 136건에 붙어 있어 아무 기사나 끌어온다. 드문 태그일수록 같은
 * 사건을 가리킨다 — '효소발견' 은 그 사건의 기사만 모은다.
 */
function rarityOf(all: NewsMeta[], tag: string): number {
  return all.reduce((count, article) => (article.tags.includes(tag) ? count + 1 : count), 0);
}

export function buildStoryTimeline(all: NewsMeta[], current: NewsMeta): NewsMeta[] {
  if (current.tags.length === 0) return [];

  /* 드문 태그부터 본다 — 흔한 태그로 이으면 흐름이 아니라 잡동사니가 된다. */
  const tagsByRarity = [...current.tags].sort((a, b) => rarityOf(all, a) - rarityOf(all, b));

  const picked = new Map<string, NewsMeta>();
  for (const tag of tagsByRarity) {
    for (const article of all) {
      if (picked.size >= MAX_TIMELINE_ITEMS) break;
      if (article.slug === current.slug) continue;
      /* 앞으로 올 기사는 흐름이 아니다. 같은 날짜의 다른 기사도 흐름으로 보지 않는다. */
      if (article.date >= current.date) continue;
      if (!article.tags.includes(tag)) continue;
      if (picked.has(article.slug)) continue;
      picked.set(article.slug, article);
    }
    if (picked.size >= MAX_TIMELINE_ITEMS) break;
  }

  /* 스프레드가 아니라 Array.from — tsconfig target 이 낮아 Map 순회가 빌드에서 깨진다. */
  return Array.from(picked.values()).sort((a, b) => (a.date < b.date ? 1 : -1));
}
