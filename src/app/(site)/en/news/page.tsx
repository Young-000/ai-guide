import type { Metadata } from 'next';
import { getAllNews } from '@/lib/news';
import NewsListView from '@/components/news/NewsListView';
import { BASE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'AI & LLM News | AIWire',
  description: 'Daily-updated, distilled coverage of the latest in AI and LLMs.',
  alternates: {
    canonical: `${BASE_URL}/en/news`,
    languages: {
      'ko-KR': `${BASE_URL}/news`,
      'en-US': `${BASE_URL}/en/news`,
      'x-default': `${BASE_URL}/news`,
    },
  },
  openGraph: {
    locale: 'en_US',
  },
};

export default function EnNewsPage(): JSX.Element {
  const items = getAllNews('en');
  return <NewsListView lang="en" items={items} />;
}
