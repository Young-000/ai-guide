import type { Metadata } from 'next';
import { getAllNews } from '@/lib/news';
import { BASE_URL } from '@/lib/site';

// Bare, iframe-embeddable widget: the latest AIWire articles with no site
// chrome. Intentionally does NOT set X-Frame-Options / frame-ancestors so it
// can be embedded on third-party sites. Each link points back to aiwire.news
// with utm_source=embed for attribution.
export const metadata: Metadata = {
  title: 'AIWire — 최신 AI 뉴스',
  robots: { index: false, follow: true },
};

export const revalidate = 600;

const EMBED_COUNT = 5;

export default function EmbedAiNewsPage(): JSX.Element {
  const items = getAllNews('ko').slice(0, EMBED_COUNT);

  return (
    <div className="bg-white text-slate-900 p-4 font-sans">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
        <a
          href={`${BASE_URL}/news?utm_source=embed`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors"
        >
          AIWire · AI 뉴스
        </a>
        <span className="text-xs text-slate-400">최신 소식</span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500 py-4">표시할 뉴스가 없습니다.</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item) => (
            <li key={item.slug}>
              <a
                href={`${BASE_URL}/news/${item.slug}?utm_source=embed`}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <span className="block text-sm font-medium text-slate-800 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                  {item.title}
                </span>
                <time
                  dateTime={item.date}
                  className="mt-0.5 block text-xs text-slate-400"
                >
                  {item.date}
                </time>
              </a>
            </li>
          ))}
        </ul>
      )}

      <a
        href={`${BASE_URL}?utm_source=embed`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-block text-xs text-blue-600 hover:text-blue-700 transition-colors"
      >
        더 많은 AI 소식 보기 →
      </a>
    </div>
  );
}
