'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { SurveyQuestion, SurveyAnswer, SurveyResult, Situation, SurveyOption } from '@/types';
import surveyData from '@/data/survey.json';
import { getSurveyResult, getDynamicOptions } from '@/lib/surveyLogic';
import { getToolBySlug } from '@/lib/tools';
import ProgressStepper from './ProgressStepper';

interface RawQuestion {
  id: string;
  title: string;
  options: SurveyOption[];
  dependsOn?: {
    [questionId: string]: {
      [optionValue: string]: SurveyOption[];
    };
  };
}

const questions = surveyData.questions as RawQuestion[];

interface SurveyWizardProps {
  onComplete: (result: SurveyResult) => void;
  onClose: () => void;
}

// 가이드 단계 정의
const guideSteps = [
  { id: 'recommend', label: '추천', icon: '🎯' },
  { id: 'setup', label: '설치/사용법', icon: '⚙️' },
  { id: 'prompts', label: '프롬프트', icon: '💬' },
  { id: 'steps', label: '따라하기', icon: '📝' },
];

export default function SurveyWizard({
  onComplete,
  onClose
}: SurveyWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswer[]>([]);
  const [result, setResult] = useState<SurveyResult | null>(null);
  const [guideStep, setGuideStep] = useState(0); // 가이드 단계 (0: 추천, 1: 설치/사용법, 2: 프롬프트, 3: 따라하기)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // setTimeout 정리를 위한 ref
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 컴포넌트 언마운트 시 setTimeout 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const totalSteps = questions.length;
  const isLastQuestion = currentStep === totalSteps - 1;
  const showResult = currentStep >= totalSteps;

  // 결과 계산 및 표시 (중복 로직 통합)
  const completeAndShowResult = useCallback((finalAnswers: SurveyAnswer[]) => {
    const surveyResult = getSurveyResult(finalAnswers);
    setResult(surveyResult);
    onComplete(surveyResult);
    setCurrentStep(totalSteps);
  }, [onComplete, totalSteps]);

  // 현재 질문
  const currentQuestion = questions[currentStep] as SurveyQuestion | undefined;

  // 동적 옵션 (의존성 기반)
  const currentOptions = useMemo((): SurveyOption[] => {
    if (!currentQuestion) return [];

    // 동적 옵션 확인
    const dynamicOpts = getDynamicOptions(currentQuestion.id, answers);
    if (dynamicOpts) return dynamicOpts;

    return currentQuestion.options;
  }, [currentQuestion, answers]);

  // 옵션 선택 핸들러
  const handleOptionSelect = useCallback((value: string) => {
    const questionId = currentQuestion?.id;
    if (!questionId) return;

    const newAnswers = [
      ...answers.filter(a => a.questionId !== questionId),
      { questionId, value }
    ];
    setAnswers(newAnswers);

    // 이전 timeout 정리
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 자동으로 다음 단계로 (ref로 관리하여 언마운트 시 정리 가능)
    timeoutRef.current = setTimeout(() => {
      if (isLastQuestion) {
        completeAndShowResult(newAnswers);
      } else {
        setCurrentStep(prev => prev + 1);
      }
    }, 250);
  }, [currentQuestion, isLastQuestion, answers, completeAndShowResult]);

  // 이전 단계
  const handleBack = useCallback(() => {
    if (showResult && guideStep > 0) {
      setGuideStep(prev => prev - 1);
    } else if (showResult && guideStep === 0) {
      setCurrentStep(totalSteps - 1);
      setResult(null);
      setGuideStep(0);
    } else if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep, showResult, guideStep, totalSteps]);

  // 다시 시작
  const handleRestart = useCallback(() => {
    setCurrentStep(0);
    setAnswers([]);
    setResult(null);
    setGuideStep(0);
  }, []);

  // 다음 가이드 단계로
  const handleNextGuideStep = useCallback(() => {
    if (guideStep < guideSteps.length - 1) {
      setGuideStep(prev => prev + 1);
    }
  }, [guideStep]);

  // 상황 선택
  const handleSituationClick = useCallback((situation: Situation) => {
    if (result) {
      setResult({
        ...result,
        bestMatch: situation,
        matchReason: `"${situation.title}"를 선택하셨어요!`
      });
    }
    setGuideStep(1); // 설치/사용법 단계로 이동
  }, [result]);

  // 프롬프트 복사
  const copyToClipboard = useCallback(async (text: string, index: number) => {
    if (typeof window === 'undefined' || !navigator?.clipboard) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
    }
  }, []);

  // 현재 선택된 값
  const currentAnswer = answers.find(a => a.questionId === currentQuestion?.id)?.value;

  // 현재 선택된 상황의 도구 정보
  const currentSituation = result?.bestMatch;
  const primaryTool = currentSituation?.recommendedTools.find(t => t.isPrimary);
  const primaryToolInfo = primaryTool ? getToolBySlug(primaryTool.slug) : null;
  const otherTools = currentSituation?.recommendedTools.filter(t => !t.isPrimary) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 */}
      <div className={`relative w-full ${showResult ? 'max-w-3xl' : 'max-w-2xl'} bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300`}>
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔍</span>
            <h2 className="font-bold text-gray-900">맞춤 AI 찾기</h2>
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

        {/* 진행률 바 */}
        {!showResult && (
          <div className="px-6 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-500 font-medium">
                {currentStep + 1}/{totalSteps}
              </span>
            </div>
            {/* 단계 아이콘 */}
            <div className="flex justify-center gap-1 mt-2">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                    idx < currentStep
                      ? 'bg-blue-500 text-white'
                      : idx === currentStep
                      ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-500'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {idx < currentStep ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 콘텐츠 */}
        <div className={`${showResult ? '' : 'p-6'}`}>
          {showResult && result ? (
            // 통합 step-by-step 가이드 화면
            <div className="flex flex-col h-[70vh]">
              {/* 가이드 단계 탭 */}
              <div className="flex border-b border-gray-200 px-4">
                {guideSteps.map((step, idx) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setGuideStep(idx)}
                    className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      guideStep === idx
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span>{step.icon}</span>
                    <span className="hidden sm:inline">{step.label}</span>
                  </button>
                ))}
              </div>

              {/* 가이드 콘텐츠 */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Step 0: 추천 */}
                {guideStep === 0 && (
                  <div className="space-y-6">
                    <div className="text-center mb-4">
                      <span className="text-4xl mb-2 block">🎯</span>
                      <h3 className="text-lg font-bold text-gray-900">{result.matchReason}</h3>
                    </div>

                    {result.bestMatch && (
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-5 text-white">
                        <div className="flex items-start gap-4">
                          <span className="text-4xl">{result.bestMatch.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">BEST</span>
                              <span className="text-xs opacity-80">{result.bestMatch.timeToComplete}</span>
                            </div>
                            <h4 className="text-lg font-bold mb-1">{result.bestMatch.title}</h4>
                            <p className="text-sm text-white/80">{result.bestMatch.subtitle}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 문제 상황 설명 */}
                    {currentSituation && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-gray-700 mb-2">💭 이런 상황이라면</h4>
                        <p className="text-gray-600 text-sm">{currentSituation.problem}</p>
                      </div>
                    )}

                    {/* 다른 추천 */}
                    {result.recommendedSituations.length > 1 && (
                      <div>
                        <h4 className="text-sm font-bold text-gray-500 mb-3">다른 선택지</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {result.recommendedSituations.slice(1, 5).map((situation) => (
                            <button
                              key={situation.slug}
                              type="button"
                              onClick={() => handleSituationClick(situation)}
                              className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{situation.icon}</span>
                                <span className="text-sm font-medium text-gray-900 line-clamp-1">{situation.title}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 1: 설치/사용법 */}
                {guideStep === 1 && currentSituation && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-900">🏆 추천 도구</h3>

                    {primaryTool && primaryToolInfo && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded">BEST</span>
                          <span className="font-bold text-gray-900 text-lg">
                            {primaryToolInfo.icon} {primaryTool.name}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4">{primaryTool.reason}</p>

                        <div className="flex flex-wrap gap-3">
                          {primaryToolInfo.url && (
                            <a
                              href={primaryToolInfo.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              {primaryTool.name} 열기
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 대안 도구 */}
                    {otherTools.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-gray-500 mb-3">대안 도구</h4>
                        <div className="space-y-2">
                          {otherTools.map((tool) => {
                            const toolInfo = getToolBySlug(tool.slug);
                            return (
                              <div key={tool.slug} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <span className="font-medium text-gray-900">
                                    {toolInfo?.icon} {tool.name}
                                  </span>
                                  <p className="text-xs text-gray-500">{tool.reason}</p>
                                </div>
                                {toolInfo?.url && (
                                  <a
                                    href={toolInfo.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                                  >
                                    열기 →
                                  </a>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 기대 결과 */}
                    <div className="bg-green-50 rounded-xl p-4">
                      <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <span className="text-green-500">✓</span> 기대 결과
                      </h4>
                      <p className="text-sm text-gray-600">{currentSituation.expectedResult}</p>
                    </div>
                  </div>
                )}

                {/* Step 2: 프롬프트 */}
                {guideStep === 2 && currentSituation && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900">💬 바로 쓰는 프롬프트</h3>
                    <p className="text-sm text-gray-500">아래 프롬프트를 복사해서 AI에 붙여넣으세요</p>

                    {currentSituation.prompts.map((prompt, index) => (
                      <div key={index} className="bg-gray-900 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-800">
                          <span className="text-white font-medium">{prompt.title}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(prompt.content, index)}
                            className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                              copiedIndex === index
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {copiedIndex === index ? '✓ 복사됨' : '복사'}
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
                )}

                {/* Step 3: 따라하기 */}
                {guideStep === 3 && currentSituation && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900">📝 단계별 따라하기</h3>
                    <p className="text-sm text-gray-500">아래 단계를 순서대로 따라해보세요</p>

                    <ProgressStepper
                      steps={currentSituation.steps}
                      situationSlug={currentSituation.slug}
                    />
                  </div>
                )}

                {/* 빈 결과 */}
                {!result.bestMatch && (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-2 block">🤔</span>
                    <p className="text-gray-500">조건에 맞는 AI를 찾지 못했어요</p>
                    <p className="text-sm text-gray-400">다른 옵션을 선택해보세요</p>
                  </div>
                )}
              </div>

              {/* 하단 네비게이션 */}
              <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="px-3 py-2 text-gray-400 hover:text-gray-600 transition-colors text-sm"
                    title="처음부터 다시 하기"
                  >
                    🔄
                  </button>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors text-sm flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {guideStep === 0 ? '다시 선택' : '이전'}
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  {guideSteps.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === guideStep ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {guideStep < guideSteps.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNextGuideStep}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center gap-1"
                  >
                    다음
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                  >
                    완료 ✓
                  </button>
                )}
              </div>
            </div>
          ) : (
            // 질문 화면
            <div className="min-h-[350px]">
              <h3 className="text-xl font-bold text-gray-900 text-center mb-6">
                {currentQuestion?.title}
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {currentOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleOptionSelect(option.value)}
                    className={`
                      p-4 rounded-xl border-2 text-left transition-all duration-200 group
                      ${currentAnswer === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl group-hover:scale-110 transition-transform">{option.icon}</span>
                      <div>
                        <span className={`font-medium text-sm block ${
                          currentAnswer === option.value ? 'text-blue-700' : 'text-gray-900'
                        }`}>
                          {option.label}
                        </span>
                        {option.description && (
                          <span className="text-xs text-gray-500 mt-0.5 block">
                            {option.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* 네비게이션 */}
              <div className="flex justify-between items-center mt-8">
                <button
                  type="button"
                  onClick={currentStep === 0 ? onClose : handleBack}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors text-sm flex items-center gap-1"
                >
                  {currentStep === 0 ? (
                    '취소'
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      이전
                    </>
                  )}
                </button>

                <div className="text-xs text-gray-400">
                  {currentStep + 1}번째 질문
                </div>

                {currentAnswer && (
                  <button
                    type="button"
                    onClick={() => {
                      if (isLastQuestion) {
                        completeAndShowResult(answers);
                      } else {
                        setCurrentStep(prev => prev + 1);
                      }
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center gap-1"
                  >
                    {isLastQuestion ? '결과 보기' : '다음'}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
