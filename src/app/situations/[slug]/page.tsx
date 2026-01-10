'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import situationsData from '@/data/situations.json';
import toolsData from '@/data/tools.json';

interface Tool {
  slug: string;
  name: string;
  url: string;
  icon?: string;
}

interface RecommendedTool {
  slug: string;
  name: string;
  reason: string;
  isPrimary: boolean;
}

interface Step {
  order: number;
  title: string;
  description: string;
}

interface Prompt {
  title: string;
  content: string;
  tip?: string;
}

interface Situation {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  icon: string;
  problem: string;
  recommendedTools: RecommendedTool[];
  steps: Step[];
  prompts: Prompt[];
  expectedResult: string;
  timeToComplete: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const difficultyLabels = {
  easy: { text: '쉬움', color: 'bg-green-100 text-green-700', description: '처음 해도 쉽게 따라할 수 있어요' },
  medium: { text: '보통', color: 'bg-yellow-100 text-yellow-700', description: '몇 번 해보면 익숙해져요' },
  hard: { text: '어려움', color: 'bg-red-100 text-red-700', description: '약간의 사전 지식이 필요해요' },
};

export default function SituationDetailPage({ params }: { params: { slug: string } }) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const situations = situationsData.situations as Situation[];
  const tools = toolsData.tools as Tool[];
  const situation = situations.find((s) => s.slug === params.slug);

  if (!situation) {
    notFound();
  }

  const difficulty = difficultyLabels[situation.difficulty];
  const primaryTool = situation.recommendedTools.find(t => t.isPrimary);
  const otherTools = situation.recommendedTools.filter(t => !t.isPrimary);

  const getToolInfo = (slug: string) => tools.find((t) => t.slug === slug);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // 같은 카테고리의 다른 상황 추천
  const relatedSituations = situations
    .filter(s => s.category === situation.category && s.slug !== situation.slug)
    .slice(0, 3);

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
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{situation.icon}</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficulty.color}`}>
            {difficulty.text}
          </span>
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
        {primaryTool && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-4 border-2 border-blue-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded">
                    BEST
                  </span>
                  <h3 className="text-xl font-bold text-gray-900">
                    {getToolInfo(primaryTool.slug)?.icon} {primaryTool.name}
                  </h3>
                </div>
                <p className="text-gray-700 mb-4">{primaryTool.reason}</p>
                <a
                  href={getToolInfo(primaryTool.slug)?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  {primaryTool.name} 바로가기
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* 대안 도구 */}
        {otherTools.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 font-medium">다른 선택지</p>
            {otherTools.map((tool) => {
              const toolInfo = getToolInfo(tool.slug);
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
    </div>
  );
}
