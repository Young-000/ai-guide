'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { OnboardingResult } from '@/types/onboarding';
import { decodeOnboardingResult, generateRecommendation } from '@/lib/onboardingEngine';
import { loadOnboardingResult, saveOnboardingResult } from '@/lib/onboardingStorage';
import { trackOnboardingComplete } from '@/lib/analytics';
import ResultPrimaryCard from '@/components/onboarding/ResultPrimaryCard';
import ResultAlternatives from '@/components/onboarding/ResultAlternatives';
import ResultSituations from '@/components/onboarding/ResultSituations';
import ResultShareBar from '@/components/onboarding/ResultShareBar';
import AffiliateDisclosure from '@/components/AffiliateDisclosure';

function OnboardingResultContent(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<OnboardingResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try URL params first
    const encoded = searchParams.get('r');
    if (encoded) {
      const answers = decodeOnboardingResult(encoded);
      if (answers) {
        const rec = generateRecommendation(answers);
        setResult(rec);
        // Track onboarding completion
        trackOnboardingComplete(answers.role);
        // Also save to localStorage for future visits
        saveOnboardingResult(answers, rec.primaryTool?.slug ?? null);
        setIsLoading(false);
        return;
      }
    }

    // Fallback: try localStorage
    const stored = loadOnboardingResult();
    if (stored) {
      const rec = generateRecommendation(stored.answers);
      setResult(rec);
      trackOnboardingComplete(stored.answers.role);
      setIsLoading(false);
      return;
    }

    // No data at all - redirect to onboarding
    router.replace('/onboarding');
  }, [searchParams, router]);

  const shareUrl = useMemo((): string => {
    if (typeof window === 'undefined') return '';
    return window.location.href;
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">추천 결과를 분석하고 있어요...</p>
        </div>
      </div>
    );
  }

  if (!result) return <div />;

  const { primaryTool, primaryReason, alternatives, recommendedSituation, relatedSituations, personalizedReason } = result;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <span className="text-5xl mb-4 block">🎯</span>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            {personalizedReason}
          </h1>
          <p className="text-gray-500 text-sm">
            답변을 분석해서 가장 적합한 AI를 찾았어요
          </p>
        </div>

        {/* Primary tool recommendation */}
        {primaryTool && recommendedSituation && (
          <ResultPrimaryCard
            tool={primaryTool}
            reason={primaryReason}
            situation={recommendedSituation}
          />
        )}

        {/* No result fallback */}
        {!primaryTool && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <span className="text-4xl mb-3 block">🤔</span>
            <p className="text-gray-600 font-medium mb-2">
              조건에 맞는 AI 도구를 찾지 못했어요
            </p>
            <p className="text-gray-400 text-sm mb-6">
              다른 옵션을 선택하거나 전체 도구를 둘러보세요
            </p>
            <div className="flex justify-center gap-3">
              <Link
                href="/onboarding"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                다시 설문하기
              </Link>
              <Link
                href="/tools"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                전체 도구 보기
              </Link>
            </div>
          </div>
        )}

        {/* Recommended situations / guides */}
        <ResultSituations
          situations={relatedSituations}
          recommendedSituation={recommendedSituation}
        />

        {/* Alternative tools */}
        <ResultAlternatives alternatives={alternatives} />

        {/* Share bar + dissatisfaction section + affiliate disclosure */}
        <ResultShareBar shareUrl={shareUrl} />

        <AffiliateDisclosure />
      </div>
    </div>
  );
}

export default function OnboardingResultPage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OnboardingResultContent />
    </Suspense>
  );
}
