import type { Metadata } from 'next';
import { getAllNews, getAllTags } from '@/lib/news';
import { getSectionsWithCounts } from '@/lib/news-sections';
import { BASE_URL } from '@/lib/site';
import { safeJson } from '@/lib/json-ld';
import HomeHero from '@/components/home/HomeHero';
import HomeGuideStrip from '@/components/home/HomeGuideStrip';
import LeadStory from '@/components/home/LeadStory';
import HomeSections from '@/components/home/HomeSections';
import SectionChips from '@/components/news/SectionChips';
import CategoryStrip from '@/components/home/CategoryStrip';
import TrendingKeywords from '@/components/TrendingKeywords';
import SubscribeBox from '@/components/SubscribeBox';
import AdFitUnit from '@/components/AdFitUnit';

// Home revalidates so the trending-keywords widget stays reasonably fresh
// without rebuilding on every request.
export const revalidate = 300;

// Canonical now lives here (not the root layout) — see the comment in
// src/app/layout.tsx for why a layout-level canonical is unsafe. `types` is
// repeated here to keep the RSS <link rel="alternate"> that used to come
// from the layout's (now-removed) alternates object.
export const metadata: Metadata = {
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': `${BASE_URL}/feed.xml`,
    },
  },
};

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
  const tags = getAllTags('ko');
  const sections = getSectionsWithCounts('ko');

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJson(JSON_LD_DATA) }}
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

      {/* Section nav — TLDR-style topic sections */}
      <section
        aria-labelledby="section-nav-heading"
        className="border-b border-slate-200 bg-slate-50 py-5"
      >
        <div className="mx-auto max-w-6xl px-4">
          <h2 id="section-nav-heading" className="sr-only">
            뉴스 섹션
          </h2>
          <SectionChips lang="ko" sections={sections} />
        </div>
      </section>

      {/* Section digests — latest per topic section + trending keywords */}
      <section aria-labelledby="home-sections-heading" className="py-10">
        <div className="mx-auto max-w-6xl px-4">
          <h2 id="home-sections-heading" className="sr-only">
            섹션별 최신 뉴스
          </h2>
          <HomeSections lang="ko" />
          {/* Trendjacking widget — self-hides on empty/error */}
          <TrendingKeywords className="mt-12" />
        </div>
      </section>

      {/* Category strip — granular tags linking to /news/topic/[tag] */}
      <CategoryStrip tags={tags} />

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
