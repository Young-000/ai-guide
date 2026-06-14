import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AdUnit from '@/components/AdUnit';
import ArticleJsonLd from './ArticleJsonLd';
import { BASE_URL } from '@/lib/site';
import type { NewsArticle, NewsLang } from '@/types/news';

type NewsArticleViewProps = {
  lang: NewsLang;
  article: NewsArticle;
};

const NEWS_AD_SLOT = process.env.NEXT_PUBLIC_ADSENSE_NEWS_SLOT;

const COPY: Record<NewsLang, { back: string; backHref: string; sources: string }> = {
  ko: { back: '← 뉴스 목록', backHref: '/news', sources: '출처' },
  en: { back: '← All news', backHref: '/en/news', sources: 'Sources' },
};

export default function NewsArticleView({ lang, article }: NewsArticleViewProps): JSX.Element {
  const copy = COPY[lang];
  const url = lang === 'ko' ? `${BASE_URL}/news/${article.slug}` : `${BASE_URL}/en/news/${article.slug}`;

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      <ArticleJsonLd article={article} url={url} />

      <Link href={copy.backHref} className="text-sm text-blue-500 hover:text-blue-600">
        {copy.back}
      </Link>

      <header className="mt-4">
        <time dateTime={article.date} className="text-sm text-gray-500">
          {article.date}
        </time>
        <h1 className="mt-1 text-3xl font-bold text-gray-900 leading-tight">{article.title}</h1>
      </header>

      <div className="prose prose-gray max-w-none mt-6">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.body}</ReactMarkdown>
      </div>

      {NEWS_AD_SLOT && (
        <AdUnit slot={NEWS_AD_SLOT} format="auto" className="my-8" dataPage="news" />
      )}

      {article.sources.length > 0 && (
        <footer className="mt-10 border-t border-gray-100 pt-4">
          <h2 className="text-sm font-semibold text-gray-700">{copy.sources}</h2>
          <ul className="mt-2 space-y-1">
            {article.sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-sm text-blue-500 hover:text-blue-600 break-all"
                >
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
        </footer>
      )}
    </article>
  );
}
