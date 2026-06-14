'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ToolProficiency, ProficiencyLevel } from '@/lib/toolProficiency';

interface ToolProficiencyPanelProps {
  proficiencies: ToolProficiency[];
  onToolClick?: (toolSlug: string) => void;
}

const levelConfig: Record<ProficiencyLevel, { label: string; color: string; bgColor: string }> = {
  beginner: {
    label: '초보',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
  intermediate: {
    label: '중급',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  advanced: {
    label: '고급',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
};

const levelBarColor: Record<ProficiencyLevel, string> = {
  beginner: 'bg-gray-400',
  intermediate: 'bg-blue-500',
  advanced: 'bg-green-500',
};

export default function ToolProficiencyPanel({
  proficiencies,
  onToolClick,
}: ToolProficiencyPanelProps) {
  const [expandedTool, setExpandedTool] = useState<string | null>(null);

  if (proficiencies.length === 0) {
    return null;
  }

  const handleToolClick = (toolSlug: string): void => {
    setExpandedTool((prev) => (prev === toolSlug ? null : toolSlug));
    onToolClick?.(toolSlug);
  };

  return (
    <section>
      <h2 className="text-lg font-bold text-gray-900 mb-4">도구별 숙련도</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {proficiencies.map((prof) => {
          const config = levelConfig[prof.level];
          const barColor = levelBarColor[prof.level];
          const percentage = prof.totalGuides > 0
            ? Math.round((prof.completedGuides / prof.totalGuides) * 100)
            : 0;
          const isExpanded = expandedTool === prof.toolSlug;

          return (
            <div key={prof.toolSlug} className="flex flex-col">
              <button
                type="button"
                onClick={() => handleToolClick(prof.toolSlug)}
                className={`bg-white border rounded-xl p-4 text-left transition-all focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                  isExpanded
                    ? 'border-blue-300 shadow-sm'
                    : 'border-gray-100 hover:border-blue-200 hover:shadow-sm'
                }`}
                aria-expanded={isExpanded}
                aria-controls={`tool-${prof.toolSlug}-detail`}
              >
                <div className="flex flex-col gap-1 mb-2">
                  <span className="font-bold text-gray-900 text-sm truncate">{prof.toolName}</span>
                  <span className={`self-start px-2 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
                    {config.label}
                  </span>
                </div>
                <div
                  className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2"
                  role="progressbar"
                  aria-valuenow={percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${prof.toolName} 진행률 ${percentage}%`}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {prof.completedGuides}/{prof.totalGuides} 완료
                </p>
              </button>

              {/* 다음 추천 가이드 (인라인 펼침) */}
              {isExpanded && prof.nextGuide && (
                <div
                  id={`tool-${prof.toolSlug}-detail`}
                  className="mt-1"
                >
                  <Link
                    href={`/situations/${prof.nextGuide.slug}`}
                    className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg hover:border-blue-200 transition-all"
                  >
                    <span className="text-base" aria-hidden="true">{prof.nextGuide.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {prof.nextGuide.title}
                      </p>
                      <p className="text-xs text-blue-600">다음 도전</p>
                    </div>
                    <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}

              {isExpanded && !prof.nextGuide && (
                <div
                  id={`tool-${prof.toolSlug}-detail`}
                  className="mt-1 p-3 bg-green-50 border border-green-100 rounded-lg"
                >
                  <p className="text-xs text-green-700">
                    이 도구의 모든 가이드를 완료했어요!
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
