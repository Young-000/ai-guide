import Link from 'next/link';
import NewsCard from '@/components/news/NewsCard';
import type { NewsMeta } from '@/types/news';

type NewsGridProps = {
  items: readonly NewsMeta[];
};

export default function NewsGrid({ items }: NewsGridProps): JSX.Element | null {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="news-grid-heading">
      <div className="flex items-center justify-between mb-6">
        <h2 id="news-grid-heading" className="text-xl font-bold text-slate-900">
          최신 뉴스
        </h2>
        <Link
          href="/news"
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          전체 보기
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <NewsCard key={item.slug} lang="ko" item={item} />
        ))}
      </div>
    </section>
  );
}
