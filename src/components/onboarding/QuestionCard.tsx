'use client';

import type { OnboardingOptionCard } from '@/types/onboarding';

interface QuestionCardProps {
  option: OnboardingOptionCard;
  isSelected: boolean;
  onClick: (value: string) => void;
}

export default function QuestionCard({ option, isSelected, onClick }: QuestionCardProps): JSX.Element {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={() => onClick(option.value)}
      className={`
        relative p-4 sm:p-5 rounded-xl border-2 text-left transition-all duration-200 group
        min-h-[80px] sm:min-h-[100px]
        ${isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
        }
      `}
    >
      {/* Checkmark for selected state */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className={`text-2xl sm:text-3xl transition-transform duration-200 ${
          isSelected ? 'scale-110' : 'group-hover:scale-110'
        }`}>
          {option.icon}
        </span>
        <div className="flex-1 min-w-0">
          <span className={`font-semibold text-sm sm:text-base block ${
            isSelected ? 'text-blue-700' : 'text-gray-900'
          }`}>
            {option.label}
          </span>
          <span className={`text-xs sm:text-sm mt-0.5 block ${
            isSelected ? 'text-blue-600' : 'text-gray-500'
          }`}>
            {option.description}
          </span>
        </div>
      </div>
    </button>
  );
}
