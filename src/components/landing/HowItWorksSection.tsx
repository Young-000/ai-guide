interface HowItWorksStep {
  step: number;
  icon: string;
  title: string;
  description: string;
  duration: string;
}

const STEPS: HowItWorksStep[] = [
  {
    step: 1,
    icon: '📋',
    title: '3가지 질문에 답하기',
    description:
      '"무슨 일을 하세요?", "뭘 하고 싶으세요?", "AI 써본 적 있으세요?" — 30초면 충분해요',
    duration: '30초',
  },
  {
    step: 2,
    icon: '🎯',
    title: '맞춤 AI 도구 추천 받기',
    description:
      '당신의 상황에 딱 맞는 AI 도구와 그 이유를 알려드려요',
    duration: '즉시',
  },
  {
    step: 3,
    icon: '🚀',
    title: '바로 따라하기',
    description:
      '프롬프트 복사해서 붙여넣기만 하면 끝. 5분 안에 첫 결과물을 만들어보세요',
    duration: '5분',
  },
];

export default function HowItWorksSection(): JSX.Element {
  return (
    <section
      aria-labelledby="how-it-works-title"
      className="bg-gray-50 py-16 md:py-20 px-4"
    >
      <div className="max-w-6xl mx-auto text-center">
        <h2
          id="how-it-works-title"
          className="text-2xl md:text-3xl font-bold text-gray-900 mb-3"
        >
          3단계만 따라오세요
        </h2>
        <p className="text-base md:text-lg text-gray-600 mb-12">
          5분이면 당신만의 AI 활용법을 알 수 있어요
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {STEPS.map((step, index) => (
            <div key={step.step} className="flex flex-col items-center relative">
              {/* Connector arrow (desktop only, between items) */}
              {index < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-8 -right-3 text-gray-300">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              )}

              {/* Step number badge */}
              <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mb-3">
                {step.step}
              </div>

              {/* Icon */}
              <span className="text-4xl mb-3" aria-hidden="true">
                {step.icon}
              </span>

              {/* Title */}
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
                {step.description}
              </p>

              {/* Duration badge */}
              <span className="mt-3 inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                {step.duration}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
