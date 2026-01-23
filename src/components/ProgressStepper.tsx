'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Step } from '@/types';
import { getProgressManager } from '@/lib/progress';

interface ProgressStepperProps {
  steps: Step[];
  situationSlug: string;
  onStepComplete?: (stepIndex: number, completed: boolean) => void;
}

export default function ProgressStepper({
  steps,
  situationSlug,
  onStepComplete
}: ProgressStepperProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [xpGained, setXpGained] = useState<number | null>(null);
  const celebrationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current);
      }
    };
  }, []);

  // 컴포넌트 마운트 시 저장된 진행 상태 불러오기
  useEffect(() => {
    const manager = getProgressManager();
    setCompletedSteps(manager.getCompletedSteps(situationSlug));

    const unsubscribe = manager.subscribe((progress) => {
      setCompletedSteps(progress.completedSteps[situationSlug] || []);
    });

    return unsubscribe;
  }, [situationSlug]);

  // 단계 토글 핸들러
  const handleStepClick = useCallback((stepOrder: number) => {
    const manager = getProgressManager();
    const isCompleted = completedSteps.includes(stepOrder);

    if (!isCompleted) {
      // 완료 표시 + XP 획득
      manager.markStepComplete(situationSlug, stepOrder, steps.length);

      // XP 표시
      setXpGained(10);
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current);
      }
      celebrationTimeoutRef.current = setTimeout(() => setXpGained(null), 1500);

      // 모든 스텝 완료 시 축하 애니메이션
      const newCompleted = [...completedSteps, stepOrder];
      if (newCompleted.length === steps.length) {
        setShowCelebration(true);
        if (celebrationTimeoutRef.current) {
          clearTimeout(celebrationTimeoutRef.current);
        }
        celebrationTimeoutRef.current = setTimeout(() => {
          setShowCelebration(false);
          setXpGained(null);
        }, 3000);
      }

      // 콜백 호출
      onStepComplete?.(stepOrder, true);
    }
  }, [completedSteps, situationSlug, steps.length, onStepComplete]);

  // 진행률 계산
  const progressPercent = steps.length > 0
    ? Math.round((completedSteps.length / steps.length) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* 진행률 바 */}
      <div className="flex items-center gap-3">
        <div
          className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`진행률 ${progressPercent}%`}
        >
          <div
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-sm font-medium text-gray-500 min-w-[3rem] text-right" aria-live="polite">
          {completedSteps.length}/{steps.length}
        </span>
      </div>

      {/* XP 획득 알림 */}
      {xpGained && !showCelebration && (
        <div className="text-center animate-bounce" role="status" aria-live="polite">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
            +{xpGained} XP 획득
          </span>
        </div>
      )}

      {/* 완료 축하 메시지 */}
      {showCelebration && (
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 text-center animate-pulse" role="alert" aria-live="assertive">
          <span className="text-3xl mb-2 block" aria-hidden="true">🎉</span>
          <p className="text-green-700 font-bold">모든 단계 완료!</p>
          <p className="text-green-600 text-sm">+30 XP 보너스 획득!</p>
        </div>
      )}

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
                    focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
                    ${isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-600 border-2 border-gray-300 hover:border-blue-400'
                    }
                  `}
                  aria-label={isCompleted ? `${step.order}단계 ${step.title} 완료됨` : `${step.order}단계 ${step.title} 완료 표시하기`}
                  aria-pressed={isCompleted}
                  disabled={isCompleted}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-sm font-bold" aria-hidden="true">{step.order}</span>
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
                  disabled={isCompleted}
                >
                  <div className="flex items-center gap-2">
                    <h4 className={`
                      font-medium text-sm transition-colors flex-1
                      ${isCompleted
                        ? 'text-gray-400 line-through'
                        : 'text-gray-900 group-hover:text-blue-600'
                      }
                    `}>
                      {step.title}
                    </h4>
                    {!isCompleted && (
                      <span className="text-xs text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        +10 XP
                      </span>
                    )}
                  </div>
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
    </div>
  );
}
