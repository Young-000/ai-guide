import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AdUnit from '@/components/AdUnit';
import AdFitUnit from '@/components/AdFitUnit';
import ArticleJsonLd from './ArticleJsonLd';
import ShareRow from './ShareRow';
import ArticleViewTracker from './ArticleViewTracker';
import SubscribeBox from '@/components/SubscribeBox';
import CoupangBanner from '@/components/CoupangBanner';
import NewsCard from './NewsCard';
import { BASE_URL } from '@/lib/site';
import type { NewsArticle, NewsLang, NewsMeta } from '@/types/news';
import type { ToolLike, TermLike } from '@/lib/article-mentions';

type NewsArticleViewProps = {
  lang: NewsLang;
  article: NewsArticle;
  relatedItems?: readonly NewsMeta[];
  /** 이 사건이 놓인 흐름 — buildStoryTimeline() 이 만든다. */
  timeline?: readonly NewsMeta[];
  /** 기사에 나온 도구·용어 — findMentions() 가 찾는다. */
  mentions?: { tools: ToolLike[]; terms: TermLike[] };
};

const NEWS_AD_SLOT = process.env.NEXT_PUBLIC_ADSENSE_NEWS_SLOT;

const COPY: Record<
  NewsLang,
  {
    back: string;
    backHref: string;
    sources: string;
    related: string;
    timeline: string;
    mentioned: string;
    termsLabel: string;
    updated: string;
    guideTitle: string;
    guideBody: string;
    guideCta: string;
    recommendCta: string;
  }
> = {
  ko: {
    back: '뉴스 목록',
    backHref: '/news',
    sources: '출처',
    related: '관련 기사',
    timeline: '이 이야기의 흐름',
    mentioned: '기사에 나온 도구',
    termsLabel: '모르는 말이 있다면',
    updated: '최종 업데이트',
    guideTitle: 'AI를 직접 써보고 싶다면',
    guideBody: '상황별 AI 활용 가이드에서 바로 따라 할 수 있는 프롬프트와 도구를 찾아보세요.',
    guideCta: 'AI 활용 가이드 보기',
    recommendCta: '나에게 맞는 AI 찾기',
  },
  en: {
    back: 'All news',
    backHref: '/en/news',
    sources: 'Sources',
    related: 'Related articles',
    timeline: 'How this story unfolded',
    mentioned: 'Tools in this story',
    termsLabel: 'Terms explained',
    updated: 'Last updated',
    guideTitle: 'Want to try AI yourself?',
    guideBody: 'Explore step-by-step guides with ready-to-use prompts and tools.',
    guideCta: 'Browse AI guides',
    recommendCta: 'Find the right AI for you',
  },
};

export default function NewsArticleView({
  lang,
  article,
  relatedItems = [],
  timeline = [],
  mentions = { tools: [], terms: [] },
}: NewsArticleViewProps): JSX.Element {
  const copy = COPY[lang];
  const url =
    lang === 'ko'
      ? `${BASE_URL}/news/${article.slug}`
      : `${BASE_URL}/en/news/${article.slug}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <ArticleJsonLd article={article} url={url} />
      <ArticleViewTracker slug={article.slug} lang={lang} />

      {/* Back link */}
      <Link
        href={copy.backHref}
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
      >
        {/* Arrow left */}
        <svg
          className="w-4 h-4"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        {copy.back}
      </Link>

      {/* Article */}
      <article className="mt-6 max-w-2xl">
        <header>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <time
              dateTime={article.date}
              className="text-xs font-semibold text-blue-600 uppercase tracking-wider"
            >
              {article.date}
            </time>
            {article.dateModified && article.dateModified !== article.date && (
              <span className="text-xs text-slate-500">
                {copy.updated}: {article.dateModified}
              </span>
            )}
          </div>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
            {article.title}
          </h1>

          {/* Tags — click to /news/topic/[tag] */}
          {article.tags.length > 0 && (
            <ul
              className="mt-4 flex flex-wrap gap-2"
              aria-label={lang === 'ko' ? '태그' : 'tags'}
            >
              {article.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    href={`/news/topic/${encodeURIComponent(tag)}`}
                    className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition-colors"
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </header>

        <ShareRow title={article.title} summary={article.summary} url={url} lang={lang} />

        {/*
          Article body — custom typography via Tailwind arbitrary variants.
          NOTE: @tailwindcss/typography plugin is NOT installed in this project,
          so the 'prose' class has no effect. We style markdown output directly.
        */}
        <div
          className={[
            'mt-8 text-slate-800 text-base leading-7 space-y-4',
            '[&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-8 [&_h2]:mb-3',
            '[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-900 [&_h3]:mt-6 [&_h3]:mb-2',
            '[&_p]:leading-7',
            '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1',
            '[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1',
            '[&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-700',
            '[&_strong]:font-semibold [&_strong]:text-slate-900',
            '[&_blockquote]:border-l-4 [&_blockquote]:border-slate-200 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-600',
            '[&_code]:bg-slate-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono',
            '[&_pre]:bg-slate-100 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0',
            '[&_hr]:border-slate-200 [&_hr]:my-6',
          ].join(' ')}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.body}</ReactMarkdown>
        </div>

        {/*
          🔴 이 사건이 놓인 흐름 (2026-09-26 신설).

          기사 본문이 785자(중앙값)라 원문에 없는 가치가 없었다. 외신은 개별 사건만
          전하지만 우리에겐 955건의 아카이브가 있다 — "6월 수출 금지 → 7월 해제 →
          9월 이 발견" 처럼 흐름을 보여주는 것이 우리만 할 수 있는 일이다.
          본문 바로 뒤에 둔다: 다 읽은 직후가 "그래서 그 다음은?"이 생기는 자리다.
        */}
        {timeline.length > 0 && (
          <section aria-labelledby="timeline-heading" className="mt-10 rounded-xl bg-slate-50 p-5">
            <h2 id="timeline-heading" className="text-sm font-semibold uppercase tracking-wider text-slate-600">
              {copy.timeline}
            </h2>
            <ol className="mt-4 space-y-3">
              {timeline.map((item) => (
                <li key={item.slug} className="flex gap-3 text-sm">
                  <time dateTime={item.date} className="shrink-0 tabular-nums text-slate-400">
                    {item.date.slice(5).replace('-', '.')}
                  </time>
                  <Link
                    href={`${copy.backHref}/${item.slug}`}
                    className="text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-blue-600"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/*
          🔴 기사에 나온 도구·용어를 우리 가이드와 잇는다 (2026-09-26).

          본문이 785자(중앙값)라 원문에 없는 가치가 없었는데, 이 사이트에는 도구 21개·
          용어 18개의 가이드가 이미 있고 기사와 이어져 있지 않았다. 용어는 링크로
          떠넘기지 않고 **정의를 그 자리에 한 줄** 보여준다 (ux-baseline 원칙 4).
        */}
        {(mentions.tools.length > 0 || mentions.terms.length > 0) && (
          <section aria-labelledby="mentions-heading" className="mt-6 border-t border-slate-200 pt-6">
            {mentions.tools.length > 0 && (
              <>
                <h2 id="mentions-heading" className="text-sm font-semibold uppercase tracking-wider text-slate-600">
                  {copy.mentioned}
                </h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {mentions.tools.map((tool) => (
                    <li key={tool.slug}>
                      <Link
                        href={`/tools/${tool.slug}`}
                        className="inline-flex items-baseline gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 transition-colors hover:border-blue-400 hover:text-blue-600"
                      >
                        <span className="font-medium">{tool.name}</span>
                        {tool.tagline && <span className="text-xs text-slate-400">{tool.tagline}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {mentions.terms.length > 0 && (
              <dl className="mt-4 space-y-1.5">
                {mentions.terms.map((term) => (
                  <div key={term.slug} className="text-sm">
                    <dt className="inline font-medium text-slate-700">{term.term}</dt>
                    <dd className="inline text-slate-500"> — {term.definition}</dd>
                  </div>
                ))}
              </dl>
            )}
          </section>
        )}

        {/* Ad slot */}
        {NEWS_AD_SLOT && (
          <AdUnit slot={NEWS_AD_SLOT} format="auto" className="my-8" dataPage="news" />
        )}
        {/* Kakao AdFit — self-gates on the slot env; renders nothing until set */}
        <AdFitUnit slot="rect" className="my-8 flex justify-center" />
        <AdFitUnit slot="sky" className="hidden 2xl:block fixed right-6 top-28 z-20" />

        {/* Sources */}
        {article.sources.length > 0 && (
          <footer className="mt-10 pt-6 border-t border-slate-200">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
              {copy.sources}
            </h2>
            <ul className="mt-3 space-y-1.5">
              {article.sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-sm text-blue-600 hover:text-blue-700 underline break-all transition-colors"
                  >
                    {source.title}
                  </a>
                </li>
              ))}
            </ul>
          </footer>
        )}
      </article>

      {/*
        Coupang Partners — 한국어 독자에게만, 기사가 끝난 뒤에. 본문 안에는 절대 넣지 않는다:
        우리 기사는 편집물이고, 읽는 흐름에 끼워 넣은 광고는 우리가 그 상품을 추천하는
        것처럼 읽힌다.

        🔴 위치를 올렸다 (2026-09-26). 전에는 관련 기사보다 **아래**, 페이지 맨 끝이었다.
        거기까지 스크롤하는 사람이 거의 없어 노출 자체가 일어나지 않았다. 쿠팡은 지금
        승인돼 작동하는 유일한 수익 경로라(AdSense 는 unfilled, AdFit 은 하우스 광고),
        노출이 0이면 수익도 0이다. 기사 본문 직후로 올리되 원칙은 그대로다.
      */}
      {lang === 'ko' && <CoupangBanner subId="aiwire-article" />}

      {/* Contextual cross-link: news → usage guides (internal linking) */}
      <aside
        aria-labelledby="article-guide-cta-heading"
        className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6"
      >
        <h2
          id="article-guide-cta-heading"
          className="text-lg font-bold text-slate-900"
        >
          {copy.guideTitle}
        </h2>
        <p className="mt-1.5 text-sm text-slate-600">{copy.guideBody}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/learn"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            {copy.guideCta}
          </Link>
          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-white"
          >
            {copy.recommendCta}
          </Link>
        </div>
      </aside>

      {/* Related articles */}
      {relatedItems.length > 0 && (
        <section
          aria-labelledby="related-heading"
          className="mt-12 pt-8 border-t border-slate-200"
        >
          <h2 id="related-heading" className="text-xl font-bold text-slate-900 mb-5">
            {copy.related}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedItems.map((item) => (
              <NewsCard key={item.slug} lang={lang} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Subscribe */}
      <section
        aria-labelledby="article-subscribe-heading"
        className="mt-12 py-10 border-t border-slate-200"
      >
        <p id="article-subscribe-heading" className="sr-only">
          뉴스레터 구독
        </p>
        <SubscribeBox />
      </section>
    </div>
  );
}
