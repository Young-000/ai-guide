'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { loadProgress, getLevelInfo, getXpToNextLevel, ACHIEVEMENTS } from '@/lib/levelSystem';
import type { UserProgress } from '@/lib/levelSystem';
import { getProgressManager } from '@/lib/progress';
import { getRecommendations } from '@/lib/recommendations';
import type { RecommendedSituation } from '@/lib/recommendations';
import situationsData from '@/data/situations.json';
import type { Situation } from '@/types';
import AchievementBadge from '@/components/AchievementBadge';

const allSituations = situationsData.situations as Situation[];

const DEFAULT_PROGRESS: UserProgress = {
  completedSituations: [],
  completedSteps: {},
  totalXp: 0,
  currentLevel: 1,
  lastVisit: new Date().toISOString(),
  isOnboarded: false,
  achievements: [],
  dailyActivities: [],
  situationCompletions: [],
  toolsUsed: [],
  promptCopyCount: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: '',
};

export default function MyProgressPage() {
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

  if (!mounted) {
    return <ProgressSkeleton />;
  }

  const hasActivity = progress.completedSituations.length > 0 ||
    Object.keys(progress.completedSteps).length > 0;

  if (!hasActivity && !progress.isOnboarded) {
    return <EmptyState />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <ProgressHero progress={progress} />
      <StatsGrid progress={progress} />
      <SmartRecommendations progress={progress} />
      <AchievementsGrid progress={progress} />
      <CompletionTimeline progress={progress} />
    </div>
  );
}

// --- Sub-components ---

function ProgressHero({ progress }: { progress: UserProgress }) {
  const levelInfo = getLevelInfo(progress.currentLevel);
  const xpInfo = getXpToNextLevel(progress.totalXp);

  return (
    <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
      <div className="flex items-center gap-4 mb-4">
        <span className="text-4xl" aria-hidden="true">{levelInfo.icon}</span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Lv.{levelInfo.level} {levelInfo.title}
          </h1>
          <p className="text-gray-600 text-sm">{levelInfo.description}</p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">경험치</span>
          <span className="font-bold text-indigo-600">
            {progress.totalXp} XP
          </span>
        </div>
        <div
          className="w-full h-3 bg-white/80 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={Math.round(xpInfo.progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`다음 레벨까지 ${xpInfo.current}/${xpInfo.needed} XP`}
        >
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${xpInfo.progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 text-right">
          다음 레벨까지 {Math.max(0, xpInfo.needed - xpInfo.current)} XP
        </p>
      </div>
    </section>
  );
}

function StatsGrid({ progress }: { progress: UserProgress }) {
  const totalSteps = Object.values(progress.completedSteps)
    .reduce((sum, steps) => sum + steps.length, 0);

  const stats = [
    {
      label: '완료한 가이드',
      value: progress.completedSituations.length,
      icon: '📋',
    },
    {
      label: '완료한 스텝',
      value: totalSteps,
      icon: '✅',
    },
    {
      label: '시도한 도구',
      value: progress.toolsUsed.length,
      icon: '🛠️',
    },
    {
      label: '연속 학습',
      value: progress.currentStreak > 0 ? `🔥${progress.currentStreak}일` : '-',
      icon: '📅',
    },
  ];

  return (
    <section>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-gray-100 rounded-xl p-4 text-center"
          >
            <span className="text-2xl block mb-1" aria-hidden="true">{stat.icon}</span>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SmartRecommendations({ progress }: { progress: UserProgress }) {
  const recommendations: RecommendedSituation[] = getRecommendations(
    progress,
    allSituations,
    3,
  );

  // All completed
  if (progress.completedSituations.length >= allSituations.length) {
    return (
      <section className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 text-center">
        <span className="text-4xl block mb-2" aria-hidden="true">🎉</span>
        <h2 className="text-xl font-bold text-gray-900 mb-1">모든 가이드를 완료했어요!</h2>
        <p className="text-gray-600 text-sm">
          대단해요! 모든 상황 가이드를 마스터했습니다.
        </p>
      </section>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-lg font-bold text-gray-900 mb-4">다음에 도전해보세요</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {recommendations.map(({ situation, reason }) => (
          <Link
            key={situation.slug}
            href={`/situations/${situation.slug}`}
            className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-blue-200 transition-all group"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl" aria-hidden="true">{situation.icon}</span>
              <DifficultyTag difficulty={situation.difficulty} />
            </div>
            <h3 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors mb-1">
              {situation.title}
            </h3>
            <p className="text-xs text-gray-500 mb-3">{situation.subtitle}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-500 font-medium">{reason}</span>
              <span className="text-xs text-gray-400">{situation.timeToComplete}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function AchievementsGrid({ progress }: { progress: UserProgress }) {
  const earnedMap = new Map(progress.achievements.map((a) => [a.id, a]));

  return (
    <section>
      <h2 className="text-lg font-bold text-gray-900 mb-4">업적</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {ACHIEVEMENTS.map((achievement) => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            earned={earnedMap.get(achievement.id)}
          />
        ))}
      </div>
    </section>
  );
}

function CompletionTimeline({ progress }: { progress: UserProgress }) {
  if (progress.situationCompletions.length === 0) {
    return null;
  }

  // Sort by date, most recent first
  const sorted = [...progress.situationCompletions].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );

  return (
    <section>
      <h2 className="text-lg font-bold text-gray-900 mb-4">완료한 가이드</h2>
      <div className="space-y-3">
        {sorted.map((completion) => {
          const situation = allSituations.find((s) => s.slug === completion.slug);
          if (!situation) return null;

          const date = new Date(completion.completedAt);
          const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;

          return (
            <Link
              key={completion.slug}
              href={`/situations/${completion.slug}`}
              className="flex items-center gap-4 p-3 bg-white border border-gray-100 rounded-xl hover:border-blue-200 transition-all"
            >
              <span className="text-sm text-gray-400 font-mono min-w-[3rem]">{dateStr}</span>
              <span className="text-xl" aria-hidden="true">{situation.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{situation.title}</p>
                <p className="text-xs text-gray-500 truncate">{situation.subtitle}</p>
              </div>
              <span className="text-green-500" aria-label="완료">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// --- Helper Components ---

function DifficultyTag({ difficulty }: { difficulty: 'easy' | 'medium' | 'hard' }) {
  const styles = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-red-100 text-red-700',
  };
  const labels = { easy: '쉬움', medium: '보통', hard: '어려움' };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[difficulty]}`}>
      {labels[difficulty]}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <span className="text-6xl block mb-6" aria-hidden="true">🌱</span>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">
        아직 학습 기록이 없어요
      </h1>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        AI 가이드를 따라하면서 경험치를 쌓고, 업적을 달성해보세요!
        첫 가이드를 완료하면 여기에 학습 현황이 표시됩니다.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/situations"
          className="px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors"
        >
          첫 가이드 시작하기
        </Link>
        <Link
          href="/onboarding"
          className="px-6 py-3 bg-white text-blue-500 font-medium rounded-xl border border-blue-200 hover:bg-blue-50 transition-colors"
        >
          맞춤 추천받기
        </Link>
      </div>
    </div>
  );
}

function ProgressSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
      <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
      <div className="grid sm:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
