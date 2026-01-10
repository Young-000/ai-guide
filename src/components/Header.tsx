'use client';

import Link from 'next/link';
import { useState } from 'react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <nav className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <span className="font-bold text-xl text-gray-900">AI 가이드</span>
          </Link>

          {/* 데스크톱 메뉴 */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/situations"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-full text-sm hover:opacity-90 transition-opacity"
            >
              🎯 상황별 가이드
            </Link>
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              도구 목록
            </Link>
            <Link
              href="/quiz"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              AI 추천
            </Link>
            <Link
              href="/compare"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              비교
            </Link>
            <Link
              href="/glossary"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              용어 사전
            </Link>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="메뉴 열기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-100 pt-4">
            <div className="flex flex-col gap-4">
              <Link
                href="/situations"
                className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-full text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                🎯 상황별 가이드
              </Link>
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                도구 목록
              </Link>
              <Link
                href="/quiz"
                className="text-gray-600 hover:text-gray-900 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                AI 추천
              </Link>
              <Link
                href="/compare"
                className="text-gray-600 hover:text-gray-900 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                비교
              </Link>
              <Link
                href="/glossary"
                className="text-gray-600 hover:text-gray-900 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                용어 사전
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
