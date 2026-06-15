'use client';

import { useState } from 'react';
import { track } from '@/lib/analytics';
import { buildShareText } from '@/lib/share-text';
import type { NewsLang } from '@/types/news';

type ShareRowProps = {
  title: string;
  summary: string;
  url: string;
  lang: NewsLang;
};

const ARIA: Record<
  NewsLang,
  { x: string; threads: string; copy: string; copied: string; row: string }
> = {
  ko: {
    x: 'X에서 공유',
    threads: 'Threads에서 공유',
    copy: '링크 복사',
    copied: '복사됨!',
    row: '공유하기',
  },
  en: {
    x: 'Share on X',
    threads: 'Share on Threads',
    copy: 'Copy link',
    copied: 'Copied!',
    row: 'Share this article',
  },
};

const BTN_CLASS =
  'inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 text-slate-600 ' +
  'hover:bg-blue-50 hover:text-blue-700 transition-colors ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600';

export default function ShareRow({
  title,
  summary,
  url,
  lang,
}: ShareRowProps): JSX.Element {
  const [copied, setCopied] = useState(false);
  const labels = ARIA[lang];
  const shareText = buildShareText(title, summary, url);
  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} ${url}`)}`;
  const threadsHref = `https://www.threads.net/intent/post?text=${encodeURIComponent(shareText)}`;

  function handleExternalClick(platform: string): void {
    void track('share_click', { platform, url });
  }

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // clipboard API unavailable — silent fail, user still sees feedback
    }
    void track('share_click', { platform: 'copy', url });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="flex items-center gap-2 mt-6 pt-5 border-t border-slate-100"
      aria-label={labels.row}
    >
      {/* X / Twitter */}
      <a
        href={xHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={labels.x}
        className={BTN_CLASS}
        onClick={() => handleExternalClick('x')}
      >
        {/* Official X logo */}
        <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.836L2.25 2.25h6.979l4.261 5.641L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
        </svg>
      </a>

      {/* Threads */}
      <a
        href={threadsHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={labels.threads}
        className={BTN_CLASS}
        onClick={() => handleExternalClick('threads')}
      >
        {/* Threads "@"-style icon */}
        <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.9 6.5h-1.7c-.3-1-1.2-1.5-2.2-1.5-1.5 0-2.5 1-2.5 2.5v.5h-.9c-.3 0-.6.2-.6.5s.3.5.6.5h.9v4h1v-4h2.5v-1h-2.5V9.5c0-.8.7-1.5 1.5-1.5.7 0 1.2.4 1.4 1H14c.3 0 .6.2.6.5s-.3.5-.6.5h-.4c.1.3.1.7.1 1v.5h1.7c.3 0 .6.2.6.5s-.3.5-.6.5H13.7c-.1 1.2-.7 2-1.7 2-1.2 0-2-1-2-2.5V12h-1v1c0 1.9 1.3 3.5 3 3.5 1.4 0 2.5-.9 2.9-2.2.8-.1 1.4-.8 1.4-1.7v-.1c.1-.4.1-.8.1-1.2-.1-.8-.2-1.5-.5-2.1.1-.1.1-.3.1-.7 0-.3-.3-.5-.6-.5l-.5.7z" />
        </svg>
      </a>

      {/* Copy link */}
      <button
        type="button"
        aria-label={copied ? labels.copied : labels.copy}
        className={BTN_CLASS}
        onClick={() => void handleCopy()}
      >
        {copied ? (
          /* Checkmark (success state) */
          <svg
            aria-hidden="true"
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          /* Chain-link icon */
          <svg
            aria-hidden="true"
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
