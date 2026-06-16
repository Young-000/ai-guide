'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Situation, SituationCategory } from '@/types';
import situationsData from '@/data/situations.json';
import { searchSituations } from '@/lib/search';
import SearchInput from '@/components/SearchInput';
import CategoryButtons from '@/components/CategoryButtons';
import ResultCard from '@/components/ResultCard';
import GuidePanel from '@/components/GuidePanel';

const situations = situationsData.situations as Situation[];

const searchSuggestions = [
  'PDF 요약하고 싶어요',
  '코드 에러 해결해줘',
  '발표 자료 만들어야 해',
  '영어 이메일 작성',
];

export default function QuickSearchSection(): JSX.Element {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<SituationCategory | null>(null);
  const [selectedSituation, setSelectedSituation] =
    useState<Situation | null>(null);

  const searchResults = useMemo(() => {
    if (!query && !selectedCategory) return [];
    return searchSituations(query, situations, selectedCategory);
  }, [query, selectedCategory]);

  const handleSelectSituation = (situation: Situation): void => {
    setSelectedSituation(situation);
  };

  const handleClosePanel = useCallback((): void => {
    setSelectedSituation(null);
  }, []);

  // P0 fix: Escape key handler + focus restore for mobile overlay
  useEffect(() => {
    if (!selectedSituation) return;

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        handleClosePanel();
      }
    };

    const previouslyFocused = document.activeElement as HTMLElement;
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [selectedSituation, handleClosePanel]);

  const hasResults = searchResults.length > 0;
  const hasQuery = Boolean(query || selectedCategory);

  return (
    <section
      id="search"
      aria-labelledby="quick-search-title"
      className="bg-white py-16 md:py-20 px-4"
    >
      <div className="max-w-6xl mx-auto">
        <h2
          id="quick-search-title"
          className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8"
        >
          찾고 싶은 AI 활용법이 있으세요?
        </h2>

        {/* Search input */}
        <div className="max-w-2xl mx-auto mb-6">
          <SearchInput
            value={query}
            onChange={setQuery}
            suggestions={searchSuggestions}
          />
        </div>

        {/* Category filter */}
        <div className="max-w-2xl mx-auto mb-8">
          <CategoryButtons
            selected={selectedCategory}
            onChange={setSelectedCategory}
          />
        </div>

        {/* Search results */}
        {hasQuery && (
          <div className="flex gap-6">
            {/* Results list */}
            <div
              className={`${
                selectedSituation ? 'w-1/2' : 'w-full max-w-4xl mx-auto'
              } transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {hasResults
                    ? `${searchResults.length}개의 추천 상황`
                    : '검색 결과'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setSelectedCategory(null);
                    setSelectedSituation(null);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded px-2 py-1"
                  aria-label="검색어와 필터 초기화"
                >
                  초기화
                </button>
              </div>

              {hasResults ? (
                <div className="space-y-3">
                  {searchResults.map((result) => (
                    <ResultCard
                      key={result.situation.slug}
                      situation={result.situation}
                      isSelected={
                        selectedSituation?.slug === result.situation.slug
                      }
                      onClick={() => handleSelectSituation(result.situation)}
                      matchedKeywords={result.matchedKeywords}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🤔</div>
                  <p className="text-gray-500 mb-2">
                    &quot;{query}&quot;에 맞는 상황을 찾지 못했어요
                  </p>
                  <p className="text-sm text-gray-500">
                    다른 키워드로 검색하거나 카테고리를 선택해보세요
                  </p>
                </div>
              )}
            </div>

            {/* Guide panel (desktop) */}
            {selectedSituation && (
              <div className="hidden lg:block w-1/2 sticky top-4 h-[calc(100vh-200px)]">
                <GuidePanel
                  situation={selectedSituation}
                  onClose={handleClosePanel}
                />
              </div>
            )}
          </div>
        )}

        {/* Mobile guide panel overlay */}
        {selectedSituation && (
          <div
            className="fixed inset-0 z-50 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-search-guide-title"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/50 cursor-default"
              onClick={handleClosePanel}
              aria-label="가이드 패널 닫기"
              tabIndex={-1}
            />
            <div className="absolute bottom-0 left-0 right-0 h-[85vh] bg-white rounded-t-3xl overflow-hidden">
              <h3 id="mobile-search-guide-title" className="sr-only">
                {selectedSituation.title} 가이드
              </h3>
              <GuidePanel
                situation={selectedSituation}
                onClose={handleClosePanel}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
