import { render } from '@testing-library/react';
import SectionJsonLd from '../SectionJsonLd';
import { BASE_URL } from '@/lib/site';
import type { NewsSection } from '@/lib/news-sections';
import type { NewsMeta } from '@/types/news';

function extractJsonLd(container: Element): unknown[] {
  return Array.from(container.querySelectorAll('script[type="application/ld+json"]')).map((el) =>
    JSON.parse(el.textContent ?? '')
  );
}

const SECTION: NewsSection = {
  id: 'models',
  labelKo: '모델·연구',
  labelEn: 'Models & Research',
  descriptionKo: '새 AI 모델 출시와 연구 동향',
  descriptionEn: 'New AI model releases and research',
};

const ITEMS: NewsMeta[] = [
  {
    slug: 'test-article-1',
    title: 'Test Article 1',
    date: '2026-07-01',
    summary: 'summary',
    tags: ['AI'],
    sources: [],
    lang: 'ko',
  },
  {
    slug: 'test-article-2',
    title: 'Test Article 2',
    date: '2026-07-02',
    summary: 'summary2',
    tags: ['LLM'],
    sources: [],
    lang: 'ko',
  },
];

describe('SectionJsonLd (ko)', () => {
  const url = `${BASE_URL}/news/section/models`;

  it('renders exactly two script tags (ItemList + BreadcrumbList)', () => {
    const { container } = render(
      <SectionJsonLd section={SECTION} lang="ko" items={ITEMS} url={url} />
    );
    expect(container.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(2);
  });

  it('first script is ItemList with correct item count', () => {
    const { container } = render(
      <SectionJsonLd section={SECTION} lang="ko" items={ITEMS} url={url} />
    );
    const [itemList] = extractJsonLd(container) as Array<Record<string, unknown>>;
    expect(itemList['@type']).toBe('ItemList');
    expect(itemList['numberOfItems']).toBe(ITEMS.length);
  });

  it('ItemList name uses Korean label', () => {
    const { container } = render(
      <SectionJsonLd section={SECTION} lang="ko" items={ITEMS} url={url} />
    );
    const [itemList] = extractJsonLd(container) as Array<Record<string, unknown>>;
    expect(itemList['name']).toBe(SECTION.labelKo);
  });

  it('second script is BreadcrumbList with 3 items', () => {
    const { container } = render(
      <SectionJsonLd section={SECTION} lang="ko" items={ITEMS} url={url} />
    );
    const [, crumb] = extractJsonLd(container) as Array<{
      '@type': string;
      itemListElement: unknown[];
    }>;
    expect(crumb['@type']).toBe('BreadcrumbList');
    expect(crumb.itemListElement).toHaveLength(3);
  });

  it('breadcrumb position 1 links to site root', () => {
    const { container } = render(
      <SectionJsonLd section={SECTION} lang="ko" items={ITEMS} url={url} />
    );
    const [, crumb] = extractJsonLd(container) as Array<{
      itemListElement: Array<{ position: number; item: string; name: string }>;
    }>;
    expect(crumb.itemListElement[0]).toMatchObject({ position: 1, item: BASE_URL });
  });

  it('breadcrumb position 2 links to /news', () => {
    const { container } = render(
      <SectionJsonLd section={SECTION} lang="ko" items={ITEMS} url={url} />
    );
    const [, crumb] = extractJsonLd(container) as Array<{
      itemListElement: Array<{ position: number; item: string }>;
    }>;
    expect(crumb.itemListElement[1]).toMatchObject({ position: 2, item: `${BASE_URL}/news` });
  });

  it('breadcrumb position 3 uses Korean label and canonical URL', () => {
    const { container } = render(
      <SectionJsonLd section={SECTION} lang="ko" items={ITEMS} url={url} />
    );
    const [, crumb] = extractJsonLd(container) as Array<{
      itemListElement: Array<{ position: number; name: string; item: string }>;
    }>;
    expect(crumb.itemListElement[2]).toMatchObject({
      position: 3,
      name: SECTION.labelKo,
      item: url,
    });
  });
});

describe('SectionJsonLd (en)', () => {
  const url = `${BASE_URL}/en/news/section/models`;

  it('ItemList name uses English label', () => {
    const { container } = render(
      <SectionJsonLd section={SECTION} lang="en" items={ITEMS} url={url} />
    );
    const [itemList] = extractJsonLd(container) as Array<Record<string, unknown>>;
    expect(itemList['name']).toBe(SECTION.labelEn);
  });

  it('breadcrumb position 2 links to /en/news', () => {
    const { container } = render(
      <SectionJsonLd section={SECTION} lang="en" items={ITEMS} url={url} />
    );
    const [, crumb] = extractJsonLd(container) as Array<{
      itemListElement: Array<{ position: number; item: string }>;
    }>;
    expect(crumb.itemListElement[1]).toMatchObject({
      position: 2,
      item: `${BASE_URL}/en/news`,
    });
  });

  it('breadcrumb position 3 uses English label', () => {
    const { container } = render(
      <SectionJsonLd section={SECTION} lang="en" items={ITEMS} url={url} />
    );
    const [, crumb] = extractJsonLd(container) as Array<{
      itemListElement: Array<{ position: number; name: string; item: string }>;
    }>;
    expect(crumb.itemListElement[2]).toMatchObject({ name: SECTION.labelEn, item: url });
  });
});

describe('SectionJsonLd — XSS safety', () => {
  const url = `${BASE_URL}/news/section/models`;

  it('does not contain raw "<" or ">" that could break script injection', () => {
    const dangerous: NewsSection = {
      ...SECTION,
      labelKo: '</script><script>alert(1)',
      labelEn: '</script><script>alert(1)',
    };
    const { container } = render(
      <SectionJsonLd section={dangerous} lang="ko" items={[]} url={url} />
    );
    container.querySelectorAll('script[type="application/ld+json"]').forEach((el) => {
      const raw = el.textContent ?? '';
      expect(raw).not.toContain('<');
      expect(raw).not.toContain('>');
    });
  });
});
