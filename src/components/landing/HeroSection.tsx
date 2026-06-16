'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { loadProgress } from '@/lib/levelSystem';
import situationsData from '@/data/situations.json';
import toolsData from '@/data/tools.json';
import type { Situation } from '@/types';

const situations = situationsData.situations as Situation[];
const tools = toolsData.tools;

export default function HeroSection(): JSX.Element {
  const [isReturningUser, setIsReturningUser] = useState(false);

  useEffect(() => {
    const progress = loadProgress();
    if (progress.isOnboarded) {
      setIsReturningUser(true);
    }
  }, []);

  const handleScrollToSituations = (): void => {
    const target = document.getElementById('popular-situations');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      aria-labelledby="hero-title"
      className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-24 px-4"
    >
      <div className="max-w-3xl mx-auto text-center">
        {/* Sub-head badge */}
        <span className="inline-block bg-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          {isReturningUser
            ? '다시 오셨군요!'
            : 'AI 입문자 10명 중 8명이 겪는 문제'}
        </span>

        {/* Main headline */}
        <h1
          id="hero-title"
          className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4"
        >
          {isReturningUser
            ? '이어서 AI 활용법을 배워보세요'
            : '5분 만에 나에게 딱 맞는 AI를 찾아보세요'}
        </h1>

        {/* Sub-copy */}
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          {isReturningUser
            ? '이전에 보던 가이드를 이어서 확인하거나, 새로운 AI 활용법을 탐색해보세요'
            : '간단한 질문 3개에 답하면, 당신의 상황에 맞는 AI 도구와 바로 따라할 수 있는 가이드를 드려요'}
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          {isReturningUser ? (
            <>
              <Link
                href="/situations"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-lg font-bold py-4 px-8 rounded-2xl hover:shadow-lg transition-all"
              >
                이어서 학습하기
                <svg
                  className="w-5 h-5"
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
              {/* /onboarding is built in cycle 2 */}
              <Link
                href="/onboarding"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 text-lg font-medium py-4 px-8 rounded-2xl hover:bg-gray-50 transition-all"
              >
                처음부터 다시
              </Link>
            </>
          ) : (
            <>
              {/* /onboarding is built in cycle 2. Fallback to /situations if not available. */}
              <Link
                href="/onboarding"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-lg font-bold py-4 px-8 rounded-2xl hover:shadow-lg transition-all"
              >
                나에게 맞는 AI 찾기
                <svg
                  className="w-5 h-5"
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
              <button
                type="button"
                onClick={handleScrollToSituations}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 text-lg font-medium py-4 px-8 rounded-2xl hover:bg-gray-50 transition-all"
              >
                상황별 가이드 바로 보기
              </button>
            </>
          )}
        </div>

        {/* Trust indicators */}
        <p className="text-sm text-gray-500">
          {situations.length}개 상황 가이드 | {tools.length}개 AI 도구 | 무료
        </p>
      </div>
    </section>
  );
}
