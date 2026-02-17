import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { Header, Footer, FeedbackWidget } from "@/components";
import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: 'AI 가이드 | 5분 만에 나에게 맞는 AI 찾기',
  description:
    'AI를 처음 시작하는 분을 위한 맞춤형 가이드. 3가지 질문에 답하면 나에게 딱 맞는 AI 도구와 바로 따라할 수 있는 사용법을 알려드려요. 무료.',
  keywords: [
    'AI 추천',
    'AI 가이드',
    'AI 입문',
    'AI 초보',
    'ChatGPT 사용법',
    'Claude 사용법',
    'AI 도구 추천',
    'AI 활용법',
    'AI 시작하기',
    '인공지능 입문',
    'AI 도구 비교',
    '맞춤 AI 추천',
  ],
  authors: [{ name: 'AI Guide Team' }],
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://ai-guide-nu.vercel.app',
  },
  openGraph: {
    title: 'AI 가이드 | 5분 만에 나에게 맞는 AI 찾기',
    description:
      '3가지 질문에 답하면 나에게 딱 맞는 AI 도구를 추천해드려요. 바로 따라할 수 있는 단계별 가이드까지.',
    type: 'website',
    url: 'https://ai-guide-nu.vercel.app',
    siteName: 'AI 가이드',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI 가이드 | 5분 만에 나에게 맞는 AI 찾기',
    description:
      '3가지 질문에 답하면 나에게 딱 맞는 AI 도구를 추천해드려요.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
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
                gtag('config', '${GA_ID}'${process.env.NEXT_PUBLIC_GA_DEBUG === 'true' ? ", { debug_mode: true }" : ''});
              `}
            </Script>
          </>
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen flex flex-col`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-500 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
        >
          본문으로 건너뛰기
        </a>
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <FeedbackWidget />
      </body>
    </html>
  );
}
