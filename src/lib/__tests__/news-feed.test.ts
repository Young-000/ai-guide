import { parseFeed, dedupeItems } from '@/lib/news-feed';
import type { FeedItem } from '@/lib/news-feed';

// ─── Fixtures ──────────────────────────────────────────────────────────────

const RSS_FIXTURE = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test Feed</title>
    <item>
      <title>Article One</title>
      <link>https://example.com/article-one</link>
      <pubDate>Mon, 15 Jun 2026 10:00:00 GMT</pubDate>
      <description>Summary of article one</description>
    </item>
    <item>
      <title>Article Two</title>
      <link>https://example.com/article-two</link>
      <pubDate>Sun, 14 Jun 2026 08:00:00 GMT</pubDate>
      <description>Summary of article two</description>
    </item>
  </channel>
</rss>`;

const ATOM_FIXTURE = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Atom Test Feed</title>
  <entry>
    <title>Atom Article One</title>
    <link href="https://atom.example.com/one" rel="alternate"/>
    <updated>2026-06-15T09:00:00Z</updated>
    <summary>Atom summary one</summary>
  </entry>
</feed>`;

const ATOM_MULTI_LINK_FIXTURE = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <title>Multi Link Entry</title>
    <link href="https://example.com/self" rel="self"/>
    <link href="https://example.com/alternate" rel="alternate"/>
    <updated>2026-06-15T09:00:00Z</updated>
    <summary>Multi link summary</summary>
  </entry>
</feed>`;

// ─── parseFeed ──────────────────────────────────────────────────────────────

describe('parseFeed', () => {
  describe('RSS 2.0', () => {
    it('parses two items with all fields', () => {
      const items = parseFeed(RSS_FIXTURE, 'Test Source');
      expect(items).toHaveLength(2);
      expect(items[0]).toEqual<FeedItem>({
        source: 'Test Source',
        title: 'Article One',
        url: 'https://example.com/article-one',
        publishedAt: 'Mon, 15 Jun 2026 10:00:00 GMT',
        summary: 'Summary of article one',
      });
    });

    it('attaches sourceName to every item', () => {
      const items = parseFeed(RSS_FIXTURE, 'My Source');
      expect(items.every((i) => i.source === 'My Source')).toBe(true);
    });

    it('second item fields are correct', () => {
      const items = parseFeed(RSS_FIXTURE, 'Test Source');
      expect(items[1]?.title).toBe('Article Two');
      expect(items[1]?.url).toBe('https://example.com/article-two');
    });
  });

  describe('Atom', () => {
    it('parses a single entry with link[@href]', () => {
      const items = parseFeed(ATOM_FIXTURE, 'Atom Source');
      expect(items).toHaveLength(1);
      expect(items[0]).toEqual<FeedItem>({
        source: 'Atom Source',
        title: 'Atom Article One',
        url: 'https://atom.example.com/one',
        publishedAt: '2026-06-15T09:00:00Z',
        summary: 'Atom summary one',
      });
    });

    it('uses the alternate link when multiple links exist', () => {
      const items = parseFeed(ATOM_MULTI_LINK_FIXTURE, 'Multi');
      expect(items).toHaveLength(1);
      expect(items[0]?.url).toBe('https://example.com/alternate');
    });
  });

  describe('edge cases', () => {
    it('returns empty array for invalid XML structure', () => {
      expect(parseFeed('not xml', 'Bad')).toEqual([]);
    });

    it('returns empty array for empty string', () => {
      expect(parseFeed('', 'Empty')).toEqual([]);
    });

    it('returns empty array for XML with no RSS or Atom root', () => {
      expect(parseFeed('<root><child/></root>', 'Unknown')).toEqual([]);
    });
  });
});

// ─── dedupeItems ────────────────────────────────────────────────────────────

describe('dedupeItems', () => {
  const base: FeedItem[] = [
    { source: 'S', title: 'Alpha', url: 'https://example.com/a', publishedAt: null, summary: null },
    { source: 'S', title: 'Beta', url: 'https://example.com/b', publishedAt: null, summary: null },
    { source: 'S', title: 'Gamma', url: 'https://example.com/c', publishedAt: null, summary: null },
  ];

  it('returns all items when nothing is published', () => {
    const result = dedupeItems(base, new Set(), new Set());
    expect(result).toHaveLength(3);
  });

  it('drops items whose URL is in publishedUrls', () => {
    const result = dedupeItems(base, new Set(['https://example.com/b']), new Set());
    expect(result.map((i) => i.title)).toEqual(['Alpha', 'Gamma']);
  });

  it('drops items whose normalized title matches existingTitles', () => {
    const result = dedupeItems(base, new Set(), new Set(['alpha']));
    expect(result.map((i) => i.title)).toEqual(['Beta', 'Gamma']);
  });

  it('title match is case-insensitive and trims whitespace', () => {
    const itemWithSpaces: FeedItem[] = [
      { source: 'S', title: '  ALPHA  ', url: 'https://new.com', publishedAt: null, summary: null },
    ];
    const result = dedupeItems(itemWithSpaces, new Set(), new Set(['alpha']));
    expect(result).toHaveLength(0);
  });

  it('drops by URL before checking title (both match → still dropped once)', () => {
    const result = dedupeItems(
      base,
      new Set(['https://example.com/a']),
      new Set(['alpha']),
    );
    expect(result.map((i) => i.title)).toEqual(['Beta', 'Gamma']);
  });

  it('keeps fresh items that appear in neither set', () => {
    const result = dedupeItems(
      base,
      new Set(['https://example.com/a']),
      new Set(['beta']),
    );
    expect(result.map((i) => i.title)).toEqual(['Gamma']);
  });
});
