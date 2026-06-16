import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getNewsBySlug, getNewsSlugs } from '@/lib/news';
import NewsArticleView from '@/components/news/NewsArticleView';
import { BASE_URL } from '@/lib/site';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getNewsSlugs('en').map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const article = getNewsBySlug('en', params.slug);
  if (!article) return {};
  const urlKo = `${BASE_URL}/news/${article.slug}`;
  const urlEn = `${BASE_URL}/en/news/${article.slug}`;
  return {
    title: `${article.title} | AIWire`,
    description: article.summary,
    alternates: {
      canonical: urlEn,
      languages: (() => {
        const koExists = !!getNewsBySlug('ko', article.slug);
        const languages: Record<string, string> = { 'en-US': urlEn, 'x-default': koExists ? urlKo : urlEn };
        if (koExists) languages['ko-KR'] = urlKo;
        return languages;
      })(),
    },
    openGraph: {
      title: article.title,
      description: article.summary,
      type: 'article',
      url: urlEn,
      siteName: 'AIWire',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.summary,
    },
  };
}

export default function EnNewsArticlePage({ params }: { params: Params }): JSX.Element {
  const article = getNewsBySlug('en', params.slug);
  if (!article) notFound();
  return <NewsArticleView lang="en" article={article} />;
}
