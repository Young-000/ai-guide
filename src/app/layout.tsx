import type { Metadata } from 'next';
import Script from 'next/script';
import Analytics from '@/components/Analytics';
import { Analytics as VercelAnalytics } from '@vercel/analytics/next';
import { BASE_URL } from '@/lib/site';
import './globals.css';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Site-wide JSON-LD: Organization + WebSite (for AEO / answer engine discovery).
// No SearchAction — site has no dedicated search endpoint.
const SITE_JSON_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'AIWire',
      url: BASE_URL,
    },
    {
      '@type': 'WebSite',
      name: 'AIWire',
      url: BASE_URL,
    },
  ],
}).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');

export const metadata: Metadata = {
  title: 'AIWire | AI·LLM 뉴스 미디어',
  description:
    'AI·LLM 분야의 최신 소식을 매일 한국어·영어로 정리하는 뉴스 미디어. AI 도구 가이드, 학습 자료, 비교 분석까지 제공합니다.',
  keywords: [
    'AI 뉴스', 'LLM 뉴스', 'AI 최신 소식', 'AI 가이드', 'AI 입문',
    'ChatGPT 사용법', 'Claude 사용법', 'AI 도구 추천', 'AI 활용법',
    '인공지능 뉴스', 'AI 도구 비교', 'AI 미디어',
  ],
  authors: [{ name: 'AIWire 편집팀' }],
  robots: { index: true, follow: true },
  // Google Search Console 소유권 확인 메타. env가 있을 때만 태그 출력(없으면 undefined → 미출력).
  // metadata는 서버에서 평가되므로 non-public env 사용 가능.
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
  metadataBase: new URL(BASE_URL),
  // No site-wide `alternates.canonical` here on purpose: Next.js metadata
  // merging replaces the whole `alternates` object per segment (it does not
  // deep-merge canonical/types), so a layout-level canonical silently leaks
  // to every child route that doesn't declare its own `alternates`. That
  // caused 8+ index pages to canonical to the homepage instead of
  // themselves. Each indexable page now sets its own `alternates.canonical`
  // (home included, see src/app/(site)/page.tsx).
  openGraph: {
    title: 'AIWire | AI·LLM 뉴스 미디어',
    description: 'AI·LLM 최신 소식을 매일 한국어·영어로 정리합니다. AI 도구 가이드와 학습 자료도 제공합니다.',
    type: 'website',
    url: BASE_URL,
    siteName: 'AIWire',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIWire | AI·LLM 뉴스 미디어',
    description: 'AI·LLM 최신 소식을 매일 한국어·영어로 정리합니다.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return (
    <html lang="ko">
      <head>
        {/* Pretendard — Korean web standard font via CDN (dynamic subset = smaller, display: swap) */}
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard-dynamic-subset.css"
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: SITE_JSON_LD }}
        />

        {process.env.NODE_ENV === 'production' && (
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1379707580934572"
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}'${
                  process.env.NEXT_PUBLIC_GA_DEBUG === 'true'
                    ? ", { debug_mode: true }"
                    : ''
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body className="min-h-screen flex flex-col">
        {children}
        <Analytics />
        <VercelAnalytics />
      </body>
    </html>
  );
}
