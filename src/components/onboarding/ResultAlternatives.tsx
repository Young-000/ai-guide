'use client';

import type { RecommendedToolResult } from '@/types/onboarding';
import { getToolLink } from '@/lib/onboardingEngine';
import { trackToolClick } from '@/lib/analytics';

interface ResultAlternativesProps {
  alternatives: RecommendedToolResult[];
}

export default function ResultAlternatives({ alternatives }: ResultAlternativesProps): JSX.Element {
  if (alternatives.length === 0) return <div />;

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-3">
        다른 선택지도 있어요
      </h2>
      <div className="space-y-2">
        {alternatives.map((alt) => {
          const toolLink = getToolLink(alt.tool);
          return (
            <div
              key={alt.tool.slug}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-200 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-2xl flex-shrink-0">{alt.tool.icon ?? '🤖'}</span>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-gray-900 text-sm block">
                    {alt.tool.name}
                  </span>
                  <span className="text-xs text-gray-500 block line-clamp-2">
                    {alt.reason}
                  </span>
                </div>
              </div>
              <a
                href={toolLink}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-3 flex-shrink-0 text-blue-500 hover:text-blue-600 text-sm font-medium whitespace-nowrap"
                onClick={() => trackToolClick(alt.tool.name, 'onboarding-result')}
              >
                시작하기 &rarr;
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
