'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { OnboardingAnswers, OnboardingQuestion as OnboardingQuestionType } from '@/types/onboarding';
import onboardingData from '@/data/onboarding.json';
import { generateRecommendation, encodeOnboardingResult } from '@/lib/onboardingEngine';
import { saveOnboardingResult } from '@/lib/onboardingStorage';
import { trackOnboardingStart } from '@/lib/analytics';
import StepIndicator from './StepIndicator';
import OnboardingQuestionView from './OnboardingQuestion';

const questions = onboardingData.questions as OnboardingQuestionType[];
const TOTAL_STEPS = questions.length;
const AUTO_ADVANCE_DELAY = 300;

export default function OnboardingWizard(): JSX.Element {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<OnboardingAnswers>>({});
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return (): void => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Track onboarding start when first question renders
  useEffect(() => {
    trackOnboardingStart();
  }, []);

  const currentQuestion = questions[currentStep];

  // Resolve dynamic options for Q2 based on Q1 answer
  const currentOptions = useMemo(() => {
    if (!currentQuestion) return [];
    if (currentQuestion.dynamicOptions && answers.role) {
      return currentQuestion.dynamicOptions[answers.role] ?? currentQuestion.options;
    }
    return currentQuestion.options;
  }, [currentQuestion, answers.role]);

  // Get current answer for this step
  const currentAnswer = useMemo((): string | undefined => {
    if (!currentQuestion) return undefined;
    const key = currentQuestion.id as keyof OnboardingAnswers;
    return answers[key];
  }, [currentQuestion, answers]);

  // Handle completing the survey
  const handleComplete = useCallback((finalAnswers: OnboardingAnswers) => {
    const result = generateRecommendation(finalAnswers);

    // Save to localStorage
    saveOnboardingResult(finalAnswers, result.primaryTool?.slug ?? null);

    // Navigate to result page with encoded params
    const encoded = encodeOnboardingResult(finalAnswers);
    router.push(`/onboarding/result?r=${encoded}`);
  }, [router]);

  // Handle option selection
  const handleSelect = useCallback((value: string) => {
    if (!currentQuestion) return;

    const key = currentQuestion.id as keyof OnboardingAnswers;
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);

    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Auto-advance after delay
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      if (currentStep === TOTAL_STEPS - 1) {
        // Last question - complete survey
        handleComplete(newAnswers as OnboardingAnswers);
      } else {
        setDirection('forward');
        setCurrentStep(prev => prev + 1);
      }
    }, AUTO_ADVANCE_DELAY);
  }, [currentQuestion, currentStep, answers, handleComplete]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection('backward');
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Handle skip - navigate to situations page
  const handleSkip = useCallback(() => {
    router.push('/situations');
  }, [router]);

  if (!currentQuestion) return <div />;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Step indicator */}
      <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      {/* ARIA live region for step announcements */}
      <div aria-live="polite" className="sr-only">
        {currentQuestion
          ? `${currentStep + 1}/${TOTAL_STEPS} 단계: ${currentQuestion.title}`
          : ''}
      </div>

      {/* Question content */}
      <OnboardingQuestionView
        key={`step-${currentStep}`}
        title={currentQuestion.title}
        subtitle={currentQuestion.subtitle}
        options={currentOptions}
        selectedValue={currentAnswer}
        onSelect={handleSelect}
        roleBadge={currentQuestion.id === 'purpose' ? (answers.role ?? null) : null}
        direction={direction}
      />

      {/* Footer navigation */}
      <div className="px-6 pb-6 flex items-center justify-between">
        {currentStep === 0 ? (
          <a
            href="/"
            className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors text-sm flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            홈으로
          </a>
        ) : (
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors text-sm flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            이전
          </button>
        )}

        <div className="flex items-center gap-3">
          {/* Skip link - always visible */}
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
          >
            바로 가이드 보기
          </button>

          {/* Next button - only shown when answer is selected */}
          {currentAnswer && (
            <button
              type="button"
              onClick={() => {
                if (timeoutRef.current) {
                  clearTimeout(timeoutRef.current);
                }
                if (currentStep === TOTAL_STEPS - 1) {
                  handleComplete(answers as OnboardingAnswers);
                } else {
                  setDirection('forward');
                  setCurrentStep(prev => prev + 1);
                }
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center gap-1"
            >
              {currentStep === TOTAL_STEPS - 1 ? '결과 보기' : '다음'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
