'use client';

import { useState } from 'react';
import Link from 'next/link';
import situationsData from '@/data/situations.json';

type SituationCategory = 'all' | 'work' | 'study' | 'coding' | 'design' | 'content' | 'research';

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface RecommendedTool {
  slug: string;
  name: string;
  reason: string;
  isPrimary: boolean;
}

interface Situation {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  icon: string;
  problem: string;
  recommendedTools: RecommendedTool[];
  timeToComplete: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const difficultyLabels = {
  easy: { text: '쉬움', color: 'bg-green-100 text-green-700' },
  medium: { text: '보통', color: 'bg-yellow-100 text-yellow-700' },
  hard: { text: '어려움', color: 'bg-red-100 text-red-700' },
};

export default function SituationsPage() {
  const [selectedCategory, setSelectedCategory] = useState<SituationCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = situationsData.categories as Category[];
  const situations = situationsData.situations as Situation[];

  const filteredSituations = situations.filter((situation) => {
    const matchesCategory = selectedCategory === 'all' || situation.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      situation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      situation.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      situation.problem.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          이런 상황엔 이 AI
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          상황을 선택하면 가장 적합한 AI 도구와 사용법을 알려드려요.
          <br />
          복잡한 도구 비교 없이, 바로 해결책을 찾아보세요.
        </p>
      </header>

      {/* 검색 */}
      <div className="relative max-w-xl mx-auto mb-8">
        <input
          type="text"
          placeholder="어떤 상황인가요? (예: PDF 요약, 코드 에러...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-5 py-4 pl-12 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full font-medium transition-all ${
            selectedCategory === 'all'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          전체
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id as SituationCategory)}
            className={`px-4 py-2 rounded-full font-medium transition-all flex items-center gap-1 ${
              selectedCategory === category.id
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* 상황 카드 목록 */}
      {filteredSituations.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSituations.map((situation) => {
            const primaryTool = situation.recommendedTools.find(t => t.isPrimary);
            const difficulty = difficultyLabels[situation.difficulty];

            return (
              <Link
                key={situation.slug}
                href={`/situations/${situation.slug}`}
                className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-blue-200 transition-all"
              >
                {/* 상단 태그 */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{situation.icon}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficulty.color}`}>
                    {difficulty.text}
                  </span>
                </div>

                {/* 제목 */}
                <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {situation.title}
                </h2>
                <p className="text-gray-500 text-sm mb-4">
                  {situation.subtitle}
                </p>

                {/* 추천 도구 */}
                {primaryTool && (
                  <div className="bg-blue-50 rounded-xl p-3 mb-4">
                    <p className="text-sm text-blue-800">
                      <span className="font-bold">추천:</span> {primaryTool.name}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {primaryTool.reason}
                    </p>
                  </div>
                )}

                {/* 소요 시간 */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>예상 소요: {situation.timeToComplete}</span>
                  <span className="text-blue-500 font-medium group-hover:translate-x-1 transition-transform">
                    자세히 보기 →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-400 text-5xl mb-4">🔍</p>
          <p className="text-gray-500 text-lg mb-2">검색 결과가 없습니다.</p>
          <p className="text-gray-400">다른 키워드로 검색해보세요.</p>
        </div>
      )}

      {/* 하단 CTA */}
      <section className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          찾는 상황이 없나요?
        </h2>
        <p className="text-gray-600 mb-6">
          AI 도구를 직접 비교하거나, 추천 테스트를 받아보세요.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/quiz"
            className="inline-block px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            AI 추천 테스트 →
          </Link>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-white text-gray-900 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            전체 도구 보기
          </Link>
        </div>
      </section>
    </div>
  );
}
