import { BASE_URL } from '@/lib/site';
import type { NewsArticle } from '@/types/news';

type ArticleJsonLdProps = {
  article: NewsArticle;
  url: string;
};

function safeJson(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e');
}

const DEFAULT_OG_IMAGE = `${BASE_URL}/opengraph-image`;

function toAbsoluteUrl(src: string): string {
  return src.startsWith('http') ? src : `${BASE_URL}${src.startsWith('/') ? '' : '/'}${src}`;
}

export default function ArticleJsonLd({ article, url }: ArticleJsonLdProps): JSX.Element {
  const image = article.image ? toAbsoluteUrl(article.image) : DEFAULT_OG_IMAGE;
  const articleData = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.summary,
    image: [image],
    datePublished: article.date,
    dateModified: article.dateModified ?? article.date,
    inLanguage: article.lang === 'ko' ? 'ko-KR' : 'en-US',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: { '@type': 'Organization', name: 'AIWire' },
    publisher: {
      '@type': 'Organization',
      name: 'AIWire',
      logo: { '@type': 'ImageObject', url: DEFAULT_OG_IMAGE },
    },
  };

  const isKo = article.lang === 'ko';
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isKo ? '홈' : 'Home', item: BASE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: isKo ? '뉴스' : 'News',
        item: isKo ? `${BASE_URL}/news` : `${BASE_URL}/en/news`,
      },
      { '@type': 'ListItem', position: 3, name: article.title, item: url },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJson(articleData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbData) }}
      />
    </>
  );
}
