'use client';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps): JSX.Element {
  return (
    <div className="px-6 pt-4 pb-2">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
        <span className="text-sm text-gray-500 font-medium tabular-nums">
          {currentStep + 1}/{totalSteps}
        </span>
      </div>
      <div className="flex justify-center gap-2 mt-2">
        {Array.from({ length: totalSteps }).map((_, idx) => (
          <div
            key={idx}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
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
  );
}
