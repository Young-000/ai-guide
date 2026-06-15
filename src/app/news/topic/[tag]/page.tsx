import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllTags, getNewsByTag } from '@/lib/news';
import TagChips from '@/components/news/TagChips';
import NewsCard from '@/components/news/NewsCard';
import CategoryViewTracker from '@/components/news/CategoryViewTracker';
import { BASE_URL } from '@/lib/site';

type Params = { tag: string };

export function generateStaticParams(): Params[] {
  return getAllTags('ko').map((tag) => ({ tag: encodeURIComponent(tag) }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const tag = decodeURIComponent(params.tag);
  return {
    title: `${tag} 뉴스 | AIWire`,
    description: `AI·LLM 관련 '${tag}' 태그 기사 목록입니다.`,
    alternates: { canonical: `${BASE_URL}/news/topic/${encodeURIComponent(tag)}` },
  };
}

export default function TopicPage({ params }: { params: Params }): JSX.Element {
  const tag = decodeURIComponent(params.tag);
  const allTags = getAllTags('ko');

  if (!allTags.includes(tag)) notFound();

  const items = getNewsByTag('ko', tag);

  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      <CategoryViewTracker tag={tag} />
      {/* Back link */}
      <Link
        href="/news"
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
      >
        {/* Arrow left */}
        <svg
          className="w-4 h-4"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        전체 뉴스
      </Link>

      <h1 className="mt-5 text-3xl font-bold text-slate-900">
        카테고리: <span className="text-blue-600">{tag}</span>
      </h1>
      <p className="mt-1 text-sm text-slate-500">{items.length}건의 기사</p>

      {/* All category tags */}
      <div className="mt-5">
        <TagChips tags={allTags} activeTag={tag} showAll />
      </div>

      {items.length === 0 ? (
        <p className="mt-10 text-slate-500">해당 태그의 기사가 없습니다.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <NewsCard key={item.slug} lang="ko" item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
