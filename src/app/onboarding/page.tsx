'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import ReturningUserBanner from '@/components/onboarding/ReturningUserBanner';
import {
  hasOnboardingResult,
  loadOnboardingResult,
  clearOnboardingResult,
} from '@/lib/onboardingStorage';
import { encodeOnboardingResult } from '@/lib/onboardingEngine';

export default function OnboardingPage(): JSX.Element {
  const router = useRouter();
  const [hasPrevious, setHasPrevious] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const exists = hasOnboardingResult();
    setHasPrevious(exists);
    setShowBanner(exists);
  }, []);

  const handleViewPrevious = useCallback(() => {
    const stored = loadOnboardingResult();
    if (stored) {
      const encoded = encodeOnboardingResult(stored.answers);
      router.push(`/onboarding/result?r=${encoded}`);
    }
  }, [router]);

  const handleStartFresh = useCallback(() => {
    clearOnboardingResult();
    setHasPrevious(false);
    setShowBanner(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white py-8 px-4">
      {/* Page header */}
      <div className="text-center mb-8">
        <span className="text-4xl mb-3 block">🎯</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          나에게 맞는 AI 찾기
        </h1>
        <p className="text-gray-500 text-sm sm:text-base">
          4가지 질문에 답하면 딱 맞는 AI를 추천해드려요
        </p>
      </div>

      {/* Returning user banner */}
      {hasPrevious && showBanner && (
        <div className="max-w-2xl mx-auto mb-4">
          <ReturningUserBanner
            onViewPrevious={handleViewPrevious}
            onStartFresh={handleStartFresh}
          />
        </div>
      )}

      {/* Main wizard */}
      <OnboardingWizard />
    </div>
  );
}
