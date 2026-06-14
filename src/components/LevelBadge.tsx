'use client';

import { getLevelInfo, getXpToNextLevel, type UserProgress } from '@/lib/levelSystem';

interface LevelBadgeProps {
  progress: UserProgress;
  showXp?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function LevelBadge({ progress, showXp = false, size = 'md' }: LevelBadgeProps) {
  const levelInfo = getLevelInfo(progress.currentLevel);
  const xpInfo = getXpToNextLevel(progress.totalXp);

  const sizeClasses = {
    sm: {
      container: 'px-2 py-1',
      icon: 'text-base',
      title: 'text-xs',
      xp: 'text-[10px]',
    },
    md: {
      container: 'px-3 py-1.5',
      icon: 'text-lg',
      title: 'text-sm',
      xp: 'text-xs',
    },
    lg: {
      container: 'px-4 py-2',
      icon: 'text-2xl',
      title: 'text-base',
      xp: 'text-sm',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div
      className={`inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full ${classes.container}`}
    >
      <span className={classes.icon}>{levelInfo.icon}</span>
      <div className="flex flex-col">
        <span className={`font-bold text-gray-900 ${classes.title}`}>
          Lv.{levelInfo.level} {levelInfo.title}
        </span>
        {showXp && (
          <div className="flex items-center gap-1">
            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-500"
                style={{ width: `${xpInfo.progress}%` }}
              />
            </div>
            <span className={`text-gray-500 ${classes.xp}`}>
              {xpInfo.current}/{xpInfo.needed} XP
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
