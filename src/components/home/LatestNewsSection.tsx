import Link from 'next/link';
import { getAllNews, getAllTags } from '@/lib/news';
import TagChips from '@/components/news/TagChips';

export default function LatestNewsSection(): JSX.Element {
  const items = getAllNews('ko').slice(0, 6);
  const tags = getAllTags('ko');

  return (
    <section
      aria-labelledby="latest-news-heading"
      className="bg-white border-b border-gray-100 py-8 px-4"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h2
            id="latest-news-heading"
            className="text-lg font-bold text-gray-900"
          >
            최신 AI 뉴스
          </h2>
          <Link
            href="/news"
            className="text-sm text-blue-500 hover:text-blue-600 font-medium"
          >
            전체 보기 →
          </Link>
        </div>

        {tags.length > 0 && (
          <div className="mb-4">
            <TagChips tags={tags} />
          </div>
        )}

        {items.length === 0 ? (
          <p className="text-sm text-gray-400">아직 게시된 뉴스가 없습니다.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map((item) => (
              <li key={item.slug} className="py-3">
                <Link
                  href={`/news/${item.slug}`}
                  className="group flex items-start gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
                      {item.summary}
                    </p>
                  </div>
                  <time
                    dateTime={item.date}
                    className="flex-shrink-0 text-xs text-gray-400 mt-0.5"
                  >
                    {item.date}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
