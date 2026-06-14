'use client';

import Link from 'next/link';

interface StreakCounterProps {
  streak: number;
}

export default function StreakCounter({ streak }: StreakCounterProps) {
  if (streak <= 0) return null;

  return (
    <Link
      href="/my-progress"
      className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 border border-orange-200 rounded-full text-sm font-bold text-orange-600 hover:bg-orange-100 transition-colors"
      aria-label={`${streak}일 연속 학습 중. 내 학습 현황 보기`}
    >
      <span aria-hidden="true">🔥</span>
      <span>{streak}</span>
    </Link>
  );
}
