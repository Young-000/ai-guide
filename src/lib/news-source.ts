import type { FeedItem } from './news-feed';

/**
 * 원문 텍스트가 있는 항목만 기사로 쓴다 (2026-10-25, AdSense "가치가 별로 없는 콘텐츠" 대응).
 *
 * Google News RSS 의 description 은 "기사 제목 + 매체명"(묶음이면 다른 매체 헤드라인 목록)뿐이다. 생성기는 그 한 줄로
 * ko/en 기사를 써 왔다 — 1,194쌍 중 810쌍의 출처가 news.google.com 이고, 본문에 "보도 제목과 요약 수준"이라고 스스로
 * 적은 기사도 있다. 다른 출처를 가치 없이 다시 쓴 페이지는 구글 광고 정책 위반이다
 * (support.google.com/publisherpolicies/answer/11190248).
 *
 * 판정:
 * - description 이 Google News 기사 링크(`news.google.com/rss/articles`)로 이루어져 있으면 원문이 없다 — 링크 글자는
 *   전부 헤드라인이다. 제목이 120자를 넘는 단건이 "원문"으로 통과하던 구멍(리뷰 #50)을 이 규칙이 막는다.
 * - 그 밖에는 요약에서 태그·엔티티·제목(끝의 " - 매체명"을 뗀 것 포함)·매체명을 걷어 내고 남는 글자를 센다.
 */
export const MIN_SOURCE_CHARS = 120;

const ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&lt;': '<',
  '&gt;': '>',
};

const GOOGLE_NEWS_ARTICLE_LINK = /href="https?:\/\/news\.google\.com\/rss\/articles\//i;
/** 제목 끝의 매체명: "… - PCMag", "… — The Verge", "… | Reuters". */
const OUTLET_SUFFIX = /\s+[-–—|]\s+([^-–—|]{1,60})$/;

function plainText(html: string): string {
  const withoutTags = html.replace(/<[^>]*>/g, ' ');
  const decoded = withoutTags.replace(/&(nbsp|amp|quot|#39|apos|lt|gt);/g, (entity) => ENTITIES[entity] ?? ' ');
  return decoded.replace(/\s+/g, ' ').trim();
}

function removeFirst(text: string, part: string): string {
  if (!part) return text;
  const index = text.toLowerCase().indexOf(part.toLowerCase());
  if (index === -1) return text;
  return `${text.slice(0, index)} ${text.slice(index + part.length)}`.replace(/\s+/g, ' ').trim();
}

/** 요약에서 제목·매체명을 뺀 나머지 텍스트. 요약이 없거나 Google News 링크 묶음이면 빈 문자열. */
export function sourceSubstance(item: FeedItem): string {
  if (!item.summary || GOOGLE_NEWS_ARTICLE_LINK.test(item.summary)) return '';
  const title = plainText(item.title);
  const outlet = title.match(OUTLET_SUFFIX)?.[1]?.trim() ?? '';
  const bareTitle = outlet ? title.replace(OUTLET_SUFFIX, '').trim() : title;

  const summary = plainText(item.summary);
  const withoutTitle = removeFirst(summary, title);
  const rest = withoutTitle === summary ? removeFirst(summary, bareTitle) : withoutTitle;
  return removeFirst(rest, outlet);
}

export function hasSourceSubstance(item: FeedItem): boolean {
  return sourceSubstance(item).length >= MIN_SOURCE_CHARS;
}

/**
 * 행사·티켓·후원 홍보는 뉴스가 아니다 (2026-11-02 점검: 11/01 발행 5건 중 2건이 TechCrunch Founder Summit 등록 안내).
 * 2026-06~11 발행 기사 1,224건의 출처 제목에 대어 보고 고른 목록이다. "deal"·"sponsored" 같은 낱말 하나로는 막지 않는다 —
 * 'Anthropic signs $35B cloud deal'(보도)과 'OpenAI Testing Sponsored Agents'(보도)가 걸리기 때문이다.
 */
const PROMOTION_TITLE_PATTERNS: RegExp[] = [
  /\b\d+\s+(?:days?|hours?|weeks?)\s+(?:left|to go)\b/i,
  /\b(?:early[- ]bird|last chance|register (?:now|today|before|by)|get your (?:pass|tickets?)|tickets? (?:are )?(?:on sale|now available)|save up to \$?\d+|promo code|rsvp|webinar)\b/i,
  /\bfounder summit\b|\btechcrunch (?:disrupt|sessions|all stage)\b|\bdisrupt 20\d\d\b|\bstartup battlefield\b|\bbraindate\b/i,
];
const PROMOTION_BODY_PATTERN = /\b(?:sponsored (?:content|post|article)|paid partnership|advertorial)\b/i;
const PROMOTION_BODY_SCAN_CHARS = 300;

export function isPromotionalItem(item: FeedItem): boolean {
  const title = plainText(item.title);
  if (PROMOTION_TITLE_PATTERNS.some((pattern) => pattern.test(title))) return true;
  const lead = plainText(item.summary ?? '').slice(0, PROMOTION_BODY_SCAN_CHARS);
  return PROMOTION_BODY_PATTERN.test(lead);
}

/** 기사로 쓸 만한 원문: 제목 말고 읽을 본문이 있고, 홍보가 아니다. */
export function isWritableSource(item: FeedItem): boolean {
  return hasSourceSubstance(item) && !isPromotionalItem(item);
}

export type SourceSubstanceCount = { source: string; passing: number; total: number };

/** 피드별로 원문 통과 수/전체 수를 센다 (피드 정리 근거 — `npm run audit:feeds`). 처음 나온 순서를 지킨다. */
export function countSourceSubstanceBySource(items: FeedItem[]): SourceSubstanceCount[] {
  const counts = new Map<string, SourceSubstanceCount>();
  for (const feedItem of items) {
    const entry = counts.get(feedItem.source) ?? { source: feedItem.source, passing: 0, total: 0 };
    entry.total += 1;
    if (hasSourceSubstance(feedItem)) entry.passing += 1;
    counts.set(feedItem.source, entry);
  }
  return Array.from(counts.values());
}
