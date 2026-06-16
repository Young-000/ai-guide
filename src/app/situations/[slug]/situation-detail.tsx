'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import type { Situation } from '@/types';
import { getToolBySlug } from '@/lib/tools';
import { ShareButton } from '@/components';
import { buildToolUrl } from '@/lib/affiliateLinks';
import { trackToolClick, trackPromptCopy } from '@/lib/analytics';
import { getProgressManager } from '@/lib/progress';
import AdUnit from '@/components/AdUnit';
import AffiliateDisclosure from '@/components/AffiliateDisclosure';
import useCasesData from '@/data/use-cases.json';
import tipsData from '@/data/tips.json';
import type { UseCaseStory, Tip } from '@/types';

const difficultyLabels = {
  easy: { text: '쉬움', color: 'bg-green-100 text-green-700', description: '처음 해도 쉽게 따라할 수 있어요' },
  medium: { text: '보통', color: 'bg-yellow-100 text-yellow-700', description: '몇 번 해보면 익숙해져요' },
  hard: { text: '어려움', color: 'bg-red-100 text-red-700', description: '약간의 사전 지식이 필요해요' },
};

interface SituationDetailProps {
  readonly situation: Situation;
  readonly relatedSituations: readonly Situation[];
}

export default function SituationDetail({ situation, relatedSituations }: SituationDetailProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const difficulty = difficultyLabels[situation.difficulty];
  const primaryTool = situation.recommendedTools.find(t => t.isPrimary);
  const otherTools = situation.recommendedTools.filter(t => !t.isPrimary);

  const copyToClipboard = useCallback(async (text: string, index: number) => {
    // SSR 환경에서는 navigator가 없으므로 체크
    if (typeof window === 'undefined' || !navigator?.clipboard) {
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      trackPromptCopy(situation.slug, index);
      // 프롬프트 복사 추적 (진도 시스템)
      const manager = getProgressManager();
      manager.trackPromptCopy();
      // 이전 timeout 정리
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
    }
  }, [situation.slug]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 뒤로가기 */}
      <Link
        href="/situations"
        className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        상황 목록으로
      </Link>

      {/* 헤더 */}
      <header className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{situation.icon}</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficulty.color}`}>
              {difficulty.text}
            </span>
          </div>
          <ShareButton
            title={`${situation.title} | AIWire`}
            description={situation.subtitle}
          />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          {situation.title}
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          {situation.subtitle}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            예상 소요: {situation.timeToComplete}
          </span>
          <span>{difficulty.description}</span>
        </div>
      </header>

      {/* 문제 상황 */}
      <section className="bg-gray-50 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-2">이런 상황이라면</h2>
        <p className="text-gray-700">{situation.problem}</p>
      </section>

      {/* 추천 도구 */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">추천 AI 도구</h2>

        {/* 최우선 추천 */}
        {primaryTool && (() => {
          const primaryToolInfo = getToolBySlug(primaryTool.slug);
          return (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-4 border-2 border-blue-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded">
                      BEST
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">
                      {primaryToolInfo?.icon} {primaryTool.name}
                    </h3>
                  </div>
                  <p className="text-gray-700 mb-4">{primaryTool.reason}</p>
                  <div className="flex flex-wrap gap-3">
                    {primaryToolInfo?.url && (
                      <a
                        href={buildToolUrl(primaryToolInfo.url, primaryTool.slug, 'situation-detail')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                        onClick={() => trackToolClick(primaryTool.name, 'situation-detail')}
                      >
                        {primaryTool.name} 바로가기
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                    <Link
                      href={`/tools/${primaryTool.slug}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                    >
                      사용법 & 설치 가이드
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 대안 도구 */}
        {otherTools.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 font-medium">다른 선택지</p>
            {otherTools.map((tool) => {
              const toolInfo = getToolBySlug(tool.slug);
              return (
                <div
                  key={tool.slug}
                  className="bg-white rounded-xl p-4 border border-gray-100 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {toolInfo?.icon} {tool.name}
                    </h3>
                    <p className="text-sm text-gray-600">{tool.reason}</p>
                  </div>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="text-blue-500 hover:text-blue-600 text-sm font-medium whitespace-nowrap"
                  >
                    자세히 →
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 단계별 방법 */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">따라하기</h2>
        <div className="space-y-4">
          {situation.steps.map((step) => (
            <div key={step.order} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                {step.order}
              </div>
              <div className="flex-1 pt-1">
                <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ad: between 따라하기 and 바로 쓰는 프롬프트 */}
      <AdUnit
        slot={process.env.NEXT_PUBLIC_ADSENSE_CONTENT_SLOT ?? ''}
        format="rectangle"
        className="my-8"
        dataPage="situation-detail"
      />

      {/* 프롬프트 */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">바로 쓰는 프롬프트</h2>
        <div className="space-y-4">
          {situation.prompts.map((prompt, index) => (
            <div key={index} className="bg-gray-900 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-800">
                <h3 className="text-white font-medium">{prompt.title}</h3>
                <button
                  onClick={() => copyToClipboard(prompt.content, index)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    copiedIndex === index
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {copiedIndex === index ? '복사됨!' : '복사'}
                </button>
              </div>
              <pre className="p-4 text-gray-100 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                {prompt.content}
              </pre>
              {prompt.tip && (
                <div className="px-4 py-3 bg-gray-800 border-t border-gray-700">
                  <p className="text-sm text-gray-400">
                    <span className="text-yellow-400">Tip:</span> {prompt.tip}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 기대 결과 */}
      <section className="bg-green-50 rounded-2xl p-6 mb-10">
        <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <span className="text-green-500">✓</span> 기대 결과
        </h2>
        <p className="text-gray-700">{situation.expectedResult}</p>
      </section>

      {/* 관련 활용 사례 */}
      {(() => {
        const relatedUseCases = (useCasesData.useCases as UseCaseStory[])
          .filter((uc) => uc.situation === situation.slug)
          .slice(0, 2);

        if (relatedUseCases.length === 0) return null;

        return (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">이 상황의 활용 사례</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {relatedUseCases.map((uc) => (
                <Link
                  key={uc.slug}
                  href={`/use-cases/${uc.slug}`}
                  className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all"
                >
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    {uc.professionLabel}
                  </span>
                  <h3 className="font-bold text-gray-900 text-sm mt-2 mb-1 leading-snug">
                    {uc.title}
                  </h3>
                  <p className="text-xs text-green-700 font-medium">{uc.resultHighlight}</p>
                </Link>
              ))}
            </div>
          </section>
        );
      })()}

      {/* 관련 팁 */}
      {(() => {
        const relatedTips = (tipsData.tips as Tip[])
          .filter((tip) => tip.relatedSituations.includes(situation.slug))
          .slice(0, 3);

        if (relatedTips.length === 0) return null;

        return (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">관련 팁</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {relatedTips.map((tip) => {
                const tipCategory = tipsData.categories.find((c) => c.id === tip.category);
                return (
                  <Link
                    key={tip.slug}
                    href={`/tips/${tip.slug}`}
                    className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all"
                  >
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
                      {tipCategory?.icon} {tipCategory?.name}
                    </span>
                    <h3 className="font-bold text-gray-900 text-sm mt-2 leading-snug">
                      {tip.title}
                    </h3>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })()}

      {/* 관련 상황 */}
      {relatedSituations.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">비슷한 상황 더 보기</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {relatedSituations.map((related) => (
              <Link
                key={related.slug}
                href={`/situations/${related.slug}`}
                className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{related.icon}</span>
                  <h3 className="font-bold text-gray-900">{related.title}</h3>
                </div>
                <p className="text-sm text-gray-500">{related.subtitle}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 하단 CTA */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-2">
          다른 상황도 궁금하다면?
        </h2>
        <p className="text-gray-300 mb-6">
          상황별 AI 사용법을 더 찾아보세요.
        </p>
        <Link
          href="/situations"
          className="inline-block px-6 py-3 bg-white text-gray-900 font-medium rounded-xl hover:bg-gray-100 transition-colors"
        >
          모든 상황 보기 →
        </Link>
      </section>

      <AffiliateDisclosure />
    </div>
  );
}
