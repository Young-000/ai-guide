import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getNewsBySlug, getNewsSlugs, getAllNews } from '@/lib/news';
import NewsArticleView from '@/components/news/NewsArticleView';
import { buildStoryTimeline } from '@/lib/story-timeline';
import { findMentions } from '@/lib/article-mentions';
import toolsData from '@/data/tools.json';
import glossaryData from '@/data/glossary.json';
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
  /* 같은 이유로 영어판에도 흐름을 싣는다 — 아카이브는 양쪽 다 있다. */
  const timeline = buildStoryTimeline(getAllNews('en'), article);
  /* 기사에 나온 도구·용어를 우리 가이드와 잇는다 — 955건 전부에 즉시 적용된다. */
  const mentions = findMentions(article, toolsData.tools, glossaryData.terms);

  return <NewsArticleView lang="en" article={article} timeline={timeline} mentions={mentions} />;
}
