import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getNewsBySlug, getNewsSlugs } from '@/lib/news';
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
    title: `${article.title} | AI 가이드`,
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
      locale: 'ko_KR',
    },
  };
}

export default function NewsArticlePage({ params }: { params: Params }): JSX.Element {
  const article = getNewsBySlug('ko', params.slug);
  if (!article) notFound();
  return <NewsArticleView lang="ko" article={article} />;
}
