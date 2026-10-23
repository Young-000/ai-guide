/**
 * RSS 피드 최신성 감사 (순수 함수): rss.ts 가 만든 XML 이 "최근 발행 N건"을 담고 있고
 * 가장 새 항목이 너무 오래되지 않았는지 본다. 발행 파이프라인이 조용히 깨지면 피드가 먼저 낡는다.
 */

export type FeedItem = { slug: string; pubDate: Date };

export type FeedAuditOptions = { now: Date; maxAgeDays: number };

export type FeedAuditReport = {
  ok: boolean;
  itemCount: number;
  newestPubDate: Date | null;
  ageDays: number | null;
  missingSlugs: string[];
  invalidDateCount: number;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function tagText(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return match ? match[1].trim() : '';
}

export function parseFeedItems(xml: string): FeedItem[] {
  const blocks = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  return blocks.map((block) => {
    const link = tagText(block, 'link');
    return { slug: link.slice(link.lastIndexOf('/') + 1), pubDate: new Date(tagText(block, 'pubDate')) };
  });
}

export function auditFeed(
  xml: string,
  expectedSlugs: string[],
  { now, maxAgeDays }: FeedAuditOptions,
): FeedAuditReport {
  const items = parseFeedItems(xml);
  // 미래 날짜는 잘못된 날짜로 센다: 그렇지 않으면 미래로 찍힌 기사 하나가 감사를 영원히 통과시킨다.
  const validDates = items
    .map((i) => i.pubDate)
    .filter((d) => !Number.isNaN(d.getTime()) && d.getTime() <= now.getTime());
  const invalidDateCount = items.length - validDates.length;
  const newestPubDate = validDates.length
    ? new Date(Math.max(...validDates.map((d) => d.getTime())))
    : null;
  const ageDays = newestPubDate ? (now.getTime() - newestPubDate.getTime()) / MS_PER_DAY : null;
  const present = new Set(items.map((i) => i.slug));
  const missingSlugs = expectedSlugs.filter((slug) => !present.has(slug));
  const isFresh = ageDays !== null && ageDays <= maxAgeDays;

  return {
    ok: items.length > 0 && isFresh && missingSlugs.length === 0 && invalidDateCount === 0,
    itemCount: items.length,
    newestPubDate,
    ageDays,
    missingSlugs,
    invalidDateCount,
  };
}

export function formatFeedReport(lang: string, report: FeedAuditReport): string {
  const newest = report.newestPubDate ? report.newestPubDate.toISOString().slice(0, 10) : 'none';
  const age = report.ageDays === null ? 'n/a' : `${report.ageDays.toFixed(1)}d old`;
  const lines = [
    `[feed ${lang}] items: ${report.itemCount} · newest pubDate: ${newest} (${age}) · ${report.ok ? 'OK' : 'FAIL'}`,
  ];
  if (report.missingSlugs.length) lines.push(`  missing recent articles: ${report.missingSlugs.join(', ')}`);
  if (report.invalidDateCount) lines.push(`  items with invalid pubDate: ${report.invalidDateCount}`);
  return lines.join('\n');
}
