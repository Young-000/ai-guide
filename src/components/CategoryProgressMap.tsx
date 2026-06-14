'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { CategoryProgress } from '@/lib/categoryProgress';
import type { SituationCategory } from '@/types';

interface CategoryProgressMapProps {
  categoryProgress: CategoryProgress[];
  onCategoryClick?: (categoryId: SituationCategory) => void;
}

const difficultyLabels: Record<string, { text: string; color: string }> = {
  easy: { text: '쉬움', color: 'bg-green-100 text-green-700' },
  medium: { text: '보통', color: 'bg-yellow-100 text-yellow-700' },
  hard: { text: '어려움', color: 'bg-red-100 text-red-700' },
};

export default function CategoryProgressMap({
  categoryProgress,
  onCategoryClick,
}: CategoryProgressMapProps) {
  const [expandedCategory, setExpandedCategory] = useState<SituationCategory | null>(null);

  const handleCategoryClick = (categoryId: SituationCategory): void => {
    setExpandedCategory((prev) => (prev === categoryId ? null : categoryId));
    onCategoryClick?.(categoryId);
  };

  return (
    <section>
      <h2 className="text-lg font-bold text-gray-900 mb-4">학습 맵</h2>
      <div className="space-y-2">
        {categoryProgress.map((cp) => {
          const isExpanded = expandedCategory === cp.categoryId;
          const isComplete = cp.percentage === 100;
          const isEmpty = cp.percentage === 0;

          return (
            <div key={cp.categoryId}>
              <button
                type="button"
                onClick={() => handleCategoryClick(cp.categoryId)}
                className={`w-full text-left p-4 rounded-xl border transition-all focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                  isComplete
                    ? 'bg-green-50 border-green-200 hover:border-green-300'
                    : isEmpty
                      ? 'bg-gray-50 border-gray-100 hover:border-gray-200'
                      : 'bg-white border-gray-100 hover:border-blue-200'
                }`}
                aria-expanded={isExpanded}
                aria-controls={`category-${cp.categoryId}-list`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg" aria-hidden="true">{cp.categoryIcon}</span>
                    <span className="font-medium text-gray-900 text-sm">{cp.categoryName}</span>
                    {isComplete && (
                      <span className="text-green-500" aria-label="완료">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {cp.completedCount}/{cp.totalCount}
                    </span>
                    <span className="text-xs font-medium text-gray-600">
                      {cp.percentage}%
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div
                  className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={cp.percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${cp.categoryName} 진행률 ${cp.percentage}%`}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isComplete
                        ? 'bg-green-500'
                        : isEmpty
                          ? 'bg-gray-300'
                          : 'bg-blue-500'
                    }`}
                    style={{ width: `${cp.percentage}%` }}
                  />
                </div>
                {isEmpty && (
                  <p className="text-xs text-gray-400 mt-1">아직 시작하지 않았어요</p>
                )}
              </button>

              {/* 미완료 상황 리스트 (아코디언) */}
              {isExpanded && cp.remainingSituations.length > 0 && (
                <div
                  id={`category-${cp.categoryId}-list`}
                  className="ml-4 mt-1 mb-2 space-y-1"
                >
                  {cp.remainingSituations.map((situation) => {
                    const diff = difficultyLabels[situation.difficulty];
                    return (
                      <Link
                        key={situation.slug}
                        href={`/situations/${situation.slug}`}
                        className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:border-blue-200 transition-all"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base" aria-hidden="true">{situation.icon}</span>
                          <span className="text-sm text-gray-900 truncate">{situation.title}</span>
                          {diff && (
                            <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${diff.color}`}>
                              {diff.text}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {situation.timeToComplete}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}

              {isExpanded && cp.remainingSituations.length === 0 && (
                <div
                  id={`category-${cp.categoryId}-list`}
                  className="ml-4 mt-1 mb-2 p-3 bg-green-50 border border-green-100 rounded-lg"
                >
                  <p className="text-sm text-green-700">
                    이 카테고리의 모든 가이드를 완료했어요!
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
