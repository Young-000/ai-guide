import type { NewsMeta } from '@/types/news';

const cdataBreakout: NewsMeta = {
  title: 'Title with ]]> breakout',
  lang: 'ko',
  date: '2026-01-01',
  slug: 'cdata-test',
  summary: 'Summary with ]]> breakout too',
  tags: [],
  sources: [],
};

// buildRssXml calls getAllNews(lang) with the default content root. Mock it
// wholesale so we can feed a crafted title/summary containing a raw "]]>"
// without needing a fixture file on disk.
jest.mock('@/lib/news', () => ({
  getAllNews: (): NewsMeta[] => [cdataBreakout],
}));

describe('buildRssXml — CDATA hardening', () => {
  it('escapes a raw "]]>" in the title/summary so it cannot prematurely close the CDATA section', async () => {
    const { buildRssXml } = await import('@/lib/rss');
    const xml = buildRssXml('ko');

    expect(xml).not.toContain(']]> breakout');
    expect(xml).not.toContain(']]> breakout too');
    expect(xml).toContain(']]&gt; breakout');
    expect(xml).toContain(']]&gt; breakout too');
  });
});
