'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Tool } from '@/types';
import toolsData from '@/data/tools.json';

// 컴포넌트 외부에서 한 번만 파싱 (useMemo 의존성 최적화)
const tools = toolsData.tools as Tool[];

const categories = [
  { key: 'chatbot', label: '챗봇' },
  { key: 'coding', label: '코딩' },
  { key: 'image', label: '이미지' },
  { key: 'productivity', label: '생산성' },
  { key: 'data', label: '데이터' },
  { key: 'writing', label: '글쓰기' },
];

export default function ToolsPage() {
  const [filter, setFilter] = useState<string | null>(null);

  const filteredTools = useMemo(() => {
    if (!filter) return tools;
    return tools.filter((t) => t.category === filter);
  }, [filter]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/learn" className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block">
        ← 학습센터로
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">모든 AI 도구</h1>

      {/* 카테고리 필터 */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setFilter(null)}
          className={`px-3 py-1.5 rounded-full text-sm ${
            filter === null ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          전체
        </button>
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setFilter(cat.key)}
            className={`px-3 py-1.5 rounded-full text-sm ${
              filter === cat.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 도구 목록 */}
      <div className="space-y-2">
        {filteredTools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-300 transition-colors"
          >
            <span className="text-2xl">{tool.icon}</span>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{tool.name}</p>
              <p className="text-sm text-gray-500">{tool.tagline}</p>
            </div>
            {tool.pricing.free && (
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">무료</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
