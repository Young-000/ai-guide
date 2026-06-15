import Link from 'next/link';
import type { NewsMeta } from '@/types/news';

type LeadStoryProps = {
  item: NewsMeta;
};

export default function LeadStory({ item }: LeadStoryProps): JSX.Element {
  return (
    <article>
      <Link
        href={`/news/${item.slug}`}
        className="group block"
        aria-label={`기사 읽기: ${item.title}`}
      >
        <time
          dateTime={item.date}
          className="text-xs font-semibold text-blue-600 uppercase tracking-wider"
        >
          {item.date}
        </time>
        <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors duration-150">
          {item.title}
        </h2>
        <p className="mt-4 text-lg text-slate-600 leading-relaxed max-w-2xl">
          {item.summary}
        </p>

        {item.tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="기사 태그">
            {item.tags.map((tag) => (
              <li
                key={tag}
                className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}

        <span className="mt-6 inline-flex items-center gap-1.5 text-blue-600 font-medium text-sm group-hover:gap-2.5 transition-all duration-150">
          자세히 읽기
          {/* Arrow right */}
          <svg
            className="w-4 h-4"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </span>
      </Link>
    </article>
  );
}
