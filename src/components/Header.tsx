'use client';

import { useState } from 'react';
import Link from 'next/link';

const GUIDE_LINKS = [
  { href: '/situations', label: '상황별 가이드' },
  { href: '/tools', label: 'AI 도구 목록' },
  { href: '/compare', label: '도구 비교' },
  { href: '/glossary', label: '용어 사전' },
  { href: '/learn', label: '학습센터' },
  { href: '/quiz', label: 'AI 퀴즈' },
] as const;

export function Header(): JSX.Element {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200"
      role="banner"
    >
      <nav
        className="max-w-5xl mx-auto px-4 py-3"
        aria-label="메인 네비게이션"
      >
        <div className="flex items-center justify-between">
          {/* Brand */}
          <Link
            href="/"
            className="font-bold text-xl text-slate-900 tracking-tight hover:text-blue-600 transition-colors"
            aria-label="AIWire 홈으로 이동"
          >
            AIWire
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-6" role="list">
            <li>
              <Link
                href="/"
                className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
              >
                홈
              </Link>
            </li>
            <li>
              <Link
                href="/news"
                className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
              >
                뉴스
              </Link>
            </li>

            {/* AI 가이드 dropdown */}
            <li className="relative">
              <button
                type="button"
                onClick={() => setGuideOpen((o) => !o)}
                className="flex items-center gap-1 text-sm text-slate-600 hover:text-blue-600 transition-colors"
                aria-expanded={guideOpen}
                aria-haspopup="menu"
                aria-controls="guide-dropdown-menu"
              >
                AI 가이드
                {/* Chevron down */}
                <svg
                  className={`w-4 h-4 transition-transform duration-150 ${guideOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {guideOpen && (
                <ul
                  id="guide-dropdown-menu"
                  role="menu"
                  className="absolute top-full right-0 mt-2 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50"
                >
                  {GUIDE_LINKS.map((link) => (
                    <li key={link.href} role="menuitem">
                      <Link
                        href={link.href}
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                        onClick={() => setGuideOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            <li>
              <Link
                href="/about"
                className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
              >
                소개
              </Link>
            </li>

            {/* Lang hint */}
            <li>
              <Link
                href="/en/news"
                className="text-xs text-slate-400 hover:text-blue-600 border border-slate-200 rounded px-2 py-1 transition-colors"
                aria-label="Switch to English news"
              >
                EN
              </Link>
            </li>
          </ul>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
          >
            {mobileOpen ? (
              /* X icon */
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              /* Hamburger icon */
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu panel */}
        {mobileOpen && (
          <div className="md:hidden pt-4 pb-3 border-t border-slate-200 mt-3">
            <ul className="space-y-1">
              <li>
                <Link
                  href="/"
                  className="block py-2 text-sm text-slate-700 hover:text-blue-600"
                  onClick={() => setMobileOpen(false)}
                >
                  홈
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="block py-2 text-sm text-slate-700 hover:text-blue-600"
                  onClick={() => setMobileOpen(false)}
                >
                  뉴스
                </Link>
              </li>
              <li>
                <p className="py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  AI 가이드
                </p>
                <ul className="pl-3 space-y-1">
                  {GUIDE_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="block py-1.5 text-sm text-slate-600 hover:text-blue-600"
                        onClick={() => setMobileOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li>
                <Link
                  href="/about"
                  className="block py-2 text-sm text-slate-700 hover:text-blue-600"
                  onClick={() => setMobileOpen(false)}
                >
                  소개
                </Link>
              </li>
              <li>
                <Link
                  href="/en/news"
                  className="block py-2 text-sm text-slate-700 hover:text-blue-600"
                  onClick={() => setMobileOpen(false)}
                >
                  English
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}
