'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

type FeedbackRating = 'good' | 'neutral' | 'bad' | null;

interface FeedbackData {
  rating: FeedbackRating;
  comment: string;
  timestamp: number;
  url: string;
}

const RATING_OPTIONS = [
  { value: 'good' as const, emoji: '😊', label: '좋아요' },
  { value: 'neutral' as const, emoji: '😐', label: '보통' },
  { value: 'bad' as const, emoji: '😢', label: '아쉬워요' },
];

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<FeedbackRating>(null);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      setRating(null);
      setComment('');
      setIsSubmitted(false);
      triggerButtonRef.current?.focus();
    }, 200);
  }, []);

  const handleSubmit = () => {
    if (!rating) return;

    const feedbackData: FeedbackData = {
      rating,
      comment: comment.trim(),
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
    };

    const storageKey = `feedback-${feedbackData.timestamp}`;
    localStorage.setItem(storageKey, JSON.stringify(feedbackData));

    setIsSubmitted(true);

    setTimeout(() => {
      handleClose();
    }, 1500);
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  // Focus trap and keyboard handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    firstFocusableRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClose]);

  return (
    <>
      {/* Trigger Button */}
      <button
        ref={triggerButtonRef}
        onClick={handleOpen}
        aria-label="피드백 보내기"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6 sm:h-7 sm:w-7"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
          />
        </svg>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-end justify-end p-4 sm:items-center sm:justify-center transition-opacity duration-200 ${
            isClosing ? 'opacity-0' : 'opacity-100'
          }`}
          role="presentation"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            aria-hidden="true"
          />

          {/* Modal Content */}
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
            className={`relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl transition-all duration-200 ${
              isClosing
                ? 'translate-y-4 opacity-0 sm:translate-y-0 sm:scale-95'
                : 'translate-y-0 opacity-100 sm:scale-100'
            }`}
          >
            {/* Close Button */}
            <button
              ref={firstFocusableRef}
              onClick={handleClose}
              aria-label="닫기"
              className="absolute right-4 top-4 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {isSubmitted ? (
              /* Thank You Message */
              <div className="flex flex-col items-center py-8 text-center">
                <div className="mb-4 text-5xl" aria-hidden="true">
                  🙏
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  감사합니다!
                </h2>
                <p className="mt-2 text-gray-600">
                  소중한 의견 감사드립니다.
                </p>
              </div>
            ) : (
              /* Feedback Form */
              <>
                <h2
                  id="feedback-title"
                  className="mb-6 text-center text-lg font-semibold text-gray-900"
                >
                  이 서비스가 도움이 되셨나요?
                </h2>

                {/* Rating Options */}
                <div
                  className="mb-6 flex justify-center gap-4"
                  role="radiogroup"
                  aria-label="서비스 평가"
                >
                  {RATING_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setRating(option.value)}
                      aria-pressed={rating === option.value}
                      aria-label={option.label}
                      className={`flex flex-col items-center gap-2 rounded-xl p-3 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        rating === option.value
                          ? 'bg-blue-50 ring-2 ring-blue-500'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <span
                        className={`text-4xl transition-transform ${
                          rating === option.value ? 'scale-110' : ''
                        }`}
                        aria-hidden="true"
                      >
                        {option.emoji}
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          rating === option.value
                            ? 'text-blue-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Comment Input */}
                <div className="mb-6">
                  <label
                    htmlFor="feedback-comment"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    의견이 있다면 알려주세요{' '}
                    <span className="text-gray-400">(선택)</span>
                  </label>
                  <textarea
                    id="feedback-comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="어떤 점이 좋았거나 아쉬웠나요?"
                    rows={3}
                    className="w-full resize-none rounded-lg border border-gray-300 p-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={!rating}
                  aria-disabled={!rating}
                  className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                >
                  제출하기
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
