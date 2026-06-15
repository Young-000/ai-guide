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

export default function NewsListView({
  lang,
  items,
  topSlot,
}: NewsListViewProps): JSX.Element {
  const copy = COPY[lang];

  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">{copy.heading}</h1>
      <p className="mt-2 text-slate-600">{copy.subtitle}</p>

      {topSlot && <div className="mt-5">{topSlot}</div>}

      {items.length === 0 ? (
        <p className="mt-10 text-slate-500">{copy.empty}</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <NewsCard key={item.slug} lang={lang} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
