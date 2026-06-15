import Link from 'next/link';

type TagChipsProps = {
  tags: string[];
  activeTag?: string;
  showAll?: boolean;
};

export default function TagChips({ tags, activeTag, showAll = false }: TagChipsProps): JSX.Element {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="뉴스 카테고리 태그">
      {showAll && (
        <li>
          <Link
            href="/news"
            className={`inline-block text-sm px-3 py-1.5 rounded-full border transition-colors ${
              !activeTag
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            전체
          </Link>
        </li>
      )}
      {tags.map((tag) => (
        <li key={tag}>
          <Link
            href={`/news/topic/${encodeURIComponent(tag)}`}
            className={`inline-block text-sm px-3 py-1.5 rounded-full border transition-colors ${
              activeTag === tag
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            {tag}
          </Link>
        </li>
      ))}
    </ul>
  );
}
