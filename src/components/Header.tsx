'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { loadProgress, type UserProgress } from '@/lib/levelSystem';
import { getProgressManager } from '@/lib/progress';
import LevelBadge from './LevelBadge';

const DEFAULT_PROGRESS: UserProgress = {
  completedSituations: [],
  completedSteps: {},
  totalXp: 0,
  currentLevel: 1,
  lastVisit: new Date().toISOString(),
  isOnboarded: false,
};

export function Header() {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setProgress(loadProgress());

    const manager = getProgressManager();
    const unsubscribe = manager.subscribe((newProgress) => {
      setProgress(newProgress);
    });

    return unsubscribe;
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100" role="banner">
      <nav className="max-w-4xl mx-auto px-4 py-3" aria-label="메인 네비게이션">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="AI 가이드 홈으로 이동">
            <span className="text-xl" aria-hidden="true">🤖</span>
            <span className="font-bold text-gray-900">AI 가이드</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* 레벨 뱃지 */}
            {mounted && progress.isOnboarded && (
              <LevelBadge progress={progress} showXp size="sm" />
            )}

            {/* 맞춤 추천 CTA */}
            {mounted && !progress.isOnboarded ? (
              <Link
                href="/onboarding"
                className="px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-full hover:bg-blue-600 transition-colors"
              >
                AI 추천받기
              </Link>
            ) : mounted && progress.isOnboarded ? (
              <Link
                href="/onboarding"
                className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
              >
                다시 추천받기
              </Link>
            ) : null}

            <Link
              href="/projects"
              className="hidden sm:inline text-sm text-gray-600 hover:text-gray-900"
              aria-label="토이 프로젝트 보기"
            >
              토이 프로젝트
            </Link>

            <Link
              href="/tools"
              className="text-sm text-gray-600 hover:text-gray-900"
              aria-label="전체 AI 도구 목록 보기"
            >
              전체 도구
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
