import Link from 'next/link';
import type { Situation } from '@/types';
import situationsData from '@/data/situations.json';
import { getPopularSituations } from '@/lib/search';
import SituationCardCompact from '@/components/landing/SituationCardCompact';

const situations = situationsData.situations as Situation[];

type HomeGuideStripProps = {
  count?: number;
};

// Server-rendered strip of the most popular AI usage guides. Lighter than the
// interactive PopularSituationsSection — no client JS, just the top picks.
export default function HomeGuideStrip({
  count = 6,
}: HomeGuideStripProps): JSX.Element | null {
  const picks = getPopularSituations(situations, count);
  if (picks.length === 0) return null;

  return (
    <section
      aria-labelledby="home-guide-strip-heading"
      className="bg-slate-50 border-b border-slate-200 py-10 md:py-14"
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2
            id="home-guide-strip-heading"
            className="text-xl md:text-2xl font-bold text-slate-900"
          >
            지금 많이 찾는 AI 활용법
          </h2>
          <Link
            href="/learn"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            전체 보기
            <svg
              className="h-4 w-4"
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

        <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {picks.map((situation) => (
            <li key={situation.slug}>
              <SituationCardCompact situation={situation} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
