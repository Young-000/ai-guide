import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllTags, getNewsByTag, isThinTag } from '@/lib/news';
import TagChips from '@/components/news/TagChips';
import NewsCard from '@/components/news/NewsCard';
import CategoryViewTracker from '@/components/news/CategoryViewTracker';
import { BASE_URL } from '@/lib/site';

type Params = { tag: string };

export function generateStaticParams(): Params[] {
  // Next.js encodes dynamic-segment params itself when building the
  // prerendered path key. Returning an already-encoded tag here causes
  // double-encoding (e.g. 'AI Agents' -> 'AI%2520Agents'), which never
  // matches an incoming request for '/news/topic/AI%20Agents' -> 404.
  return getAllTags('ko').map((tag) => ({ tag }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const tag = decodeURIComponent(params.tag);
  // Tags with too few articles are thin content — keep them reachable via
  // internal links, but ask search engines not to index the page itself.
  const thin = isThinTag('ko', tag);
  return {
    title: `${tag} 뉴스 | AIWire`,
    description: `AI·LLM 관련 '${tag}' 태그 기사 목록입니다.`,
    alternates: { canonical: `${BASE_URL}/news/topic/${encodeURIComponent(tag)}` },
    ...(thin ? { robots: { index: false, follow: true } } : {}),
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

      {/* Cross-links: 다른 주제 */}
      {(() => {
        const siblingTags = allTags.filter((t) => t !== tag).slice(0, 6);
        if (siblingTags.length === 0) return null;
        return (
          <div className="mt-12 pt-8 border-t border-slate-200">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
              다른 주제
            </h2>
            <ul className="flex flex-wrap gap-2">
              {siblingTags.map((sibling) => (
                <li key={sibling}>
                  <Link
                    href={`/news/topic/${encodeURIComponent(sibling)}`}
                    className="inline-block text-sm px-3 py-1.5 rounded-full border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 transition-colors"
                  >
                    {sibling}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/news/topics"
              className="inline-flex items-center gap-1 mt-4 text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              전체 주제 보기
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        );
      })()}
    </section>
  );
}
