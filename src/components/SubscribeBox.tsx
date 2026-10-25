'use client';

import { useState } from 'react';
import { track } from '@/lib/analytics';

type SubmitState = 'idle' | 'pending' | 'success' | 'error';

export default function SubscribeBox(): JSX.Element {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<SubmitState>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setState('pending');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (res.ok) {
        setState('success');
        void track('newsletter_subscribe');
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
  };

  return (
    <div className="max-w-lg mx-auto text-center">
      {/* Value-led badge */}
      <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700 mb-4">
        무료 뉴스레터
      </span>

      <h2 className="text-2xl font-bold text-slate-900">
        중요한 AI 소식을 한국어 요약 메일로
      </h2>
      <p className="mt-2 text-slate-600 text-sm">
        영어 기사를 찾아 읽지 않아도 돼요. 꼭 알아야 할 AI·LLM 소식만 골라 한국어로 요약해 드려요.
        첫 메일은 발송을 시작할 때 이 주소로 보내요.
      </p>

      {state === 'success' ? (
        <p className="mt-6 text-slate-700 font-medium" role="status">
          신청됐어요. 첫 요약 메일은 발송을 시작할 때 보내드려요.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-6 flex flex-col sm:flex-row gap-2"
          aria-label="뉴스레터 구독"
          noValidate
        >
          <label htmlFor="subscribe-email" className="sr-only">
            이메일 주소
          </label>
          <input
            id="subscribe-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="받을 이메일 주소"
            required
            disabled={state === 'pending'}
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={state === 'pending'}
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state === 'pending' ? '등록 중…' : '요약 메일 받기'}
          </button>

          {state === 'error' && (
            <p
              role="alert"
              aria-live="assertive"
              className="mt-2 text-sm text-red-600 w-full text-left"
            >
              신청이 안 됐어요. 한 번 더 눌러 주세요.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
