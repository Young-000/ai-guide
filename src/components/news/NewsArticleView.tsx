import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AdUnit from '@/components/AdUnit';
import ArticleJsonLd from './ArticleJsonLd';
import ArticleViewTracker from './ArticleViewTracker';
import SubscribeBox from '@/components/SubscribeBox';
import NewsCard from './NewsCard';
import { BASE_URL } from '@/lib/site';
import type { NewsArticle, NewsLang, NewsMeta } from '@/types/news';

type NewsArticleViewProps = {
  lang: NewsLang;
  article: NewsArticle;
  relatedItems?: readonly NewsMeta[];
};

const NEWS_AD_SLOT = process.env.NEXT_PUBLIC_ADSENSE_NEWS_SLOT;

const COPY: Record<
  NewsLang,
  { back: string; backHref: string; sources: string; related: string }
> = {
  ko: { back: '뉴스 목록', backHref: '/news', sources: '출처', related: '관련 기사' },
  en: { back: 'All news', backHref: '/en/news', sources: 'Sources', related: 'Related articles' },
};

export default function NewsArticleView({
  lang,
  article,
  relatedItems = [],
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
          <time
            dateTime={article.date}
            className="text-xs font-semibold text-blue-600 uppercase tracking-wider"
          >
            {article.date}
          </time>
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

        {/* Ad slot */}
        {NEWS_AD_SLOT && (
          <AdUnit slot={NEWS_AD_SLOT} format="auto" className="my-8" dataPage="news" />
        )}

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
