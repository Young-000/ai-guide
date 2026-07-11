import type { Metadata } from 'next';
import Link from 'next/link';
import { getArchiveMonths } from '@/lib/news';
import { BASE_URL } from '@/lib/site';

export function generateMetadata(): Metadata {
  return {
    title: '월별 아카이브 | AI 뉴스 | AIWire',
    description: '월별로 정리된 AI·LLM 뉴스 아카이브. 원하는 날짜의 AI 소식을 탐색하세요.',
    alternates: { canonical: `${BASE_URL}/news/archive` },
  };
}

function formatYearMonth(year: string, month: string): string {
  return `${year}년 ${parseInt(month, 10)}월`;
}

export default function ArchiveIndexPage(): JSX.Element {
  const months = getArchiveMonths('ko');

  const yearGroups = months.reduce<Record<string, { month: string }[]>>((acc, { year, month }) => {
    if (!acc[year]) acc[year] = [];
    acc[year].push({ month });
    return acc;
  }, {});

  const sortedYears = Object.keys(yearGroups).sort().reverse();

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: '월별 아카이브 | AI 뉴스 | AIWire',
            url: `${BASE_URL}/news/archive`,
            description: '월별로 정리된 AI·LLM 뉴스 아카이브',
          }),
        }}
      />

      {/* Back link */}
      <Link
        href="/news"
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
      >
        <svg className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        전체 뉴스
      </Link>

      <h1 className="mt-5 text-3xl font-bold text-slate-900">월별 아카이브</h1>
      <p className="mt-2 text-slate-600">{months.length}개월의 AI·LLM 뉴스를 탐색하세요.</p>

      {months.length === 0 ? (
        <p className="mt-10 text-slate-500">등록된 뉴스가 없습니다.</p>
      ) : (
        <div className="mt-8 space-y-8">
          {sortedYears.map((year) => (
            <div key={year}>
              <h2 className="mb-3 text-lg font-semibold text-slate-700">{year}년</h2>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label={`${year}년 아카이브`}>
                {yearGroups[year].map(({ month }) => (
                  <li key={month}>
                    <Link
                      href={`/news/archive/${year}/${month}`}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-white hover:border-blue-300 hover:shadow-sm transition-all duration-150 group"
                    >
                      <span className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                        {formatYearMonth(year, month)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
