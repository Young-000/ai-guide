import Link from 'next/link';
import type { NewsLang, NewsMeta } from '@/types/news';

type NewsCardProps = {
  lang: NewsLang;
  item: NewsMeta;
};

export default function NewsCard({ lang, item }: NewsCardProps): JSX.Element {
  const href = lang === 'ko' ? `/news/${item.slug}` : `/en/news/${item.slug}`;

  return (
    <article className="border border-slate-200 rounded-xl p-5 bg-white hover:border-blue-300 hover:shadow-sm transition-all duration-150">
      <Link href={href} className="group block" aria-label={`기사 읽기: ${item.title}`}>
        <time
          dateTime={item.date}
          className="text-xs font-semibold text-blue-600 uppercase tracking-wider"
        >
          {item.date}
        </time>
        <h2 className="mt-1.5 font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors duration-150">
          {item.title}
        </h2>
        <p className="mt-2 text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {item.summary}
        </p>
        {item.tags.length > 0 && (
          <ul
            className="mt-3 flex flex-wrap gap-1.5"
            aria-label={lang === 'ko' ? '태그' : 'tags'}
          >
            {item.tags.map((tag) => (
              <li
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </Link>
    </article>
  );
}
