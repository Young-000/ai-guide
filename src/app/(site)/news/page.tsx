import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllNews, getAllTags } from '@/lib/news';
import NewsListView from '@/components/news/NewsListView';
import TagChips from '@/components/news/TagChips';
import TrendingKeywords from '@/components/TrendingKeywords';
import SubscribeBox from '@/components/SubscribeBox';
import { BASE_URL } from '@/lib/site';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'AI · LLM 뉴스 | AIWire',
  description: '매일 업데이트되는 AI·LLM 최신 소식을 한국어로 핵심만 정리했습니다.',
  alternates: {
    canonical: `${BASE_URL}/news`,
    languages: {
      'ko-KR': `${BASE_URL}/news`,
      'en-US': `${BASE_URL}/en/news`,
      'x-default': `${BASE_URL}/news`,
    },
  },
  openGraph: { locale: 'ko_KR' },
};

export default function NewsPage(): JSX.Element {
  const items = getAllNews('ko');
  const tags = getAllTags('ko');
  return (
    <>
      <NewsListView
        lang="ko"
        items={items}
        topSlot={
          <div className="space-y-4">
            <div className="space-y-3">
              <TagChips tags={tags} />
              <Link
                href="/news/topics"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
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
            {/* Trendjacking widget — self-hides on empty/error */}
            <TrendingKeywords />
          </div>
        }
      />

      {/* Subscribe — added to this high-traffic page */}
      <section
        aria-labelledby="news-subscribe-heading"
        className="mx-auto max-w-5xl px-4 pb-12"
      >
        <div className="border-t border-slate-200 pt-10">
          <p id="news-subscribe-heading" className="sr-only">
            뉴스레터 구독
          </p>
          <SubscribeBox />
        </div>
      </section>
    </>
  );
}
