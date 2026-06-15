'use client';

import { useState } from 'react';

export default function SubscribeBox(): JSX.Element {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-lg mx-auto text-center">
      {/* Coming soon badge */}
      <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-700 mb-4">
        곧 오픈 예정 (Coming soon)
      </span>

      <h2 className="text-2xl font-bold text-slate-900">
        매일 AI 뉴스를 메일로 받아보세요
      </h2>
      <p className="mt-2 text-slate-600 text-sm">
        매일 아침 AI·LLM 핵심 소식을 받아보실 수 있어요.
      </p>

      {submitted ? (
        <p className="mt-6 text-slate-700 font-medium" role="status">
          곧 오픈 예정입니다. 오픈하면 알려드릴게요!
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
            placeholder="이메일 주소를 입력하세요"
            required
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            구독 신청
          </button>
        </form>
      )}
    </div>
  );
}
