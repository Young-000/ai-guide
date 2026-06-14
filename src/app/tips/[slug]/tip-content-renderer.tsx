'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { TipContent } from '@/types';

interface TipContentRendererProps {
  readonly content: readonly TipContent[];
}

export default function TipContentRenderer({ content }: TipContentRendererProps): React.ReactElement {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const copyToClipboard = useCallback(async (text: string, index: number) => {
    if (typeof window === 'undefined' || !navigator?.clipboard) {
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
    }
  }, []);

  return (
    <div className="space-y-6">
      {content.map((block, index) => {
        switch (block.type) {
          case 'paragraph':
            return (
              <p key={index} className="text-gray-700 leading-relaxed">
                {block.text}
              </p>
            );

          case 'heading':
            return (
              <h2 key={index} className="text-xl font-bold text-gray-900 mt-8 mb-3">
                {block.text}
              </h2>
            );

          case 'list':
            return (
              <ul key={index} className="space-y-2 pl-1">
                {block.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700">
                    <span className="text-blue-500 mt-1.5 flex-shrink-0">
                      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
                        <circle cx="6" cy="6" r="3" />
                      </svg>
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            );

          case 'tip-box':
            return (
              <div key={index} className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4">
                <div className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5 flex-shrink-0">💡</span>
                  <p className="text-gray-700 text-sm leading-relaxed">{block.text}</p>
                </div>
              </div>
            );

          case 'prompt-example':
            return (
              <div key={index} className="bg-gray-900 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-800">
                  <h3 className="text-white font-medium text-sm">{block.title}</h3>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(block.content, index)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      copiedIndex === index
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {copiedIndex === index ? '복사됨!' : '복사'}
                  </button>
                </div>
                <pre className="p-4 text-gray-100 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                  {block.content}
                </pre>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
