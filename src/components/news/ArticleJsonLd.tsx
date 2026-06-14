import type { NewsArticle } from '@/types/news';

type ArticleJsonLdProps = {
  article: NewsArticle;
  url: string;
};

export default function ArticleJsonLd({ article, url }: ArticleJsonLdProps): JSX.Element {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.summary,
    datePublished: article.date,
    inLanguage: article.lang,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: { '@type': 'Organization', name: 'AI Guide' },
    publisher: { '@type': 'Organization', name: 'AI Guide' },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
