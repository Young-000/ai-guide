import { fetchTrendingKeywords, hottrendKeywordUrl } from '@/lib/trending';

type TrendingKeywordsProps = {
  // How many keywords to show. Defaults to 8.
  limit?: number;
  className?: string;
};

// Server component. Reads the latest KR trending search keywords from the
// shared search_trends DB and renders a "지금 뜨는 검색어" strip linking to the
// sister site hottrend.news. Fully fail-soft: on any error or empty data the
// fetch returns [] and we render nothing — the page never breaks.
export default async function TrendingKeywords({
  limit = 8,
  className,
}: TrendingKeywordsProps): Promise<JSX.Element | null> {
  const keywords = await fetchTrendingKeywords(limit);
  if (keywords.length === 0) return null;

  return (
    <section
      aria-labelledby="trending-keywords-heading"
      className={`rounded-xl border border-slate-200 bg-white p-5 ${className ?? ''}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span aria-hidden="true" className="text-base">
          🔥
        </span>
        <h2
          id="trending-keywords-heading"
          className="text-sm font-bold text-slate-900"
        >
          지금 뜨는 검색어
        </h2>
      </div>

      <ul className="flex flex-wrap gap-2">
        {keywords.map((item) => (
          <li key={item.keyword}>
            <a
              href={hottrendKeywordUrl(item.keyword)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <span className="text-xs font-bold text-slate-500">
                {item.rank}
              </span>
              {item.keyword}
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs text-slate-500">
        실시간 인기 검색어 · 제공{' '}
        <a
          href="https://hottrend.news?geo=KR"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-blue-700"
        >
          hottrend.news
        </a>
      </p>
    </section>
  );
}
