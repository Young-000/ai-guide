import {
  HeroSection,
  PainPointsSection,
  HowItWorksSection,
  PopularSituationsSection,
  StatsSection,
  QuickSearchSection,
  FinalCtaSection,
} from '@/components/landing';

// Static JSON-LD data for structured data (no user input, safe to use)
const JSON_LD_DATA = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'AI 가이드',
  url: 'https://ai-guide-nu.vercel.app',
  description: 'AI를 처음 시작하는 분을 위한 맞춤형 가이드',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'All',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'KRW',
  },
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
