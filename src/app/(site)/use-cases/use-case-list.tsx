'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import useCasesData from '@/data/use-cases.json';
import situationsData from '@/data/situations.json';
import type { UseCaseStory, Profession } from '@/types';
import { getToolBySlug } from '@/lib/tools';

const useCases = useCasesData.useCases as UseCaseStory[];

const professionFilters: { id: Profession | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: '전체', icon: '' },
  { id: 'marketer', label: '마케터', icon: '📢' },
  { id: 'developer', label: '개발자', icon: '💻' },
  { id: 'designer', label: '디자이너', icon: '🎨' },
  { id: 'student', label: '학생', icon: '📚' },
  { id: 'office-worker', label: '직장인', icon: '💼' },
  { id: 'freelancer', label: '프리랜서', icon: '🏠' },
  { id: 'business-owner', label: '자영업자', icon: '🏪' },
];

const situationCategoryFilters: { id: string; label: string; icon: string }[] = [
  { id: 'all', label: '전체', icon: '' },
  ...situationsData.categories.map((c) => ({
    id: c.id,
    label: c.name,
    icon: c.icon,
  })),
];

const difficultyLabels = {
  easy: { text: '쉬움', color: 'bg-green-100 text-green-700' },
  medium: { text: '보통', color: 'bg-yellow-100 text-yellow-700' },
  hard: { text: '어려움', color: 'bg-red-100 text-red-700' },
};

function getSituationCategory(situationSlug: string): string | undefined {
  const situation = situationsData.situations.find((s) => s.slug === situationSlug);
  return situation?.category;
}

export default function UseCaseList(): React.ReactElement {
  const [selectedProfession, setSelectedProfession] = useState<Profession | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredUseCases = useMemo(() => {
    return useCases.filter((uc) => {
      const matchesProfession =
        selectedProfession === 'all' || uc.profession === selectedProfession;
      const matchesCategory =
        selectedCategory === 'all' ||
        getSituationCategory(uc.situation) === selectedCategory;
      return matchesProfession && matchesCategory;
    });
  }, [selectedProfession, selectedCategory]);

  const resetFilters = (): void => {
    setSelectedProfession('all');
    setSelectedCategory('all');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">AI 활용 사례</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          나와 비슷한 직업, 비슷한 상황의 사람들이 AI를 어떻게 활용하는지 확인하세요.
          <br />
          실제 사례에서 영감을 얻어 바로 적용해보세요.
        </p>
      </header>

      {/* Profession filter chips */}
      <section className="mb-4" aria-label="직업별 필터">
        <p className="text-sm text-gray-500 font-medium mb-2">직업별</p>
        <div className="flex flex-wrap gap-2">
          {professionFilters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setSelectedProfession(filter.id)}
              aria-pressed={selectedProfession === filter.id}
              className={`px-4 py-2 rounded-full font-medium transition-all flex items-center gap-1 text-sm ${
                selectedProfession === filter.id
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

      {/* Situation category filter chips */}
      <section className="mb-12" aria-label="상황별 필터">
        <p className="text-sm text-gray-500 font-medium mb-2">상황별</p>
        <div className="flex flex-wrap gap-2">
          {situationCategoryFilters.map((filter) => (
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
          {filteredUseCases.length}개의 사례
        </p>
        {(selectedProfession !== 'all' || selectedCategory !== 'all') && (
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
      {filteredUseCases.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUseCases.map((uc) => {
            const difficulty = difficultyLabels[uc.difficulty];
            const tool = getToolBySlug(uc.toolUsed);

            return (
              <Link
                key={uc.slug}
                href={`/use-cases/${uc.slug}`}
                className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-blue-200 transition-all"
              >
                {/* Top row: profession tag + difficulty */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    {uc.professionLabel}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${difficulty.color}`}
                  >
                    {difficulty.text}
                  </span>
                </div>

                {/* Persona */}
                <p className="text-sm text-gray-500 mb-2">{uc.persona}</p>

                {/* Title */}
                <h2 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors leading-snug">
                  {uc.title}
                </h2>

                {/* Result highlight */}
                <div className="bg-green-50 rounded-xl p-3 mb-4">
                  <p className="text-sm text-green-800 font-medium">{uc.resultHighlight}</p>
                </div>

                {/* Tool used */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    {tool?.icon && <span>{tool.icon}</span>}
                    <span>{tool?.name ?? uc.toolUsed}</span>
                  </span>
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
          <p className="text-gray-500 text-lg mb-2">해당 조건의 사례가 없습니다</p>
          <p className="text-gray-400 mb-6">다른 필터를 선택해보세요.</p>
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
          나도 AI를 시작해볼까?
        </h2>
        <p className="text-gray-600 mb-6">
          상황별 가이드를 따라하면 누구나 AI를 활용할 수 있어요.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/situations"
            className="inline-block px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            상황별 가이드 보기 →
          </Link>
          <Link
            href="/quiz"
            className="inline-block px-6 py-3 bg-white text-gray-900 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            AI 추천 테스트
          </Link>
        </div>
      </section>
    </div>
  );
}
