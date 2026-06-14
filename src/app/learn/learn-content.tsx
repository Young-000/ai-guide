'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import situationsData from '@/data/situations.json';
import useCasesData from '@/data/use-cases.json';
import tipsData from '@/data/tips.json';
import type { Tip } from '@/types';

type ContentType = 'all' | 'situation' | 'use-case' | 'tip';
type CategoryFilter = 'all' | 'work' | 'study' | 'coding' | 'design' | 'content' | 'research';

interface LearnItem {
  slug: string;
  title: string;
  description: string;
  type: 'situation' | 'use-case' | 'tip';
  category: string;
  href: string;
  icon?: string;
  badge?: string;
}

const typeFilters: { id: ContentType; label: string; count: number }[] = [
  { id: 'all', label: '전체', count: 0 },
  { id: 'situation', label: '가이드', count: situationsData.situations.length },
  { id: 'use-case', label: '활용 사례', count: useCasesData.useCases.length },
  { id: 'tip', label: '활용 팁', count: tipsData.tips.length },
];
typeFilters[0].count = typeFilters.slice(1).reduce((acc, f) => acc + f.count, 0);

const categoryFilters: { id: CategoryFilter; label: string; icon: string }[] = [
  { id: 'all', label: '전체', icon: '' },
  { id: 'work', label: '업무', icon: '💼' },
  { id: 'study', label: '학습', icon: '📚' },
  { id: 'coding', label: '개발', icon: '💻' },
  { id: 'design', label: '디자인', icon: '🎨' },
  { id: 'content', label: '콘텐츠', icon: '✍️' },
  { id: 'research', label: '리서치', icon: '🔍' },
];

// Map tip categories to learn categories
function mapTipCategoryToLearn(tipCategory: string): string {
  const mapping: Record<string, string> = {
    productivity: 'work',
    writing: 'content',
    coding: 'coding',
    learning: 'study',
    creative: 'design',
    business: 'work',
  };
  return mapping[tipCategory] ?? 'work';
}

// Map use-case profession to learn category
function mapUseCaseProfession(situation: string): string {
  const sit = situationsData.situations.find((s) => s.slug === situation);
  return sit?.category ?? 'work';
}

function buildLearnItems(): LearnItem[] {
  const situationItems: LearnItem[] = situationsData.situations.map((s) => ({
    slug: s.slug,
    title: s.title,
    description: s.subtitle,
    type: 'situation' as const,
    category: s.category,
    href: `/situations/${s.slug}`,
    icon: s.icon,
    badge: '가이드',
  }));

  const useCaseItems: LearnItem[] = useCasesData.useCases.map((uc) => ({
    slug: uc.slug,
    title: uc.title,
    description: uc.resultHighlight,
    type: 'use-case' as const,
    category: mapUseCaseProfession(uc.situation),
    href: `/use-cases/${uc.slug}`,
    badge: '사례',
  }));

  const tipItems: LearnItem[] = (tipsData.tips as Tip[]).map((t) => ({
    slug: t.slug,
    title: t.title,
    description: t.excerpt,
    type: 'tip' as const,
    category: mapTipCategoryToLearn(t.category),
    href: `/tips/${t.slug}`,
    badge: '팁',
  }));

  return [...situationItems, ...useCaseItems, ...tipItems];
}

const allItems = buildLearnItems();

const typeBadgeStyles: Record<string, string> = {
  situation: 'bg-indigo-50 text-indigo-700',
  'use-case': 'bg-green-50 text-green-700',
  tip: 'bg-amber-50 text-amber-700',
};

export default function LearnContent(): React.ReactElement {
  const [selectedType, setSelectedType] = useState<ContentType>('all');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesType = selectedType === 'all' || item.type === selectedType;
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesType && matchesCategory;
    });
  }, [selectedType, selectedCategory]);

  const resetFilters = (): void => {
    setSelectedType('all');
    setSelectedCategory('all');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">AI 학습센터</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          상황별 가이드, 활용 사례, AI 활용 팁을 한곳에서 확인하세요.
          <br />
          총 {allItems.length}개의 학습 자료가 준비되어 있습니다.
        </p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-indigo-50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-indigo-700">{situationsData.situations.length}</p>
          <p className="text-sm text-indigo-600">상황별 가이드</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{useCasesData.useCases.length}</p>
          <p className="text-sm text-green-600">활용 사례</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">{tipsData.tips.length}</p>
          <p className="text-sm text-amber-600">활용 팁</p>
        </div>
      </div>

      {/* Type filter */}
      <section className="mb-4" aria-label="콘텐츠 유형 필터">
        <p className="text-sm text-gray-500 font-medium mb-2">유형별</p>
        <div className="flex flex-wrap gap-2">
          {typeFilters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setSelectedType(filter.id)}
              aria-pressed={selectedType === filter.id}
              className={`px-4 py-2 rounded-full font-medium transition-all flex items-center gap-1 text-sm ${
                selectedType === filter.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{filter.label}</span>
              <span className={`text-xs ${selectedType === filter.id ? 'text-gray-300' : 'text-gray-400'}`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Category filter */}
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
          {filteredItems.length}개의 자료
        </p>
        {(selectedType !== 'all' || selectedCategory !== 'all') && (
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
      {filteredItems.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Link
              key={`${item.type}-${item.slug}`}
              href={item.href}
              className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-blue-200 transition-all"
            >
              {/* Top row: type badge */}
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeBadgeStyles[item.type]}`}>
                  {item.badge}
                </span>
                {item.icon && <span className="text-2xl">{item.icon}</span>}
              </div>

              {/* Title */}
              <h2 className="text-base font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors leading-snug">
                {item.title}
              </h2>

              {/* Description */}
              <p className="text-sm text-gray-500 line-clamp-2">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-400 text-5xl mb-4">🔍</p>
          <p className="text-gray-500 text-lg mb-2">해당 조건의 자료가 없습니다</p>
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
      <section className="mt-16 bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-2">AI가 처음이라면?</h2>
        <p className="text-gray-300 mb-6">
          맞춤 추천을 받아 나에게 맞는 AI 도구와 활용법을 찾아보세요.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/onboarding"
            className="inline-block px-6 py-3 bg-white text-gray-900 font-medium rounded-xl hover:bg-gray-100 transition-colors"
          >
            AI 추천받기 →
          </Link>
          <Link
            href="/faq"
            className="inline-block px-6 py-3 bg-white/10 text-white font-medium rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
          >
            자주 묻는 질문
          </Link>
        </div>
      </section>
    </div>
  );
}
