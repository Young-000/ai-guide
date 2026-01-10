import type { Metadata } from "next";
import localFont from "next/font/local";
import { Header, Footer } from "@/components";
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
  title: "AI 가이드 | AI 초보자를 위한 도구 안내",
  description: "ChatGPT, Claude, Cursor 등 AI 도구를 쉽게 알아보세요. AI 초보자를 위한 가이드입니다.",
  keywords: ["AI", "ChatGPT", "Claude", "Cursor", "인공지능", "AI 도구", "AI 가이드"],
  openGraph: {
    title: "AI 가이드 | AI 초보자를 위한 도구 안내",
    description: "ChatGPT, Claude, Cursor 등 AI 도구를 쉽게 알아보세요.",
    type: "website",
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
      </body>
    </html>
  );
}
