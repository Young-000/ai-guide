import type { NewsMeta } from '@/types/news';

/**
 * 기사에 나온 도구·용어를 우리 가이드와 잇는다.
 *
 * 🔴 왜 (2026-09-26).
 *
 * 기사 본문 중앙값이 785자다 — 외신 1건 요약이라 원문에 없는 가치가 없고, 그것이
 * AdSense 승인 기준 중 우리가 미달하는 유일한 항목이다. 그런데 이 사이트에는
 * 도구 21개·용어 18개의 가이드가 **이미 있고** 기사와 이어져 있지 않았다.
 *
 * 이으면 세 가지가 동시에 된다:
 *   - 독자에게 "그게 뭔데?"의 답이 된다 (ux-baseline 원칙 4 — 전문용어는 그 자리에서 푼다)
 *   - 955건 **기존 기사 전부**에 즉시 적용된다 (새로 쓰지 않아도 된다)
 *   - 내부 링크가 촘촘해진다
 */

/** 한 기사에 잇는 최대 개수. 더 붙이면 브리핑이 아니라 링크 모음이 된다. */
export const MAX_MENTIONS = 3;

export type ToolLike = { slug: string; name: string; tagline?: string };
export type TermLike = { slug: string; term: string; definition?: string };

/**
 * 낱말 경계로 볼 수 있는가.
 *
 * 한국어에는 공백 경계가 없고 조사가 붙는다("토큰을"). 그래서 `\b` 를 쓸 수 없다 —
 * 대신 **같은 문자 종류가 이어지는지**로 본다: 'Claudette' 의 'Claude' 는 뒤에
 * 라틴 문자가 이어지므로 언급이 아니고, '토큰을' 의 '토큰' 은 뒤가 조사라 언급이다.
 */
function isBoundary(text: string, start: number, end: number, needle: string): boolean {
  const before = text[start - 1];
  const after = text[end];
  const latin = /[a-z0-9]/i;
  const hangul = /[가-힣]/;

  /* 라틴 낱말은 앞뒤로 라틴 문자가 붙으면 다른 낱말이다. */
  if (latin.test(needle[0])) {
    if (before && latin.test(before)) return false;
    if (after && latin.test(after)) return false;
    return true;
  }

  /* 한글 낱말은 앞에 한글이 붙으면 다른 낱말이다('컨텍스트토큰'). 뒤는 조사를 허용한다. */
  if (before && hangul.test(before)) return false;
  return true;
}

function mentions(text: string, needle: string): boolean {
  if (!needle) return false;
  const haystack = text.toLowerCase();
  const target = needle.toLowerCase();

  let from = 0;
  for (;;) {
    const at = haystack.indexOf(target, from);
    if (at === -1) return false;
    if (isBoundary(haystack, at, at + target.length, target)) return true;
    from = at + 1;
  }
}

/**
 * 제목과 태그만 본다.
 *
 * 본문까지 훑으면 955개 페이지 × 39개 항목 × 본문 길이가 되어 빌드가 무거워지고,
 * 본문에 한 번 스친 이름은 그 기사의 주제가 아닌 경우가 많다.
 */
export function findMentions(
  article: NewsMeta,
  tools: readonly ToolLike[],
  terms: readonly TermLike[],
): { tools: ToolLike[]; terms: TermLike[] } {
  const haystack = [article.title, ...article.tags].join(' ');

  return {
    tools: tools.filter((tool) => mentions(haystack, tool.name)).slice(0, MAX_MENTIONS),
    terms: terms.filter((term) => mentions(haystack, term.term)).slice(0, MAX_MENTIONS),
  };
}
