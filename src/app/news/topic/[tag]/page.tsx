import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllTags, getNewsByTag } from '@/lib/news';
import TagChips from '@/components/news/TagChips';
import NewsCard from '@/components/news/NewsCard';
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
    <section className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/news" className="text-sm text-blue-500 hover:text-blue-600">
        ← 전체 뉴스
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-gray-900">
        태그:{' '}
        <span className="text-blue-600">{tag}</span>
      </h1>
      <p className="mt-1 text-sm text-gray-500">{items.length}건의 기사</p>

      <div className="mt-4">
        <TagChips tags={allTags} activeTag={tag} showAll />
      </div>

      {items.length === 0 ? (
        <p className="mt-8 text-gray-500">해당 태그의 기사가 없습니다.</p>
      ) : (
        <div className="mt-6 grid gap-4">
          {items.map((item) => (
            <NewsCard key={item.slug} lang="ko" item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
