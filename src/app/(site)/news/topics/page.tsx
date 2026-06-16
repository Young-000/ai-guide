import type { Metadata } from 'next';
import Link from 'next/link';
import { getTagsWithCount } from '@/lib/news';
import { BASE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: '주제별 AI 뉴스 | AIWire',
  description: 'AI·LLM 뉴스를 주제별로 탐색하세요. 모든 카테고리와 태그 목록입니다.',
  alternates: { canonical: `${BASE_URL}/news/topics` },
};

export default function TopicsPage(): JSX.Element {
  const tags = getTagsWithCount('ko');

  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      {/* Back link */}
      <Link
        href="/news"
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
      >
        <svg
          className="w-4 h-4"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        전체 뉴스
      </Link>

      <h1 className="mt-5 text-3xl font-bold text-slate-900">주제별 뉴스</h1>
      <p className="mt-2 text-slate-600">{tags.length}개 주제의 AI·LLM 뉴스를 탐색하세요.</p>

      {tags.length === 0 ? (
        <p className="mt-10 text-slate-500">등록된 주제가 없습니다.</p>
      ) : (
        <ul
          className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="전체 뉴스 주제"
        >
          {tags.map(({ tag, count }) => (
            <li key={tag}>
              <Link
                href={`/news/topic/${encodeURIComponent(tag)}`}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-white hover:border-blue-300 hover:shadow-sm transition-all duration-150 group"
              >
                <span className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                  {tag}
                </span>
                <span className="text-sm text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {count}건
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
