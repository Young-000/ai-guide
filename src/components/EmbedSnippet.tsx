'use client';

import { useState } from 'react';

type EmbedSnippetProps = {
  code: string;
};

// Read-only code box with a copy-to-clipboard button. Used to let other sites
// grab the AIWire news iframe snippet.
export default function EmbedSnippet({ code }: EmbedSnippetProps): JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-4 pr-24 text-xs text-slate-700">
        <code>{code}</code>
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-3 top-3 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        aria-live="polite"
      >
        {copied ? '복사됨' : '복사'}
      </button>
    </div>
  );
}
