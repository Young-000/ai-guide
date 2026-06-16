'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import tipsData from '@/data/tips.json';
import type { Tip, TipCategory } from '@/types';
import { getToolBySlug } from '@/lib/tools';

const tips = tipsData.tips as Tip[];

const categoryFilters: { id: TipCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: '전체', icon: '' },
  ...tipsData.categories.map((c) => ({
    id: c.id as TipCategory,
    label: c.name,
    icon: c.icon,
  })),
];

const difficultyLabels = {
  beginner: { text: '초급', color: 'bg-green-100 text-green-700' },
  intermediate: { text: '중급', color: 'bg-yellow-100 text-yellow-700' },
  advanced: { text: '고급', color: 'bg-red-100 text-red-700' },
};

export default function TipList(): React.ReactElement {
  const [selectedCategory, setSelectedCategory] = useState<TipCategory | 'all'>('all');

  const filteredTips = useMemo(() => {
    if (selectedCategory === 'all') return tips;
    return tips.filter((tip) => tip.category === selectedCategory);
  }, [selectedCategory]);

  const resetFilters = (): void => {
    setSelectedCategory('all');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">AI 활용 팁</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          실전에서 바로 쓸 수 있는 AI 활용법을 모았습니다.
          <br />
          프롬프트 예시와 함께 따라해보세요.
        </p>
      </header>

      {/* Category filter chips */}
      <section className="mb-12" aria-label="카테고리 필터">
        <p className="text-sm text-gray-500 font-medium mb-2">카테고리별</p>
        <div className="flex flex-wrap gap-2">
          {categoryFilters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setSelectedCategory(filter.id)}
              aria-pressed={selectedCategory === filter.id}
              className={`px-4 py-2 rounded-full font-medium transition-all flex items-center gap-1 text-sm ${
                selectedCategory === filter.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.icon && <span>{filter.icon}</span>}
              <span>{filter.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Filter result count + clear */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">
          {filteredTips.length}개의 팁
        </p>
        {selectedCategory !== 'all' && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm text-blue-500 hover:text-blue-600 font-medium"
          >
            필터 초기화
          </button>
        )}
      </div>

      {/* Card grid */}
      {filteredTips.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTips.map((tip) => {
            const difficulty = difficultyLabels[tip.difficulty];
            const categoryInfo = tipsData.categories.find((c) => c.id === tip.category);
            const toolIcons = tip.relatedTools
              .map((slug) => getToolBySlug(slug))
              .filter((t): t is NonNullable<typeof t> => t !== undefined);

            return (
              <Link
                key={tip.slug}
                href={`/tips/${tip.slug}`}
                className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-blue-200 transition-all"
              >
                {/* Top row: category tag + difficulty */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    {categoryInfo?.icon} {categoryInfo?.name}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${difficulty.color}`}
                  >
                    {difficulty.text}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors leading-snug">
                  {tip.title}
                </h2>

                {/* Excerpt */}
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {tip.excerpt}
                </p>

                {/* Tool icons + read more */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1 min-w-0">
                    {toolIcons.slice(0, 3).map((tool) => (
                      <span key={tool.slug} title={tool.name} className="text-base flex-shrink-0">
                        {tool.icon}
                      </span>
                    ))}
                    {toolIcons.length > 3 && (
                      <span className="text-xs text-gray-400 ml-1">+{toolIcons.length - 3}</span>
                    )}
                  </div>
                  <span className="text-blue-500 font-medium group-hover:translate-x-1 transition-transform">
                    읽어보기 →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-400 text-5xl mb-4">🔍</p>
          <p className="text-gray-500 text-lg mb-2">해당 카테고리의 팁이 없습니다</p>
          <p className="text-gray-400 mb-6">다른 카테고리를 선택해보세요.</p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-5 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            필터 초기화
          </button>
        </div>
      )}

      {/* Bottom CTA */}
      <section className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          더 많은 AI 활용법이 궁금하다면?
        </h2>
        <p className="text-gray-600 mb-6">
          상황별 가이드를 따라하면 누구나 AI를 활용할 수 있어요.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/learn"
            className="inline-block px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            전체 학습 자료 보기 →
          </Link>
          <Link
            href="/situations"
            className="inline-block px-6 py-3 bg-white text-gray-900 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            상황별 가이드
          </Link>
        </div>
      </section>
    </div>
  );
}
