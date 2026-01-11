'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import type { Situation, Tool } from '@/types';
import toolsData from '@/data/tools.json';
import ProgressStepper from './ProgressStepper';

const tools = toolsData.tools as Tool[];

const getToolInfo = (slug: string): Tool | undefined => tools.find((t) => t.slug === slug);

const difficultyLabels = {
  easy: { text: '쉬움', color: 'bg-green-100 text-green-700' },
  medium: { text: '보통', color: 'bg-yellow-100 text-yellow-700' },
  hard: { text: '어려움', color: 'bg-red-100 text-red-700' },
};

interface GuidePanelProps {
  situation: Situation;
  onClose: () => void;
  embedded?: boolean; // 모달 안에 임베드될 때 true
}

export default function GuidePanel({ situation, onClose, embedded = false }: GuidePanelProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const difficulty = difficultyLabels[situation.difficulty];
  const primaryTool = situation.recommendedTools.find((t) => t.isPrimary);
  const otherTools = situation.recommendedTools.filter((t) => !t.isPrimary);

  const copyToClipboard = useCallback(async (text: string, index: number) => {
    if (typeof window === 'undefined' || !navigator?.clipboard) {
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
    }
  }, []);

  return (
    <div className={`bg-white overflow-hidden h-full flex flex-col ${embedded ? '' : 'rounded-2xl border border-gray-200 shadow-lg'}`}>
      {/* 헤더 - embedded일 때는 간소화 */}
      {!embedded && (
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{situation.icon}</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${difficulty.color}`}>
                {difficulty.text}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">{situation.title}</h2>
          <p className="text-gray-500">{situation.subtitle}</p>
          <div className="flex items-center gap-2 mt-3 text-sm text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>예상 소요: {situation.timeToComplete}</span>
          </div>
        </div>
      )}

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* 문제 상황 */}
        <section className="bg-gray-50 rounded-xl p-4">
          <h3 className="text-sm font-bold text-gray-700 mb-2">💭 이런 상황이라면</h3>
          <p className="text-gray-600 text-sm">{situation.problem}</p>
        </section>

        {/* 추천 도구 */}
        <section>
          <h3 className="text-sm font-bold text-gray-900 mb-3">🏆 추천 도구</h3>

          {/* 최우선 추천 */}
          {primaryTool && (() => {
            const toolInfo = getToolInfo(primaryTool.slug);
            return (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded">BEST</span>
                  <span className="font-bold text-gray-900">
                    {toolInfo?.icon} {primaryTool.name}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{primaryTool.reason}</p>
                <div className="flex flex-wrap gap-2">
                  {toolInfo?.url && (
                    <a
                      href={toolInfo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      바로가기
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                  <Link
                    href={`/tools/${primaryTool.slug}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-blue-600 text-sm font-medium rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                  >
                    📖 설치/사용법
                  </Link>
                </div>
              </div>
            );
          })()}

          {/* 대안 도구 */}
          {otherTools.length > 0 && (
            <div className="space-y-2">
              {otherTools.map((tool) => {
                const toolInfo = getToolInfo(tool.slug);
                return (
                  <div key={tool.slug} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900 text-sm">
                        {toolInfo?.icon} {tool.name}
                      </span>
                      <p className="text-xs text-gray-500">{tool.reason}</p>
                    </div>
                    <Link
                      href={`/tools/${tool.slug}`}
                      className="text-blue-500 hover:text-blue-600 text-xs font-medium"
                    >
                      자세히 →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 단계별 방법 - 프로그레스 스테퍼 */}
        <section>
          <h3 className="text-sm font-bold text-gray-900 mb-3">📝 따라하기</h3>
          <ProgressStepper
            steps={situation.steps}
            situationSlug={situation.slug}
          />
        </section>

        {/* 프롬프트 */}
        <section>
          <h3 className="text-sm font-bold text-gray-900 mb-3">💬 바로 쓰는 프롬프트</h3>
          <div className="space-y-3">
            {situation.prompts.map((prompt, index) => (
              <div key={index} className="bg-gray-900 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-gray-800">
                  <span className="text-white text-sm font-medium">{prompt.title}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(prompt.content, index)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      copiedIndex === index
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {copiedIndex === index ? '✓ 복사됨' : '복사'}
                  </button>
                </div>
                <pre className="p-3 text-gray-100 text-xs whitespace-pre-wrap font-mono leading-relaxed">
                  {prompt.content}
                </pre>
                {prompt.tip && (
                  <div className="px-3 py-2 bg-gray-800 border-t border-gray-700">
                    <p className="text-xs text-gray-400">
                      <span className="text-yellow-400">Tip:</span> {prompt.tip}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 기대 결과 */}
        <section className="bg-green-50 rounded-xl p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-green-500">✓</span> 기대 결과
          </h3>
          <p className="text-sm text-gray-600">{situation.expectedResult}</p>
        </section>
      </div>
    </div>
  );
}
