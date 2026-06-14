'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getProgressManager } from '@/lib/progress';
import type { AchievementEvent } from '@/lib/progress';

export default function AchievementToast() {
  const [currentToast, setCurrentToast] = useState<AchievementEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const queueRef = useRef<AchievementEvent[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const dismissCurrent = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsVisible(false);
    setTimeout(() => {
      setCurrentToast(null);
    }, 300);
  }, []);

  const showNext = useCallback(() => {
    if (queueRef.current.length === 0) {
      return;
    }
    const next = queueRef.current.shift();
    if (!next) return;

    setCurrentToast(next);
    setIsVisible(true);

    timerRef.current = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentToast(null);
        showNext();
      }, 300);
    }, 3000);
  }, []);

  useEffect(() => {
    const manager = getProgressManager();
    const unsubscribe = manager.onAchievement((achievements) => {
      queueRef.current.push(...achievements);
      if (!currentToast) {
        showNext();
      }
    });

    return () => {
      unsubscribe();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentToast, showNext]);

  // Escape key to dismiss
  useEffect(() => {
    if (!currentToast) return;
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') dismissCurrent();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentToast, dismissCurrent]);

  if (!currentToast) return null;

  return (
    <div
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        transition-all duration-300 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 px-5 py-3 bg-white border border-gray-200 rounded-2xl shadow-lg">
        <span className="text-2xl" aria-hidden="true">🏆</span>
        <div>
          <p className="text-sm font-bold text-gray-900">업적 달성!</p>
          <p className="text-sm text-gray-600">
            {currentToast.icon} {currentToast.title}
            <span className="text-blue-500 font-medium ml-1">+{currentToast.xpReward} XP</span>
          </p>
        </div>
        <button
          type="button"
          onClick={dismissCurrent}
          className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="닫기"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
