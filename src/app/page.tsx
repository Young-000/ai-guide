'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import situationsData from '@/data/situations.json';

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

// 검색 키워드 매핑 (동의어/관련어)
const keywordMap: Record<string, string[]> = {
  'pdf-summary': ['pdf', '요약', '문서', '보고서', '읽기', '정리', '분석', '리포트'],
  'email-writing': ['이메일', '메일', '영어', '영문', '거절', '요청', '비즈니스', '작성'],
  'presentation-slides': ['발표', 'ppt', '슬라이드', '프레젠테이션', '자료', '피티'],
  'code-debug': ['에러', '오류', '버그', '디버그', '안됨', '작동', '코드', '개발'],
  'code-review': ['리뷰', '코드', '검토', '개선', '리팩토링', '품질'],
  'ui-design': ['ui', 'ux', '디자인', '화면', '앱', '웹', '목업', '와이어프레임'],
  'thumbnail-creation': ['썸네일', '유튜브', '이미지', '배너', '표지'],
  'paper-summary': ['논문', '학술', '연구', '페이퍼', '리서치'],
  'concept-explanation': ['이해', '설명', '개념', '공부', '어려운', '모르겠', '뭐야'],
  'blog-writing': ['블로그', '글', '포스트', '글쓰기', '콘텐츠', 'seo'],
  'competitor-research': ['경쟁사', '분석', '시장', '조사', '리서치', '마케팅'],
  'meeting-notes': ['회의', '회의록', '미팅', '정리', '기록', '노트'],
};

// 예시 질문들
const exampleQueries = [
  "PDF 100페이지 요약하고 싶어",
  "코드에서 에러가 나는데",
  "발표자료 만들어야 해",
  "영어 이메일 써야 하는데",
  "이 개념이 이해가 안 돼",
  "유튜브 썸네일 만들고 싶어",
];

export default function Home() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showExamples, setShowExamples] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const situations = situationsData.situations as Situation[];

  // 스마트 매칭: 검색어에 맞는 상황 찾기
  const matchedSituations = useMemo(() => {
    if (!query.trim()) return [];

    const searchTerms = query.toLowerCase().split(/\s+/);

    return situations
      .map((situation) => {
        let score = 0;

        // 키워드 매핑 체크
        const keywords = keywordMap[situation.slug] || [];
        for (const term of searchTerms) {
          if (keywords.some((k) => k.includes(term) || term.includes(k))) {
            score += 10;
          }
        }

        // 제목/설명 매칭
        const searchableText = `${situation.title} ${situation.subtitle} ${situation.problem}`.toLowerCase();
        for (const term of searchTerms) {
          if (searchableText.includes(term)) {
            score += 5;
          }
        }

        return { situation, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((item) => item.situation);
  }, [query, situations]);

  // 예시 질문 클릭
  const handleExampleClick = (example: string) => {
    setQuery(example);
    setShowExamples(false);
    inputRef.current?.focus();
  };

  // 입력 시 예시 숨기기
  useEffect(() => {
    if (query) {
      setShowExamples(false);
    }
  }, [query]);

  return (
    <div className="min-h-[80vh] flex flex-col">
      {/* 메인 히어로 영역 */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* 로고/타이틀 */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🤖</div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            무엇을 도와드릴까요?
          </h1>
          <p className="text-gray-500">
            하고 싶은 것을 말씀해주세요. 딱 맞는 AI를 알려드릴게요.
          </p>
        </div>

        {/* 검색 입력 */}
        <div className="w-full max-w-2xl">
          <div
            className={`relative bg-white rounded-2xl border-2 transition-all ${
              isFocused ? 'border-blue-500 shadow-lg' : 'border-gray-200 shadow-md'
            }`}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="예: PDF 요약하고 싶어, 코드 에러 해결..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="w-full px-6 py-5 text-lg bg-transparent focus:outline-none text-gray-900 placeholder-gray-400"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setShowExamples(true);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* 예시 질문 칩 */}
          {showExamples && !query && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {exampleQueries.map((example, i) => (
                <button
                  key={i}
                  onClick={() => handleExampleClick(example)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          )}

          {/* 검색 결과 */}
          {query && matchedSituations.length > 0 && (
            <div className="mt-4 bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
              <div className="p-3 bg-gray-50 border-b border-gray-100">
                <p className="text-sm text-gray-500">
                  <span className="font-medium text-gray-700">{matchedSituations.length}개</span>의 해결책을 찾았어요
                </p>
              </div>
              <div className="divide-y divide-gray-100">
                {matchedSituations.map((situation) => {
                  const primaryTool = situation.recommendedTools.find((t) => t.isPrimary);
                  return (
                    <Link
                      key={situation.slug}
                      href={`/situations/${situation.slug}`}
                      className="flex items-center gap-4 p-4 hover:bg-blue-50 transition-colors group"
                    >
                      <span className="text-3xl">{situation.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {situation.title}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">{situation.subtitle}</p>
                      </div>
                      {primaryTool && (
                        <div className="hidden sm:block text-right">
                          <span className="text-xs text-gray-400">추천</span>
                          <p className="text-sm font-medium text-blue-600">{primaryTool.name}</p>
                        </div>
                      )}
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  );
                })}
              </div>
              <Link
                href="/situations"
                className="block p-3 text-center text-sm text-blue-600 hover:bg-blue-50 border-t border-gray-100 font-medium"
              >
                모든 상황 보기 →
              </Link>
            </div>
          )}

          {/* 검색 결과 없음 */}
          {query && matchedSituations.length === 0 && (
            <div className="mt-4 bg-white rounded-2xl border border-gray-200 shadow-lg p-8 text-center">
              <p className="text-gray-500 mb-4">
                &ldquo;{query}&rdquo;에 대한 가이드를 찾지 못했어요
              </p>
              <Link
                href="/situations"
                className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                전체 상황 둘러보기
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 하단 퀵 링크 */}
      {!query && (
        <section className="px-4 pb-12">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link
                href="/situations"
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group"
              >
                <span className="text-2xl">🎯</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">상황별 가이드</span>
              </Link>
              <Link
                href="/quiz"
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all group"
              >
                <span className="text-2xl">✨</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600">AI 추천 테스트</span>
              </Link>
              <Link
                href="/compare"
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:border-cyan-200 hover:shadow-md transition-all group"
              >
                <span className="text-2xl">⚖️</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-cyan-600">AI 비교</span>
              </Link>
              <Link
                href="/glossary"
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all group"
              >
                <span className="text-2xl">📚</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-green-600">용어 사전</span>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
