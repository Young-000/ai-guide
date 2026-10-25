import type { FeedItem } from './news-feed';

/**
 * 원문 텍스트가 있는 항목만 기사로 쓴다 (2026-10-25, AdSense "가치가 별로 없는 콘텐츠" 대응).
 *
 * Google News RSS 의 description 은 "기사 제목 + 매체명" 뿐이다. 생성기는 그 한 줄로 ko/en 기사를 써 왔다 —
 * 1,194쌍 중 810쌍의 출처가 news.google.com 이고, 본문에 "보도 제목과 요약 수준"이라고 스스로 적은 기사도 있다.
 * 다른 출처를 가치 없이 다시 쓴 페이지는 구글 광고 정책 위반이다
 * (support.google.com/publisherpolicies/answer/11190248).
 *
 * 그래서 요약에서 태그·엔티티·제목을 걷어 내고 남는 글자가 `MIN_SOURCE_CHARS` 이상일 때만 쓴다.
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

function plainText(html: string): string {
  const withoutTags = html.replace(/<[^>]*>/g, ' ');
  const decoded = withoutTags.replace(/&(nbsp|amp|quot|#39|apos|lt|gt);/g, (entity) => ENTITIES[entity] ?? ' ');
  return decoded.replace(/\s+/g, ' ').trim();
}

/** 요약에서 제목을 뺀 나머지 텍스트. 요약이 없으면 빈 문자열. */
export function sourceSubstance(item: FeedItem): string {
  if (!item.summary) return '';
  const summary = plainText(item.summary);
  const title = plainText(item.title);
  if (!title) return summary;
  const index = summary.toLowerCase().indexOf(title.toLowerCase());
  if (index === -1) return summary;
  return `${summary.slice(0, index)} ${summary.slice(index + title.length)}`.replace(/\s+/g, ' ').trim();
}

export function hasSourceSubstance(item: FeedItem): boolean {
  return sourceSubstance(item).length >= MIN_SOURCE_CHARS;
}
