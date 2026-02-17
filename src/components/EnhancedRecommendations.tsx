'use client';

import Link from 'next/link';
import type { EnhancedRecommendation } from '@/lib/recommendations';

interface EnhancedRecommendationsProps {
  deepen: EnhancedRecommendation[];
  explore: EnhancedRecommendation[];
  allCompleted: boolean;
}

const difficultyLabels: Record<string, { text: string; color: string }> = {
  easy: { text: '쉬움', color: 'bg-green-100 text-green-700' },
  medium: { text: '보통', color: 'bg-yellow-100 text-yellow-700' },
  hard: { text: '어려움', color: 'bg-red-100 text-red-700' },
};

function RecommendationCard({ rec }: { rec: EnhancedRecommendation }) {
  const diff = difficultyLabels[rec.situation.difficulty];

  return (
    <Link
      href={`/situations/${rec.situation.slug}`}
      className="block bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-blue-200 transition-all group"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl" aria-hidden="true">{rec.situation.icon}</span>
        {diff && (
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${diff.color}`}>
            {diff.text}
          </span>
        )}
      </div>
      <h3 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors mb-1">
        {rec.situation.title}
      </h3>
      <p className="text-xs text-gray-500 mb-3">{rec.situation.subtitle}</p>
      <p className="text-xs text-blue-600 font-medium mb-1">{rec.context}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{rec.situation.timeToComplete}</span>
        <span className="text-xs text-blue-500 font-medium group-hover:text-blue-600 group-hover:translate-x-1 transition-all">
          시작하기 →
        </span>
      </div>
    </Link>
  );
}

export default function EnhancedRecommendations({
  deepen,
  explore,
  allCompleted,
}: EnhancedRecommendationsProps) {
  // 전체 완료 시 축하 메시지
  if (allCompleted) {
    return (
      <section className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 text-center">
        <span className="text-4xl block mb-2" aria-hidden="true">🎉</span>
        <h2 className="text-xl font-bold text-gray-900 mb-1">모든 가이드를 완료했어요!</h2>
        <p className="text-gray-600 text-sm">
          대단해요! 모든 상황 가이드를 마스터했습니다.
        </p>
      </section>
    );
  }

  const hasDeepen = deepen.length > 0;
  const hasExplore = explore.length > 0;

  if (!hasDeepen && !hasExplore) {
    return null;
  }

  return (
    <section>
      <h2 className="text-lg font-bold text-gray-900 mb-4">다음에 도전해보세요</h2>

      {/* 더 깊이 배우기 트랙 */}
      {hasDeepen && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm" aria-hidden="true">🎯</span>
            <h3 className="text-sm font-bold text-gray-700">더 깊이 배우기</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {deepen.map((rec) => (
              <RecommendationCard key={rec.situation.slug} rec={rec} />
            ))}
          </div>
        </div>
      )}

      {/* 새로운 영역 탐색 트랙 */}
      {hasExplore && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm" aria-hidden="true">🧭</span>
            <h3 className="text-sm font-bold text-gray-700">새로운 영역 탐색</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {explore.map((rec) => (
              <RecommendationCard key={rec.situation.slug} rec={rec} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
