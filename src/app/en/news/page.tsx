import type { Metadata } from 'next';
import { getAllNews } from '@/lib/news';
import NewsListView from '@/components/news/NewsListView';
import { BASE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'AI & LLM News | AI Guide',
  description: 'Daily-updated, distilled coverage of the latest in AI and LLMs.',
  alternates: {
    canonical: `${BASE_URL}/en/news`,
    languages: {
      'ko-KR': `${BASE_URL}/news`,
      'en-US': `${BASE_URL}/en/news`,
      'x-default': `${BASE_URL}/news`,
    },
  },
};

export default function EnNewsPage(): JSX.Element {
  const items = getAllNews('en');
  return <NewsListView lang="en" items={items} />;
}
