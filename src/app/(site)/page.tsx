import { getAllNews, getAllTags } from '@/lib/news';
import { BASE_URL } from '@/lib/site';
import HomeHero from '@/components/home/HomeHero';
import HomeGuideStrip from '@/components/home/HomeGuideStrip';
import LeadStory from '@/components/home/LeadStory';
import NewsGrid from '@/components/home/NewsGrid';
import CategoryStrip from '@/components/home/CategoryStrip';
import TrendingKeywords from '@/components/TrendingKeywords';
import SubscribeBox from '@/components/SubscribeBox';
import AdFitUnit from '@/components/AdFitUnit';

// Home revalidates so the trending-keywords widget stays reasonably fresh
// without rebuilding on every request.
export const revalidate = 300;

const JSON_LD_DATA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AIWire',
  url: BASE_URL,
  description: 'AI·LLM 최신 소식과 상황별 AI 활용 가이드를 제공하는 미디어',
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

      {/* Hybrid hero — one-line value prop (news + guides) */}
      <HomeHero />

      {/* Popular AI usage guides strip */}
      <HomeGuideStrip count={6} />

      {/* Lead story — most recent article, large */}
      {lead && (
        <section
          aria-labelledby="lead-story-label"
          className="border-b border-slate-200 bg-white py-10 md:py-14"
        >
          <div className="mx-auto max-w-6xl px-4">
            <p id="lead-story-label" className="sr-only">
              주요 기사
            </p>
            <LeadStory item={lead} />
          </div>
        </section>
      )}

      {/* Category strip — tags linking to /news/topic/[tag] */}
      <CategoryStrip tags={tags} />

      {/* News grid + trending keywords */}
      {gridItems.length > 0 && (
        <section className="py-10">
          <div className="mx-auto max-w-6xl px-4">
            <NewsGrid items={gridItems} />
            {/* Trendjacking widget — self-hides on empty/error */}
            <TrendingKeywords className="mt-10" />
          </div>
        </section>
      )}

      {/* In-content ad (homepage — AdFit media review checks the root URL) */}
      <div className="mx-auto max-w-6xl px-4 pb-4">
        <AdFitUnit slot="rect" className="flex justify-center" />
      </div>

      {/* Subscribe section */}
      <section
        aria-labelledby="subscribe-section-heading"
        className="border-t border-slate-200 bg-slate-50 py-12"
      >
        <div className="mx-auto max-w-6xl px-4">
          <p id="subscribe-section-heading" className="sr-only">
            뉴스레터 구독
          </p>
          <SubscribeBox />
        </div>
      </section>
    </>
  );
}
