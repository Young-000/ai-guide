'use client';

import type { Tool, Situation } from '@/types';
import { getToolLink } from '@/lib/onboardingEngine';
import { trackToolClick } from '@/lib/analytics';

interface ResultPrimaryCardProps {
  tool: Tool;
  reason: string;
  situation: Situation;
}

export default function ResultPrimaryCard({
  tool,
  reason,
  situation,
}: ResultPrimaryCardProps): JSX.Element {
  const toolLink = getToolLink(tool);

  return (
    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <span className="text-4xl sm:text-5xl">{tool.icon ?? '🤖'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">BEST</span>
            <h3 className="text-xl sm:text-2xl font-bold">{tool.name}</h3>
          </div>
          <p className="text-sm text-white/80 leading-relaxed">{reason}</p>
        </div>
      </div>

      {/* Info badges */}
      <div className="flex flex-wrap gap-2 mb-5">
        {tool.pricing.free && (
          <span className="inline-flex items-center gap-1 text-xs bg-white/15 px-2.5 py-1 rounded-full">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            무료로 시작 가능
          </span>
        )}
        <span className="inline-flex items-center gap-1 text-xs bg-white/15 px-2.5 py-1 rounded-full">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {situation.timeToComplete}
        </span>
        <span className="inline-flex items-center gap-1 text-xs bg-white/15 px-2.5 py-1 rounded-full">
          {situation.difficulty === 'easy' ? '쉬움' : situation.difficulty === 'medium' ? '보통' : '어려움'}
        </span>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={toolLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors text-sm"
          onClick={() => trackToolClick(tool.name, 'onboarding-result')}
        >
          {tool.name} 시작하기
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
        <a
          href={`/situations/${situation.slug}`}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-white/15 text-white font-bold rounded-xl hover:bg-white/25 transition-colors text-sm border border-white/20"
        >
          가이드 보기
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
}
