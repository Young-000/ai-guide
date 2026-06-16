'use client';

import type { Situation } from '@/types';

const difficultyStyles = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
};

const difficultyLabels = {
  easy: '쉬움',
  medium: '보통',
  hard: '어려움',
};

interface ResultCardProps {
  situation: Situation;
  isSelected: boolean;
  onClick: () => void;
  matchedKeywords?: string[];
}

export default function ResultCard({
  situation,
  isSelected,
  onClick,
  matchedKeywords = [],
}: ResultCardProps) {
  const primaryTool = situation.recommendedTools.find((t) => t.isPrimary);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full text-left p-4 rounded-xl border-2 transition-all duration-200
        ${
          isSelected
            ? 'border-blue-500 bg-blue-50 shadow-md'
            : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* 아이콘 */}
        <span className="text-3xl flex-shrink-0">{situation.icon}</span>

        <div className="flex-1 min-w-0">
          {/* 제목 & 난이도 */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-900 truncate">{situation.title}</h3>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${difficultyStyles[situation.difficulty]}`}
            >
              {difficultyLabels[situation.difficulty]}
            </span>
          </div>

          {/* 부제목 */}
          <p className="text-sm text-gray-500 mb-2 line-clamp-1">{situation.subtitle}</p>

          {/* 추천 도구 & 소요시간 */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {primaryTool && (
              <span className="flex items-center gap-1">
                <span className="text-blue-500">🏆</span>
                {primaryTool.name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          {/* 매칭된 키워드 (검색 결과일 때만) */}
          {matchedKeywords.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {matchedKeywords.slice(0, 3).map((keyword, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 선택 표시 화살표 */}
        <svg
          className={`w-5 h-5 flex-shrink-0 transition-colors ${isSelected ? 'text-blue-500' : 'text-gray-300'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
