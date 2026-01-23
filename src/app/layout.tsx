import type { Metadata } from "next";
import localFont from "next/font/local";
import { Header, Footer, FeedbackWidget } from "@/components";
import "./globals.css";

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
  title: "AI 가이드 | 상황별 맞춤 AI 도구 추천",
  description: "PDF 요약, 번역, 이미지 생성 등 상황에 맞는 AI 도구를 찾아보세요. 초보자도 쉽게 따라할 수 있는 단계별 가이드를 제공합니다.",
  keywords: [
    "AI",
    "AI 가이드",
    "AI 도구",
    "ChatGPT",
    "Claude",
    "Cursor",
    "인공지능",
    "PDF 요약",
    "AI 번역",
    "이미지 생성",
    "AI 글쓰기",
    "코딩 도우미",
    "AI 초보자",
    "상황별 AI",
  ],
  authors: [{ name: "AI Guide Team" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "AI 가이드 | 상황별 맞춤 AI 도구 추천",
    description: "PDF 요약, 번역, 이미지 생성 등 상황에 맞는 AI 도구를 찾아보세요. 초보자도 쉽게 따라할 수 있는 단계별 가이드를 제공합니다.",
    type: "website",
    url: "https://ai-guide-nu.vercel.app",
    siteName: "AI 가이드",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI 가이드 | 상황별 맞춤 AI 도구 추천",
    description: "PDF 요약, 번역, 이미지 생성 등 상황에 맞는 AI 도구를 찾아보세요. 초보자도 쉽게 따라할 수 있는 단계별 가이드를 제공합니다.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <FeedbackWidget />
      </body>
    </html>
  );
}
