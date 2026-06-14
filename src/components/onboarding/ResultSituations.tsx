'use client';

import Link from 'next/link';
import type { Situation } from '@/types';

interface ResultSituationsProps {
  situations: Situation[];
  recommendedSituation: Situation | null;
}

export default function ResultSituations({
  situations,
  recommendedSituation,
}: ResultSituationsProps): JSX.Element {
  // Combine recommended + related, deduplicated
  const allSituations: Situation[] = [];
  if (recommendedSituation) {
    allSituations.push(recommendedSituation);
  }
  for (const s of situations) {
    if (!allSituations.find(existing => existing.slug === s.slug)) {
      allSituations.push(s);
    }
  }

  if (allSituations.length === 0) return <div />;

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-3">
        이런 것도 해볼 수 있어요
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {allSituations.slice(0, 4).map((situation) => (
          <Link
            key={situation.slug}
            href={`/situations/${situation.slug}`}
            className="group p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{situation.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                  {situation.title}
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-gray-500">
                    {situation.timeToComplete}
                  </span>
                  <span className="text-xs text-gray-300">|</span>
                  <span className="text-xs text-gray-500">
                    {situation.difficulty === 'easy'
                      ? '쉬움'
                      : situation.difficulty === 'medium'
                      ? '보통'
                      : '어려움'}
                  </span>
                </div>
              </div>
              <svg
                className="w-4 h-4 text-gray-400 group-hover:text-blue-500 flex-shrink-0 mt-1 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
