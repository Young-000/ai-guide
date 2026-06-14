import type { Metadata } from 'next';
import FaqContent from './faq-content';
import faqData from '@/data/faq.json';

const BASE_URL = 'https://ai-guide-nu.vercel.app';

export const metadata: Metadata = {
  title: '자주 묻는 질문 (FAQ) | AI 가이드',
  description:
    'AI에 대해 궁금한 점을 모두 정리했습니다. ChatGPT 사용법, AI 도구 비교, 요금, 보안 등 자주 묻는 질문과 답변을 확인하세요.',
  alternates: {
    canonical: `${BASE_URL}/faq`,
  },
  openGraph: {
    title: '자주 묻는 질문 (FAQ) | AI 가이드',
    description:
      'AI에 대해 궁금한 점을 모두 정리했습니다. ChatGPT 사용법, AI 도구 비교, 요금, 보안 등 자주 묻는 질문과 답변.',
    url: `${BASE_URL}/faq`,
    siteName: 'AI 가이드',
    locale: 'ko_KR',
    type: 'website',
  },
};

function buildFaqJsonLd(): string {
  // FAQPage JSON-LD — uses only static data from faq.json, safe from XSS
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };
  return JSON.stringify(jsonLd);
}

export default function FaqPage(): React.ReactElement {
  const jsonLdString = buildFaqJsonLd();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* FAQPage JSON-LD structured data (static content only, no user input) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString }}
      />
      <FaqContent />
    </div>
  );
}
