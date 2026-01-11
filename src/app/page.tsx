'use client';

import { useState, useMemo } from 'react';
import type { Situation, SituationCategory, SurveyResult } from '@/types';
import situationsData from '@/data/situations.json';
import { searchSituations, getPopularSituations } from '@/lib/search';
import SearchInput from '@/components/SearchInput';
import CategoryButtons from '@/components/CategoryButtons';
import ResultCard from '@/components/ResultCard';
import GuidePanel from '@/components/GuidePanel';
import SurveyWizard from '@/components/SurveyWizard';

// 모듈 레벨에서 데이터 파싱
const situations = situationsData.situations as Situation[];

// 검색 제안
const searchSuggestions = [
  'PDF 요약하고 싶어요',
  '코드 에러 해결해줘',
  '발표 자료 만들어야 해',
  '영어 이메일 작성',
];

export default function Home() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SituationCategory | null>(null);
  const [selectedSituation, setSelectedSituation] = useState<Situation | null>(null);
  const [showSurvey, setShowSurvey] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [surveyResult, setSurveyResult] = useState<SurveyResult | null>(null);

  // 검색 결과
  const searchResults = useMemo(() => {
    return searchSituations(query, situations, selectedCategory);
  }, [query, selectedCategory]);

  // 인기 상황 (검색어 없을 때)
  const popularSituations = useMemo(() => {
    if (query || selectedCategory) return [];
    return getPopularSituations(situations, 6);
  }, [query, selectedCategory]);

  // 결과 선택 핸들러
  const handleSelectSituation = (situation: Situation) => {
    setSelectedSituation(situation);
  };

  // 패널 닫기 핸들러
  const handleClosePanel = () => {
    setSelectedSituation(null);
  };

  // 표시할 결과 (검색 결과 또는 인기 상황)
  const displayResults = query || selectedCategory ? searchResults : [];
  const showPopular = !query && !selectedCategory;

  return (
    <div className="min-h-[calc(100vh-160px)] flex flex-col">
      {/* 검색 영역 */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            무엇을 하고 싶으세요?
          </h1>
          <p className="text-gray-500 mb-8">
            상황을 말씀해주시면 딱 맞는 AI 도구와 사용법을 알려드려요
          </p>

          {/* 검색 입력 */}
          <div className="mb-6">
            <SearchInput
              value={query}
              onChange={setQuery}
              suggestions={searchSuggestions}
            />
          </div>

          {/* 카테고리 버튼 */}
          <CategoryButtons
            selected={selectedCategory}
            onChange={setSelectedCategory}
          />

          {/* 모르겠어요 버튼 */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowSurvey(true)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              <span className="text-xl">🤷</span>
              뭘 해야 할지 모르겠어요
            </button>
          </div>
        </div>
      </div>

      {/* 결과 영역 */}
      <div className="flex-1 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 검색 결과 또는 인기 상황 */}
          {showPopular ? (
            // 인기 상황 표시
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">
                🔥 인기 상황
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {popularSituations.map((situation) => (
                  <ResultCard
                    key={situation.slug}
                    situation={situation}
                    isSelected={selectedSituation?.slug === situation.slug}
                    onClick={() => handleSelectSituation(situation)}
                  />
                ))}
              </div>
            </div>
          ) : (
            // 검색 결과 표시 (2열 레이아웃: 결과 + 가이드 패널)
            <div className="flex gap-6">
              {/* 결과 리스트 */}
              <div className={`${selectedSituation ? 'w-1/2' : 'w-full max-w-4xl mx-auto'} transition-all duration-300`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">
                    {displayResults.length > 0
                      ? `${displayResults.length}개의 추천 상황`
                      : '검색 결과'}
                  </h2>
                  {(query || selectedCategory) && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery('');
                        setSelectedCategory(null);
                        setSelectedSituation(null);
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      초기화
                    </button>
                  )}
                </div>

                {displayResults.length > 0 ? (
                  <div className="space-y-3">
                    {displayResults.map((result) => (
                      <ResultCard
                        key={result.situation.slug}
                        situation={result.situation}
                        isSelected={selectedSituation?.slug === result.situation.slug}
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
                    <p className="text-sm text-gray-400">
                      다른 키워드로 검색하거나 카테고리를 선택해보세요
                    </p>
                  </div>
                )}
              </div>

              {/* 가이드 패널 */}
              {selectedSituation && (
                <div className="w-1/2 sticky top-4 h-[calc(100vh-200px)]">
                  <GuidePanel
                    situation={selectedSituation}
                    onClose={handleClosePanel}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 선택된 상황이 있을 때 모바일용 패널 (하단에서 슬라이드업) */}
      {selectedSituation && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* 배경 오버레이 */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleClosePanel}
          />
          {/* 패널 */}
          <div className="absolute bottom-0 left-0 right-0 h-[85vh] bg-white rounded-t-3xl overflow-hidden">
            <GuidePanel
              situation={selectedSituation}
              onClose={handleClosePanel}
            />
          </div>
        </div>
      )}

      {/* 설문조사 위저드 */}
      {showSurvey && (
        <SurveyWizard
          onComplete={(result) => {
            setSurveyResult(result);
          }}
          onClose={() => setShowSurvey(false)}
        />
      )}
    </div>
  );
}
