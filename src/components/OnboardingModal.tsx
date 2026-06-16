'use client';

import { useState } from 'react';

interface OnboardingModalProps {
  onComplete: () => void;
}

const steps = [
  {
    title: 'AIWire에 오신 것을 환영해요!',
    description: 'AI를 처음 사용하시는 분도 쉽게 따라할 수 있도록 상황별 가이드를 준비했어요.',
    icon: '👋',
  },
  {
    title: '상황을 선택하세요',
    description: '"PDF 요약하고 싶어", "코드 에러 해결해줘" 같은 상황을 검색하거나 카테고리에서 찾아보세요.',
    icon: '🔍',
  },
  {
    title: '단계별로 따라하세요',
    description: '각 상황마다 추천 도구와 단계별 방법, 바로 복사할 수 있는 프롬프트를 제공해요.',
    icon: '📝',
  },
  {
    title: '레벨업하며 성장하세요',
    description: '가이드를 따라하며 체크하면 경험치를 얻고 레벨이 올라요. AI 마스터를 향해 달려가요!',
    icon: '🚀',
  },
];

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* 배경 */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* 모달 */}
      <div className="relative bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl animate-fadeIn">
        {/* 스킵 버튼 */}
        {!isLastStep && (
          <button
            type="button"
            onClick={handleSkip}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-sm"
          >
            건너뛰기
          </button>
        )}

        {/* 아이콘 */}
        <div className="text-6xl text-center mb-6">{step.icon}</div>

        {/* 내용 */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
          {step.title}
        </h2>
        <p className="text-gray-600 text-center mb-8 leading-relaxed">
          {step.description}
        </p>

        {/* 진행 표시 */}
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* 버튼 */}
        <button
          type="button"
          onClick={handleNext}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
        >
          {isLastStep ? '시작하기' : '다음'}
        </button>
      </div>
    </div>
  );
}
