import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getNewsBySlug, getNewsSlugs, getNewsByTag } from '@/lib/news';
import NewsArticleView from '@/components/news/NewsArticleView';
import { BASE_URL } from '@/lib/site';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getNewsSlugs('ko').map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const article = getNewsBySlug('ko', params.slug);
  if (!article) return {};
  const urlKo = `${BASE_URL}/news/${article.slug}`;
  const urlEn = `${BASE_URL}/en/news/${article.slug}`;
  return {
    title: `${article.title} | AIWire`,
    description: article.summary,
    alternates: {
      canonical: urlKo,
      languages: (() => {
        const languages: Record<string, string> = { 'ko-KR': urlKo, 'x-default': urlKo };
        if (getNewsBySlug('en', article.slug)) languages['en-US'] = urlEn;
        return languages;
      })(),
    },
    openGraph: {
      title: article.title,
      description: article.summary,
      type: 'article',
      url: urlKo,
      siteName: 'AIWire',
      locale: 'ko_KR',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.summary,
    },
  };
}

export default function NewsArticlePage({ params }: { params: Params }): JSX.Element {
  const article = getNewsBySlug('ko', params.slug);
  if (!article) notFound();

  const relatedItems =
    article.tags.length > 0
      ? getNewsByTag('ko', article.tags[0])
          .filter((item) => item.slug !== article.slug)
          .slice(0, 3)
      : [];

  return (
    <NewsArticleView lang="ko" article={article} relatedItems={relatedItems} />
  );
}
