import { getAllNews, getAllTags } from '@/lib/news';
import { BASE_URL } from '@/lib/site';
import LeadStory from '@/components/home/LeadStory';
import NewsGrid from '@/components/home/NewsGrid';
import CategoryStrip from '@/components/home/CategoryStrip';
import SubscribeBox from '@/components/SubscribeBox';

const JSON_LD_DATA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AIWire',
  url: BASE_URL,
  description: 'AI·LLM 최신 소식을 매일 한국어·영어로 정리하는 뉴스 미디어',
  inLanguage: 'ko',
};

export default function Home(): JSX.Element {
  const allNews = getAllNews('ko');
  const lead = allNews[0];
  const gridItems = allNews.slice(1, 9);
  const tags = getAllTags('ko');

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_DATA) }}
      />

      {/* Page heading — primary h1 for SEO/a11y */}
      <h1 className="sr-only">AIWire — AI·LLM 뉴스와 활용 가이드</h1>

      {/* Lead story — most recent article, large */}
      {lead && (
        <section
          aria-labelledby="lead-story-label"
          className="bg-white border-b border-slate-200 py-10 md:py-14"
        >
          <div className="max-w-5xl mx-auto px-4">
            <p id="lead-story-label" className="sr-only">
              주요 기사
            </p>
            <LeadStory item={lead} />
          </div>
        </section>
      )}

      {/* Category strip — tags linking to /news/topic/[tag] */}
      <CategoryStrip tags={tags} />

      {/* News grid — next 8 articles */}
      {gridItems.length > 0 && (
        <section className="py-10">
          <div className="max-w-5xl mx-auto px-4">
            <NewsGrid items={gridItems} />
          </div>
        </section>
      )}

      {/* Subscribe section */}
      <section
        aria-labelledby="subscribe-section-heading"
        className="py-12 bg-slate-50 border-t border-slate-200"
      >
        <div className="max-w-5xl mx-auto px-4">
          <p id="subscribe-section-heading" className="sr-only">
            뉴스레터 구독
          </p>
          <SubscribeBox />
        </div>
      </section>
    </>
  );
}
