import Link from 'next/link';
import type { Situation } from '@/types';

const difficultyStyles: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
};

const difficultyLabels: Record<string, string> = {
  easy: '쉬움',
  medium: '보통',
  hard: '어려움',
};

interface SituationCardCompactProps {
  situation: Situation;
}

export default function SituationCardCompact({
  situation,
}: SituationCardCompactProps): JSX.Element {
  const primaryTool = situation.recommendedTools.find((t) => t.isPrimary);

  return (
    <Link
      href={`/situations/${situation.slug}`}
      className="block bg-white border border-gray-100 rounded-2xl p-6 hover:border-blue-200 hover:shadow-md transition-all group"
    >
      {/* Icon + Title */}
      <div className="flex items-start gap-3 mb-3">
        <span className="text-3xl flex-shrink-0" aria-hidden="true">
          {situation.icon}
        </span>
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
          {situation.title}
        </h3>
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {primaryTool && (
          <span className="inline-flex items-center gap-1 text-gray-500">
            <span className="text-blue-500" aria-hidden="true">
              🏆
            </span>
            {primaryTool.name}
          </span>
        )}
        <span
          className={`px-2 py-0.5 font-medium rounded-full ${difficultyStyles[situation.difficulty]}`}
        >
          {difficultyLabels[situation.difficulty]}
        </span>
        <span className="inline-flex items-center gap-1 text-gray-500">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {situation.timeToComplete}
        </span>
      </div>
    </Link>
  );
}
