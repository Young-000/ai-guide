import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getNewsBySlug, getNewsSlugs, getNewsByTag, getAllNews } from '@/lib/news';
import NewsArticleView from '@/components/news/NewsArticleView';
import { buildStoryTimeline } from '@/lib/story-timeline';
import PageViewTracker from '@/components/news/PageViewTracker';
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

  /*
    이 사건이 놓인 흐름. 관련 기사(최신 3건)와 역할이 다르다 — 저쪽은 "지금 또 뭐가
    있나", 이쪽은 "이 일이 어떻게 여기까지 왔나"다. 본문이 785자(중앙값)뿐이라
    원문에 없는 가치가 필요했고, 955건의 아카이브가 우리만 가진 재료다.
  */
  const timeline = buildStoryTimeline(getAllNews('ko'), article);

  return (
    <>
      <PageViewTracker path={`/news/${params.slug}`} />
      <NewsArticleView lang="ko" article={article} relatedItems={relatedItems} timeline={timeline} />
    </>
  );
}
