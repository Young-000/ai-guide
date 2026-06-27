import { BASE_URL } from '@/lib/site';
import type { NewsLang, NewsMeta } from '@/types/news';
import type { NewsSection } from '@/lib/news-sections';

type SectionJsonLdProps = {
  section: NewsSection;
  lang: NewsLang;
  items: readonly NewsMeta[];
  /** 섹션 랜딩 페이지의 정규 URL */
  url: string;
};

function safeJson(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
}

function articleHref(lang: NewsLang, slug: string): string {
  return lang === 'ko' ? `${BASE_URL}/news/${slug}` : `${BASE_URL}/en/news/${slug}`;
}

/**
 * 섹션 랜딩의 구조화 데이터: ItemList(기사 목록) + BreadcrumbList(홈 > 뉴스 > 섹션).
 */
export default function SectionJsonLd({
  section,
  lang,
  items,
  url,
}: SectionJsonLdProps): JSX.Element {
  const isKo = lang === 'ko';
  const newsHome = isKo ? `${BASE_URL}/news` : `${BASE_URL}/en/news`;

  const itemListData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: isKo ? section.labelKo : section.labelEn,
    description: isKo ? section.descriptionKo : section.descriptionEn,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: articleHref(lang, item.slug),
      name: item.title,
    })),
  };

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isKo ? '홈' : 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: isKo ? '뉴스' : 'News', item: newsHome },
      {
        '@type': 'ListItem',
        position: 3,
        name: isKo ? section.labelKo : section.labelEn,
        item: url,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJson(itemListData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbData) }}
      />
    </>
  );
}
