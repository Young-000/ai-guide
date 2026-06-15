import {
  HeroSection,
  PainPointsSection,
  HowItWorksSection,
  PopularSituationsSection,
  StatsSection,
  QuickSearchSection,
  FinalCtaSection,
} from '@/components/landing';
import LatestNewsSection from '@/components/home/LatestNewsSection';
import { BASE_URL } from '@/lib/site';

// Static JSON-LD data for structured data (no user input, safe to use)
const JSON_LD_DATA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AIWire',
  url: BASE_URL,
  description: 'AI·LLM 최신 소식을 매일 한국어·영어로 정리하는 뉴스 미디어',
  inLanguage: 'ko',
};

export default function Home(): JSX.Element {
  return (
    <div>
      {/* JSON-LD structured data for SEO - static content, safe to inline */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(JSON_LD_DATA),
        }}
      />

      {/* Latest AI news feed — media-style above the fold */}
      <LatestNewsSection />

      {/* Section 1: Hero - Value proposition + CTA */}
      <HeroSection />

      {/* Section 2: Pain Points - Persona empathy cards */}
      <PainPointsSection />

      {/* Section 3: How It Works - 3-step process */}
      <HowItWorksSection />

      {/* Section 4: Popular Situations - Top 6 with category filter */}
      <div id="popular-situations">
        <PopularSituationsSection />
      </div>

      {/* Section 5: Stats - Dynamic numbers */}
      <StatsSection />

      {/* Section 6: Quick Search - Existing search functionality */}
      <QuickSearchSection />

      {/* Section 7: Final CTA - Bottom conversion */}
      <FinalCtaSection />
    </div>
  );
}
