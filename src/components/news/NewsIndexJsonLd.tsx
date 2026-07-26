import { BASE_URL } from '@/lib/site';
import { safeJson } from '@/lib/json-ld';
import type { NewsLang, NewsMeta } from '@/types/news';

/** 리스트에 직렬화할 최대 기사 수. 전체(200+)를 실으면 페이지 HTML만 부풀고 리치 결과 이득은 없다. */
const MAX_LIST_ENTRIES = 30;

type NewsIndexJsonLdProps = {
  lang: NewsLang;
  items: readonly NewsMeta[];
};

function articleHref(lang: NewsLang, slug: string): string {
  return lang === 'ko' ? `${BASE_URL}/news/${slug}` : `${BASE_URL}/en/news/${slug}`;
}

/**
 * 뉴스 인덱스(/news, /en/news)의 구조화 데이터: ItemList + BreadcrumbList.
 * 섹션·토픽 랜딩에는 이미 같은 쌍이 있는데 정작 인덱스에만 없어 생긴 공백을 메운다.
 */
export default function NewsIndexJsonLd({ lang, items }: NewsIndexJsonLdProps): JSX.Element {
  const isKo = lang === 'ko';
  const newsHome = isKo ? `${BASE_URL}/news` : `${BASE_URL}/en/news`;

  const itemListData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: isKo ? 'AI · LLM 뉴스' : 'AI & LLM News',
    // 실제 보유 기사 수를 그대로 알린다 — 잘라낸 건 직렬화 목록뿐이다.
    numberOfItems: items.length,
    itemListElement: items.slice(0, MAX_LIST_ENTRIES).map((item, index) => ({
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
