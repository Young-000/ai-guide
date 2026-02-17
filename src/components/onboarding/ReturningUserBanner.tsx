'use client';

interface ReturningUserBannerProps {
  onViewPrevious: () => void;
  onStartFresh: () => void;
}

export default function ReturningUserBanner({
  onViewPrevious,
  onStartFresh,
}: ReturningUserBannerProps): JSX.Element {
  return (
    <div className="mx-4 sm:mx-6 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">📋</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-blue-900 mb-1">
            이전에 추천받은 결과가 있어요
          </p>
          <p className="text-xs text-blue-700 mb-3">
            이전 설문 결과를 다시 볼 수 있어요
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onViewPrevious}
              className="px-4 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              이전 결과 보기
            </button>
            <button
              type="button"
              onClick={onStartFresh}
              className="px-4 py-2.5 bg-white text-blue-700 text-sm font-medium rounded-lg border border-blue-300 hover:bg-blue-100 transition-colors"
            >
              새로 시작하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
