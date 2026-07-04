'use client';

import { useState } from 'react';
import Link from 'next/link';
import glossaryData from '@/data/glossary.json';
import toolsData from '@/data/tools.json';
import type { GlossaryTerm, Tool } from '@/types';

export default function GlossaryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const terms = glossaryData.terms as GlossaryTerm[];
  const tools = toolsData.tools as Tool[];

  const filteredTerms = terms.filter((term) =>
    searchQuery === '' ||
    term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
    term.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getToolBySlug = (slug: string) => tools.find((t) => t.slug === slug);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI 용어 사전
        </h1>
        <p className="text-gray-600 text-lg">
          AI 세상에서 자주 나오는 용어들을 쉽게 설명해드려요.
        </p>
      </header>

      {/* 검색 */}
      <div className="relative max-w-xl mx-auto mb-12">
        <input
          type="text"
          placeholder="용어 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-5 py-4 pl-12 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* 용어 목록 */}
      <div className="space-y-6">
        {filteredTerms.length > 0 ? (
          filteredTerms.map((term) => (
            <div
              key={term.slug}
              className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-2">{term.term}</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                {term.definition}
              </p>

              {term.example && (
                <div className="bg-blue-50 rounded-xl p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">예시:</span> {term.example}
                  </p>
                </div>
              )}

              {term.relatedTools && term.relatedTools.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-500">관련 도구:</span>
                  {term.relatedTools.map((slug) => {
                    const tool = getToolBySlug(slug);
                    if (!tool) return null;
                    return (
                      <Link
                        key={slug}
                        href={`/tools/${slug}`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        <span>{tool.icon}</span>
                        <span>{tool.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>

      {/* CTA */}
      <section className="mt-16 bg-gradient-to-r from-purple-50 to-blue-50 rounded-3xl p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          이제 AI 도구를 살펴볼까요?
        </h2>
        <p className="text-gray-600 mb-6">
          용어를 알았다면 실제 도구를 확인해보세요.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
        >
          도구 목록 보기 →
        </Link>
      </section>
    </div>
  );
}
