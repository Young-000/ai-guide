import { buildRssXml } from '@/lib/rss';
import { BASE_URL } from '@/lib/site';

describe('buildRssXml — channel <link>', () => {
  it('ko channel link points at the site root (unchanged)', () => {
    const xml = buildRssXml('ko');
    expect(xml).toContain(`<link>${BASE_URL}</link>`);
  });

  it('en channel link points at the English news index, not the bare BASE_URL', () => {
    const xml = buildRssXml('en');
    expect(xml).toContain(`<link>${BASE_URL}/en/news</link>`);
    expect(xml).not.toContain(`<link>${BASE_URL}</link>`);
  });
});

describe('buildRssXml — atom:self', () => {
  it('declares the atom namespace on the rss root', () => {
    const xml = buildRssXml('ko');
    expect(xml).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
  });

  it('includes a self-referential atom:link for the ko feed', () => {
    const xml = buildRssXml('ko');
    expect(xml).toContain(
      `<atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />`,
    );
  });

  it('includes a self-referential atom:link for the en feed', () => {
    const xml = buildRssXml('en');
    expect(xml).toContain(
      `<atom:link href="${BASE_URL}/en/feed.xml" rel="self" type="application/rss+xml" />`,
    );
  });
});
