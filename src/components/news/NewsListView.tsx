import type { ReactNode } from 'react';
import type { NewsLang, NewsMeta } from '@/types/news';
import NewsCard from './NewsCard';

type NewsListViewProps = {
  lang: NewsLang;
  items: readonly NewsMeta[];
  topSlot?: ReactNode;
};

const COPY: Record<NewsLang, { heading: string; subtitle: string; empty: string }> = {
  ko: {
    heading: 'AI · LLM 뉴스',
    subtitle: '매일 업데이트되는 AI·LLM 최신 소식을 핵심만 정리했습니다.',
    empty: '아직 게시된 뉴스가 없습니다.',
  },
  en: {
    heading: 'AI & LLM News',
    subtitle: 'Daily-updated, distilled coverage of the latest in AI and LLMs.',
    empty: 'No news published yet.',
  },
};

export default function NewsListView({ lang, items, topSlot }: NewsListViewProps): JSX.Element {
  const copy = COPY[lang];
  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">{copy.heading}</h1>
      <p className="mt-2 text-gray-600">{copy.subtitle}</p>
      {topSlot && <div className="mt-4">{topSlot}</div>}
      {items.length === 0 ? (
        <p className="mt-8 text-gray-500">{copy.empty}</p>
      ) : (
        <div className="mt-6 grid gap-4">
          {items.map((item) => (
            <NewsCard key={item.slug} lang={lang} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
