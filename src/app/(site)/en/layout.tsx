import type { Metadata } from 'next';
import { BASE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'AIWire — AI & LLM News',
  description: 'Daily-updated, distilled coverage of the latest in AI and LLMs, in English.',
  openGraph: {
    siteName: 'AIWire',
    locale: 'en_US',
    url: `${BASE_URL}/en/news`,
  },
};

export default function EnLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  // Root layout declares <html lang="ko">; mark this subtree as English content.
  return <div lang="en">{children}</div>;
}
