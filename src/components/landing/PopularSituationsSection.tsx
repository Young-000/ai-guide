'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Situation, SituationCategory } from '@/types';
import situationsData from '@/data/situations.json';
import { getPopularSituations } from '@/lib/search';
import CategoryButtons from '@/components/CategoryButtons';
import SituationCardCompact from './SituationCardCompact';

const situations = situationsData.situations as Situation[];

export default function PopularSituationsSection(): JSX.Element {
  const [selectedCategory, setSelectedCategory] =
    useState<SituationCategory | null>(null);

  const displaySituations = useMemo((): Situation[] => {
    if (selectedCategory) {
      const filtered = situations.filter(
        (s) => s.category === selectedCategory
      );
      return getPopularSituations(filtered, 6);
    }
    return getPopularSituations(situations, 6);
  }, [selectedCategory]);

  return (
    <section
      aria-labelledby="popular-situations-title"
      className="bg-white py-16 md:py-20 px-4"
    >
      <div className="max-w-6xl mx-auto">
        <h2
          id="popular-situations-title"
          className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8"
        >
          지금 가장 많이 찾는 AI 활용법
        </h2>

        {/* Category filter */}
        <div className="mb-8">
          <CategoryButtons
            selected={selectedCategory}
            onChange={setSelectedCategory}
          />
        </div>

        {/* Situation cards grid */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 list-none p-0 mb-8">
          {displaySituations.map((situation) => (
            <li key={situation.slug}>
              <SituationCardCompact situation={situation} />
            </li>
          ))}
        </ul>

        {/* View all link */}
        <div className="text-center">
          <Link
            href="/situations"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            {situations.length}개 전체 가이드 보기
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
