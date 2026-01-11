'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Step } from '@/types';

interface ProgressStepperProps {
  steps: Step[];
  situationSlug: string; // 로컬 스토리지 키용
  onStepComplete?: (stepIndex: number, completed: boolean) => void;
}

const STORAGE_KEY = 'ai-guide-progress';

// 로컬 스토리지에서 진행 상태 불러오기
function getProgress(slug: string): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const progress = JSON.parse(stored);
    return progress[slug] || [];
  } catch {
    return [];
  }
}

// 로컬 스토리지에 진행 상태 저장
function saveProgress(slug: string, completedSteps: number[]) {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const progress = stored ? JSON.parse(stored) : {};
    progress[slug] = completedSteps;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // 저장 실패 무시
  }
}

export default function ProgressStepper({
  steps,
  situationSlug,
  onStepComplete
}: ProgressStepperProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // 컴포넌트 마운트 시 저장된 진행 상태 불러오기
  useEffect(() => {
    const saved = getProgress(situationSlug);
    setCompletedSteps(saved);
  }, [situationSlug]);

  // 단계 토글 핸들러
  const handleStepClick = useCallback((stepOrder: number) => {
    setCompletedSteps(prev => {
      const isCompleted = prev.includes(stepOrder);
      let newCompleted: number[];

      if (isCompleted) {
        // 완료 해제
        newCompleted = prev.filter(s => s !== stepOrder);
      } else {
        // 완료 표시
        newCompleted = [...prev, stepOrder].sort((a, b) => a - b);
      }

      // 로컬 스토리지에 저장
      saveProgress(situationSlug, newCompleted);

      // 콜백 호출
      onStepComplete?.(stepOrder, !isCompleted);

      return newCompleted;
    });
  }, [situationSlug, onStepComplete]);

  // 진행률 계산
  const progressPercent = steps.length > 0
    ? Math.round((completedSteps.length / steps.length) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* 진행률 바 */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-sm font-medium text-gray-500 min-w-[3rem] text-right">
          {completedSteps.length}/{steps.length}
        </span>
      </div>

      {/* 스테퍼 */}
      <div className="relative">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.order);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.order} className="flex gap-4">
              {/* 왼쪽: 원형 배지 + 연결선 */}
              <div className="flex flex-col items-center">
                {/* 원형 배지 */}
                <button
                  type="button"
                  onClick={() => handleStepClick(step.order)}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    transition-all duration-200 cursor-pointer
                    ${isCompleted
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border-2 border-gray-300'
                    }
                  `}
                  title={isCompleted ? '완료 해제' : '완료 표시'}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-sm font-bold">{step.order}</span>
                  )}
                </button>

                {/* 연결선 */}
                {!isLast && (
                  <div
                    className={`
                      w-0.5 flex-1 min-h-[2rem] my-1 transition-colors duration-200
                      ${isCompleted ? 'bg-green-300' : 'bg-gray-200'}
                    `}
                  />
                )}
              </div>

              {/* 오른쪽: 내용 */}
              <div className={`flex-1 pb-6 ${isLast ? 'pb-0' : ''}`}>
                <button
                  type="button"
                  onClick={() => handleStepClick(step.order)}
                  className="text-left w-full group"
                >
                  <h4 className={`
                    font-medium text-sm transition-colors
                    ${isCompleted
                      ? 'text-gray-400 line-through'
                      : 'text-gray-900 group-hover:text-blue-600'
                    }
                  `}>
                    {step.title}
                  </h4>
                  <p className={`
                    text-xs mt-1 transition-colors
                    ${isCompleted ? 'text-gray-300' : 'text-gray-500'}
                  `}>
                    {step.description}
                  </p>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 완료 메시지 */}
      {progressPercent === 100 && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200 text-center">
          <span className="text-green-600 font-medium text-sm">
            🎉 모든 단계를 완료했어요!
          </span>
        </div>
      )}
    </div>
  );
}
