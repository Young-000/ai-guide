'use client';

import Link from 'next/link';
import trendsData from '@/data/trends.json';
import toolsData from '@/data/tools.json';
import type { Tool } from '@/types';

export default function TrendsPage() {
  const tools = toolsData.tools as Tool[];

  const getToolBySlug = (slug: string) => {
    return tools.find(t => t.slug === slug);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI 트렌드 & 뉴스
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          AI 세계에서 무슨 일이 일어나고 있는지 알아보세요.
          <br />
          초보자도 이해할 수 있게 정리했어요.
        </p>
        <p className="text-sm text-gray-400 mt-2">
          마지막 업데이트: {trendsData.lastUpdated}
        </p>
      </header>

      {/* 주요 통계 */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trendsData.quickStats.map((stat, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 text-center"
            >
              <p className="text-3xl font-bold text-blue-600 mb-1">{stat.value}</p>
              <p className="text-gray-600 text-sm">{stat.label}</p>
              {stat.trend === 'up' && (
                <span className="inline-flex items-center text-green-600 text-xs mt-2">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  상승세
                </span>
              )}
              {'source' in stat && (
                <p className="text-gray-400 text-xs mt-2">{(stat as { source: string }).source}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 핵심 트렌드 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          2025년 주목해야 할 AI 트렌드
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trendsData.trends.map((trend) => (
            <div
              key={trend.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                  {trend.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      {trend.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{trend.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{trend.description}</p>

                  {/* 키워드 */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {trend.keywords.map((keyword, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded"
                      >
                        #{keyword}
                      </span>
                    ))}
                  </div>

                  {/* 관련 도구 */}
                  {trend.relatedTools.length > 0 && (
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-400">관련 도구:</span>
                      {trend.relatedTools.map((slug) => {
                        const tool = getToolBySlug(slug);
                        if (!tool) return null;
                        return (
                          <Link
                            key={slug}
                            href={`/tools/${slug}`}
                            className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs hover:bg-gray-200 transition-colors"
                          >
                            <span>{tool.icon}</span>
                            <span>{tool.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 최신 뉴스 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          최신 AI 뉴스
        </h2>
        <div className="space-y-4">
          {trendsData.news.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-xl">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400">{item.date}</span>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs text-gray-400">{item.source}</span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.summary}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 용어 안내 */}
      <section className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          용어가 어렵다면?
        </h2>
        <p className="text-gray-600 mb-6">
          에이전트? RAG? 멀티모달? AI 용어를 쉽게 설명해드려요.
        </p>
        <Link
          href="/glossary"
          className="inline-block px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          용어 사전 보기
        </Link>
      </section>
    </div>
  );
}
