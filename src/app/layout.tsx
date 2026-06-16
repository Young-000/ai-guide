import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';
import { Analytics as VercelAnalytics } from '@vercel/analytics/next';
import { Header, Footer, FeedbackWidget } from '@/components';
import AchievementToast from '@/components/AchievementToast';
import Analytics from '@/components/Analytics';
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

// Keep Geist for any legacy references (CSS vars still available)
const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

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
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: BASE_URL,
    types: {
      'application/rss+xml': `${BASE_URL}/feed.xml`,
    },
  },
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
        {/* Pretendard — Korean web standard font via CDN */}
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
        >
          본문으로 건너뛰기
        </a>
        <Header />
        <main id="main-content" className="flex-1 bg-white">
          {children}
        </main>
        <Footer />
        <FeedbackWidget />
        <AchievementToast />
        <Analytics />
        <VercelAnalytics />
      </body>
    </html>
  );
}
