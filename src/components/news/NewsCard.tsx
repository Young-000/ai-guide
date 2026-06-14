import Link from 'next/link';
import type { NewsLang, NewsMeta } from '@/types/news';

type NewsCardProps = {
  lang: NewsLang;
  item: NewsMeta;
};

export default function NewsCard({ lang, item }: NewsCardProps): JSX.Element {
  const href = lang === 'ko' ? `/news/${item.slug}` : `/en/news/${item.slug}`;
  return (
    <article className="border border-gray-100 rounded-xl p-5 bg-white hover:border-gray-300 transition-colors">
      <Link href={href} className="block">
        <time dateTime={item.date} className="text-xs text-gray-500">
          {item.date}
        </time>
        <h2 className="mt-1 font-bold text-gray-900 text-lg leading-snug">{item.title}</h2>
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{item.summary}</p>
        {item.tags.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="태그">
            {item.tags.map((tag) => (
              <li key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                {tag}
              </li>
            ))}
          </ul>
        )}
      </Link>
    </article>
  );
}
