'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';

interface ResultShareBarProps {
  shareUrl: string;
}

export default function ResultShareBar({ shareUrl }: ResultShareBarProps): JSX.Element {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return (): void => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator?.clipboard) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard access may fail
    }
  }, [shareUrl]);

  return (
    <>
      {/* Dissatisfaction section */}
      <div className="text-center border-t border-gray-200 pt-8 mt-8">
        <p className="text-gray-500 mb-4 text-sm">이 추천이 마음에 안 드시나요?</p>
        <div className="flex justify-center gap-4">
          <Link
            href="/onboarding"
            className="text-blue-500 hover:text-blue-600 text-sm font-medium hover:underline transition-colors"
          >
            다시 설문하기
          </Link>
          <Link
            href="/tools"
            className="text-blue-500 hover:text-blue-600 text-sm font-medium hover:underline transition-colors"
          >
            전체 도구 보기
          </Link>
        </div>
      </div>

      {/* Share section */}
      <div className="text-center mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-sm text-gray-600">이 결과 공유하기</span>
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              copied
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                복사됨!
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                링크 복사
              </>
            )}
          </button>
        </div>
      </div>

      {/* Affiliate disclosure */}
      <div className="text-xs text-gray-400 text-center mt-6 px-4">
        <p>
          이 페이지의 일부 링크는 제휴 링크입니다.
          링크를 통해 가입하시면 AI Guide 운영에 도움이 됩니다.
          추천은 제휴 여부와 무관하게 사용자 응답에 기반합니다.
        </p>
      </div>
    </>
  );
}
