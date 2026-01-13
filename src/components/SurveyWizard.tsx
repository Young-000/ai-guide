'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { SurveyQuestion, SurveyAnswer, SurveyResult, Situation, SurveyOption } from '@/types';
import surveyData from '@/data/survey.json';
import { getSurveyResult, getDynamicOptions } from '@/lib/surveyLogic';
import GuidePanel from './GuidePanel';

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

export default function SurveyWizard({
  onComplete,
  onClose
}: SurveyWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswer[]>([]);
  const [result, setResult] = useState<SurveyResult | null>(null);
  const [showGuide, setShowGuide] = useState(false);

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
  const showResult = currentStep >= totalSteps && !showGuide;

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
    if (showGuide) {
      setShowGuide(false);
    } else if (showResult) {
      setCurrentStep(totalSteps - 1);
      setResult(null);
    } else if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep, showResult, showGuide, totalSteps]);

  // 다시 시작
  const handleRestart = useCallback(() => {
    setCurrentStep(0);
    setAnswers([]);
    setResult(null);
    setShowGuide(false);
  }, []);

  // 바로 가이드로 이동
  const handleGoToGuide = useCallback(() => {
    if (result?.bestMatch) {
      setShowGuide(true);
    }
  }, [result]);

  // 상황 선택 후 가이드로 이동
  const handleSituationClick = useCallback((situation: Situation) => {
    // result 업데이트 후 가이드 표시
    if (result) {
      setResult({
        ...result,
        bestMatch: situation,
        matchReason: `"${situation.title}"를 선택하셨어요!`
      });
    }
    setShowGuide(true);
  }, [result]);

  // 현재 선택된 값
  const currentAnswer = answers.find(a => a.questionId === currentQuestion?.id)?.value;

  // 가이드 화면 표시
  if (showGuide && result?.bestMatch) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative w-full max-w-4xl h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
          {/* 헤더 */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-500 to-indigo-500">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <p className="text-white/80 text-sm">{result.matchReason}</p>
                <h2 className="font-bold text-white text-lg">{result.bestMatch.title}</h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 가이드 패널 */}
          <div className="flex-1 overflow-hidden">
            <GuidePanel
              situation={result.bestMatch}
              onClose={() => setShowGuide(false)}
              embedded={true}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
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
        <div className="p-6">
          {showResult && result ? (
            // 결과 화면
            <div className="space-y-6">
              {/* 매칭 결과 헤더 */}
              <div className="text-center mb-6">
                <span className="text-5xl mb-3 block">🎯</span>
                <h3 className="text-xl font-bold text-gray-900 mb-2">분석 완료!</h3>
                <p className="text-gray-600">{result.matchReason}</p>
              </div>

              {/* Best Match - 바로 시작 버튼 */}
              {result.bestMatch && (
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-5 text-white">
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">{result.bestMatch.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">BEST MATCH</span>
                        <span className="text-xs opacity-80">{result.bestMatch.timeToComplete}</span>
                      </div>
                      <h4 className="text-lg font-bold mb-1">{result.bestMatch.title}</h4>
                      <p className="text-sm text-white/80 mb-3">{result.bestMatch.subtitle}</p>
                      <button
                        type="button"
                        onClick={handleGoToGuide}
                        className="w-full py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <span>바로 시작하기</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 다른 추천 상황 */}
              {result.recommendedSituations.length > 1 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-500 mb-3">다른 추천</h4>
                  <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                    {result.recommendedSituations.slice(1, 5).map((situation) => (
                      <button
                        key={situation.slug}
                        type="button"
                        onClick={() => handleSituationClick(situation)}
                        className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{situation.icon}</span>
                          <span className="text-xs text-gray-500">{situation.timeToComplete}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{situation.title}</p>
                      </button>
                    ))}
                  </div>
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

              {/* 액션 버튼 */}
              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
                >
                  다시 하기
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors text-sm"
                >
                  닫기
                </button>
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
