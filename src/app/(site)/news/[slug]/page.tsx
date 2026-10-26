import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getNewsBySlug, getNewsSlugs, getAllNews, isThinArticle } from '@/lib/news';
import NewsArticleView from '@/components/news/NewsArticleView';
import { buildStoryTimeline } from '@/lib/story-timeline';
import { selectRelatedArticles } from '@/lib/related-articles';
import { findMentions } from '@/lib/article-mentions';
import toolsData from '@/data/tools.json';
import glossaryData from '@/data/glossary.json';
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
    // 본문이 제목만 봤다고 말하는 기사는 색인에서 뺀다(사이트맵도 동일). 페이지는 그대로 열린다.
    ...(isThinArticle(article.slug) ? { robots: { index: false, follow: true } } : {}),
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

  /*
    이 사건이 놓인 흐름. 관련 기사(태그·섹션이 겹치는 기사)와 역할이 다르다 — 저쪽은 "지금 또 뭐가
    있나", 이쪽은 "이 일이 어떻게 여기까지 왔나"다. 본문이 785자(중앙값)뿐이라
    원문에 없는 가치가 필요했고, 955건의 아카이브가 우리만 가진 재료다.
  */
  const allNews = getAllNews('ko');
  const timeline = buildStoryTimeline(allNews, article);
  /* 흐름에 이미 나온 기사는 빼서 두 블록이 같은 링크를 되풀이하지 않게 한다. */
  const relatedItems = selectRelatedArticles(
    allNews,
    article,
    timeline.map((item) => item.slug),
  );
  /* 기사에 나온 도구·용어를 우리 가이드와 잇는다 — 955건 전부에 즉시 적용된다. */
  const mentions = findMentions(article, toolsData.tools, glossaryData.terms);

  return (
    <>
      <PageViewTracker path={`/news/${params.slug}`} />
      <NewsArticleView lang="ko" article={article} relatedItems={relatedItems} timeline={timeline} mentions={mentions} />
    </>
  );
}
