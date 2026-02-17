'use client';

import type { Achievement, EarnedAchievement } from '@/lib/levelSystem';

interface AchievementBadgeProps {
  achievement: Achievement;
  earned?: EarnedAchievement;
}

export default function AchievementBadge({ achievement, earned }: AchievementBadgeProps) {
  const isEarned = !!earned;

  return (
    <div
      className={`
        flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-all
        ${isEarned
          ? 'bg-white border border-gray-200 shadow-sm'
          : 'bg-gray-50 border border-gray-100 opacity-60'
        }
      `}
      title={isEarned ? `${achievement.title} - ${formatDate(earned.earnedAt)}` : achievement.condition}
    >
      <span className={`text-3xl ${isEarned ? '' : 'grayscale'}`} aria-hidden="true">
        {isEarned ? achievement.icon : '🔒'}
      </span>
      <div>
        <p className={`text-sm font-bold ${isEarned ? 'text-gray-900' : 'text-gray-500'}`}>
          {achievement.title}
        </p>
        {isEarned ? (
          <p className="text-xs text-gray-500 mt-0.5">
            {formatDate(earned.earnedAt)}
          </p>
        ) : (
          <p className="text-xs text-gray-500 mt-0.5">
            {achievement.condition}
          </p>
        )}
      </div>
    </div>
  );
}

function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return `${date.getMonth() + 1}/${date.getDate()} 달성`;
  } catch {
    return '';
  }
}
