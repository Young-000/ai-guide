'use client';

import { useState } from 'react';
import Link from 'next/link';
import faqData from '@/data/faq.json';
import type { FaqItem } from '@/types';

const questions = faqData.questions as FaqItem[];

const categoryFilters = [
  { id: 'all', label: '전체', icon: '' },
  ...faqData.categories.map((c) => ({
    id: c.id,
    label: c.name,
    icon: c.icon,
  })),
];

function AccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  readonly item: FaqItem;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
}): React.ReactElement {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-start justify-between gap-4 py-5 text-left"
      >
        <h3 className="font-medium text-gray-900 leading-snug pr-4">{item.question}</h3>
        <span
          className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[600px] pb-5' : 'max-h-0'
        }`}
      >
        <p className="text-gray-600 leading-relaxed">{item.answer}</p>
        {/* Related links */}
        {((item.relatedTips && item.relatedTips.length > 0) ||
          (item.relatedSituations && item.relatedSituations.length > 0)) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {item.relatedTips?.map((tipSlug) => (
              <Link
                key={tipSlug}
                href={`/tips/${tipSlug}`}
                className="text-xs px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
              >
                관련 팁 →
              </Link>
            ))}
            {item.relatedSituations?.map((sitSlug) => (
              <Link
                key={sitSlug}
                href={`/situations/${sitSlug}`}
                className="text-xs px-2.5 py-1 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors"
              >
                가이드 보기 →
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FaqContent(): React.ReactElement {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const filteredQuestions = selectedCategory === 'all'
    ? questions
    : questions.filter((q) => q.category === selectedCategory);

  const toggleItem = (id: string): void => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <>
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">자주 묻는 질문</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          AI에 대해 궁금한 점을 모두 정리했습니다.
          <br />
          찾는 내용이 없다면 상황별 가이드에서 더 자세한 답을 찾아보세요.
        </p>
      </header>

      {/* Category tabs */}
      <section className="mb-8" aria-label="카테고리 필터">
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

      {/* FAQ count */}
      <p className="text-sm text-gray-500 mb-4">{filteredQuestions.length}개의 질문</p>

      {/* Accordion list */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        {filteredQuestions.map((item) => (
          <AccordionItem
            key={item.id}
            item={item}
            isOpen={openIds.has(item.id)}
            onToggle={() => toggleItem(item.id)}
          />
        ))}
      </div>

      {/* Bottom CTA */}
      <section className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          더 자세한 AI 활용법이 궁금하다면?
        </h2>
        <p className="text-gray-600 mb-6">
          상황별 가이드와 활용 팁에서 단계별로 배워보세요.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/tips"
            className="inline-block px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            AI 활용 팁 →
          </Link>
          <Link
            href="/situations"
            className="inline-block px-6 py-3 bg-white text-gray-900 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            상황별 가이드
          </Link>
        </div>
      </section>
    </>
  );
}
