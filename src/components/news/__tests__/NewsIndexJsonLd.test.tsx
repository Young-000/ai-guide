import { render } from '@testing-library/react';
import NewsIndexJsonLd from '../NewsIndexJsonLd';
import { BASE_URL } from '@/lib/site';
import type { NewsMeta } from '@/types/news';

function extractJsonLd(container: Element): Record<string, unknown>[] {
  return Array.from(container.querySelectorAll('script[type="application/ld+json"]')).map(
    (el) => JSON.parse(el.textContent ?? '') as Record<string, unknown>
  );
}

function makeItems(count: number): NewsMeta[] {
  return Array.from({ length: count }, (_, i) => ({
    slug: `article-${i + 1}`,
    title: `Article ${i + 1}`,
    date: '2026-07-22',
    summary: 'summary',
    tags: ['AI'],
    sources: [],
    lang: 'ko' as const,
  }));
}

describe('NewsIndexJsonLd (ko)', () => {
  it('renders exactly two script tags (ItemList + BreadcrumbList)', () => {
    const { container } = render(<NewsIndexJsonLd lang="ko" items={makeItems(3)} />);
    expect(container.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(2);
  });

  it('lists articles in order with Korean article URLs', () => {
    const { container } = render(<NewsIndexJsonLd lang="ko" items={makeItems(2)} />);
    const [list] = extractJsonLd(container);
    expect(list['@type']).toBe('ItemList');
    expect(list.itemListElement).toEqual([
      {
        '@type': 'ListItem',
        position: 1,
        url: `${BASE_URL}/news/article-1`,
        name: 'Article 1',
      },
      {
        '@type': 'ListItem',
        position: 2,
        url: `${BASE_URL}/news/article-2`,
        name: 'Article 2',
      },
    ]);
  });

  it('caps the list at 30 entries but reports the true total in numberOfItems', () => {
    const { container } = render(<NewsIndexJsonLd lang="ko" items={makeItems(50)} />);
    const [list] = extractJsonLd(container);
    expect(list.numberOfItems).toBe(50);
    expect(list.itemListElement as unknown[]).toHaveLength(30);
  });

  it('builds a two-level breadcrumb: 홈 > 뉴스', () => {
    const { container } = render(<NewsIndexJsonLd lang="ko" items={makeItems(1)} />);
    const [, breadcrumb] = extractJsonLd(container);
    expect(breadcrumb.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: '홈', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: '뉴스', item: `${BASE_URL}/news` },
    ]);
  });
});

describe('NewsIndexJsonLd (en)', () => {
  it('uses the /en/news URL space and English breadcrumb labels', () => {
    const { container } = render(<NewsIndexJsonLd lang="en" items={makeItems(1)} />);
    const [list, breadcrumb] = extractJsonLd(container);
    expect((list.itemListElement as Record<string, unknown>[])[0].url).toBe(
      `${BASE_URL}/en/news/article-1`
    );
    expect(breadcrumb.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'News', item: `${BASE_URL}/en/news` },
    ]);
  });
});
