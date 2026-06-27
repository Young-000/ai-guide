import type { Metadata } from 'next';
import { getAllNews } from '@/lib/news';
import { getSectionsWithCounts } from '@/lib/news-sections';
import NewsListView from '@/components/news/NewsListView';
import SectionChips from '@/components/news/SectionChips';
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
  const sections = getSectionsWithCounts('en');
  return (
    <NewsListView
      lang="en"
      items={items}
      topSlot={
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Sections
          </p>
          <SectionChips lang="en" sections={sections} />
        </div>
      }
    />
  );
}
