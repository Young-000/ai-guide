'use client';

import type { OnboardingOptionCard } from '@/types/onboarding';
import QuestionCard from './QuestionCard';

interface OnboardingQuestionProps {
  title: string;
  subtitle?: string | null;
  options: OnboardingOptionCard[];
  selectedValue: string | undefined;
  onSelect: (value: string) => void;
  roleBadge?: string | null;
  direction: 'forward' | 'backward';
}

const ROLE_BADGE_LABELS: Record<string, string> = {
  office_worker: '직장인을 위한 AI 추천',
  student: '학생/연구자를 위한 AI 추천',
  creator: '크리에이터를 위한 AI 추천',
  business_owner: '사업가를 위한 AI 추천',
};

const ROLE_BADGE_ICONS: Record<string, string> = {
  office_worker: '💼',
  student: '📚',
  creator: '🎨',
  business_owner: '🏪',
};

export default function OnboardingQuestionView({
  title,
  subtitle,
  options,
  selectedValue,
  onSelect,
  roleBadge,
  direction,
}: OnboardingQuestionProps): JSX.Element {
  const animationClass = direction === 'forward'
    ? 'animate-slideInRight'
    : 'animate-slideInLeft';

  return (
    <div className={`min-h-[350px] p-6 ${animationClass}`}>
      {/* Role badge for Q2 */}
      {roleBadge && ROLE_BADGE_LABELS[roleBadge] && (
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
            <span>{ROLE_BADGE_ICONS[roleBadge]}</span>
            {ROLE_BADGE_LABELS[roleBadge]}
          </span>
        </div>
      )}

      <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
        {title}
      </h3>

      {subtitle && (
        <p className="text-sm text-gray-500 text-center mb-6">
          {subtitle}
        </p>
      )}

      {!subtitle && <div className="mb-6" />}

      <div
        role="radiogroup"
        aria-label={title}
        className={`grid gap-3 ${
        options.length <= 3
          ? 'grid-cols-1 sm:grid-cols-3'
          : options.length <= 4
          ? 'grid-cols-1 sm:grid-cols-2'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      }`}>
        {options.map((option) => (
          <QuestionCard
            key={option.value}
            option={option}
            isSelected={selectedValue === option.value}
            onClick={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
