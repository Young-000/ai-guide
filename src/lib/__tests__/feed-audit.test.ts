import { auditFeed, formatFeedReport, parseFeedItems } from '@/lib/feed-audit';

const NOW = new Date('2026-10-23T12:00:00Z');

function item(slug: string, pubDate: string): string {
  return [
    '<item>',
    `<title><![CDATA[t ${slug}]]></title>`,
    `<link>https://x.test/news/${slug}</link>`,
    `<pubDate>${pubDate}</pubDate>`,
    `<guid isPermaLink="true">https://x.test/news/${slug}</guid>`,
    '</item>',
  ].join('\n');
}

function feed(items: string[]): string {
  return `<?xml version="1.0"?><rss><channel>${items.join('\n')}</channel></rss>`;
}

const FRESH = 'Thu, 22 Oct 2026 00:00:00 GMT';

describe('parseFeedItems', () => {
  it('extracts slug and pubDate from each item', () => {
    const items = parseFeedItems(feed([item('a', FRESH), item('b', FRESH)]));
    expect(items.map((i) => i.slug)).toEqual(['a', 'b']);
    expect(items[0].pubDate.toISOString()).toBe('2026-10-22T00:00:00.000Z');
  });

  it('returns an empty list for a feed with no items', () => {
    expect(parseFeedItems(feed([]))).toEqual([]);
  });
});

describe('auditFeed', () => {
  const options = { now: NOW, maxAgeDays: 3 };

  it('passes when every expected recent slug is present and the newest item is fresh', () => {
    const report = auditFeed(feed([item('a', FRESH), item('b', FRESH)]), ['a', 'b'], options);
    expect(report.ok).toBe(true);
    expect(report.itemCount).toBe(2);
    expect(report.newestPubDate?.toISOString()).toBe('2026-10-22T00:00:00.000Z');
    expect(report.missingSlugs).toEqual([]);
  });

  it('fails and names the recent articles missing from the feed', () => {
    const report = auditFeed(feed([item('a', FRESH)]), ['a', 'b', 'c'], options);
    expect(report.ok).toBe(false);
    expect(report.missingSlugs).toEqual(['b', 'c']);
  });

  it('fails when the feed has no items', () => {
    const report = auditFeed(feed([]), ['a'], options);
    expect(report.ok).toBe(false);
    expect(report.newestPubDate).toBeNull();
  });

  it('fails when the newest item is older than maxAgeDays', () => {
    const report = auditFeed(
      feed([item('a', 'Mon, 19 Oct 2026 00:00:00 GMT')]),
      ['a'],
      options,
    );
    expect(report.ok).toBe(false);
    expect(report.ageDays).toBeGreaterThan(3);
  });

  it('fails when an item has an unparseable pubDate', () => {
    const report = auditFeed(feed([item('a', 'not a date')]), ['a'], options);
    expect(report.ok).toBe(false);
    expect(report.invalidDateCount).toBe(1);
  });
});

describe('formatFeedReport', () => {
  it('reports item count, newest pubDate and the verdict', () => {
    const report = auditFeed(feed([item('a', FRESH)]), ['a'], { now: NOW, maxAgeDays: 3 });
    const text = formatFeedReport('ko', report);
    expect(text).toContain('ko');
    expect(text).toContain('items: 1');
    expect(text).toContain('2026-10-22');
    expect(text).toContain('OK');
  });

  it('lists missing slugs on failure', () => {
    const report = auditFeed(feed([item('a', FRESH)]), ['a', 'zzz'], { now: NOW, maxAgeDays: 3 });
    const text = formatFeedReport('en', report);
    expect(text).toContain('FAIL');
    expect(text).toContain('zzz');
  });
});
