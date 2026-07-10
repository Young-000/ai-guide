import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllNews, getArchiveMonths, getNewsByYearMonth } from '@/lib/news';
import NewsCard from '@/components/news/NewsCard';
import { BASE_URL } from '@/lib/site';

type Params = { year: string; month: string };

export function generateStaticParams(): Params[] {
  return getArchiveMonths('ko');
}

function formatYearMonth(year: string, month: string): string {
  return `${year}년 ${parseInt(month, 10)}월`;
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const { year, month } = params;
  const label = formatYearMonth(year, month);
  const canonical = `${BASE_URL}/news/archive/${year}/${month}`;
  return {
    title: `${label} AI 뉴스 | AIWire`,
    description: `${label}에 발행된 AI·LLM 뉴스를 한눈에 모아봅니다.`,
    alternates: { canonical },
  };
}

export default function ArchivePage({ params }: { params: Params }): JSX.Element {
  const { year, month } = params;

  const validMonths = getArchiveMonths('ko');
  const isValid = validMonths.some((m) => m.year === year && m.month === month);
  if (!isValid) notFound();

  const items = getNewsByYearMonth('ko', year, month);
  const label = formatYearMonth(year, month);
  const canonical = `${BASE_URL}/news/archive/${year}/${month}`;

  // Adjacent months for navigation
  const idx = validMonths.findIndex((m) => m.year === year && m.month === month);
  const prevMonth = idx > 0 ? validMonths[idx - 1] : null;
  const nextMonth = idx < validMonths.length - 1 ? validMonths[idx + 1] : null;

  // Unique years for cross-links
  const allNews = getAllNews('ko');
  const yearGroups = Array.from(new Set(allNews.map((a) => a.date.slice(0, 4)))).sort().reverse();

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `${label} AI 뉴스 | AIWire`,
            url: canonical,
            description: `${label}에 발행된 AI·LLM 뉴스 아카이브`,
          }),
        }}
      />

      {/* Back link */}
      <Link
        href="/news"
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
      >
        <svg
          className="h-4 w-4"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        전체 뉴스
      </Link>

      <h1 className="mt-5 text-3xl font-bold text-slate-900">
        <span className="text-blue-600">{label}</span> 뉴스
      </h1>
      <p className="mt-1 text-sm text-slate-500">{items.length}건의 기사</p>

      {items.length === 0 ? (
        <p className="mt-10 text-slate-500">이 기간의 기사가 없습니다.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <NewsCard key={item.slug} lang="ko" item={item} />
          ))}
        </div>
      )}

      {/* Month navigation */}
      <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-6">
        {nextMonth ? (
          <Link
            href={`/news/archive/${nextMonth.year}/${nextMonth.month}`}
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            <svg className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {formatYearMonth(nextMonth.year, nextMonth.month)}
          </Link>
        ) : (
          <span />
        )}
        {prevMonth && (
          <Link
            href={`/news/archive/${prevMonth.year}/${prevMonth.month}`}
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            {formatYearMonth(prevMonth.year, prevMonth.month)}
            <svg className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>

      {/* Year index cross-links */}
      {yearGroups.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-200">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
            연도별 아카이브
          </h2>
          <ul className="flex flex-wrap gap-2">
            {yearGroups.map((y) => (
              <li key={y}>
                {/* Link to the earliest month of the year */}
                {(() => {
                  const firstMonth = validMonths
                    .slice()
                    .reverse()
                    .find((m) => m.year === y);
                  if (!firstMonth) return null;
                  return (
                    <Link
                      href={`/news/archive/${firstMonth.year}/${firstMonth.month}`}
                      className="inline-block rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:border-blue-400 hover:text-blue-600 transition-colors"
                    >
                      {y}년
                    </Link>
                  );
                })()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
