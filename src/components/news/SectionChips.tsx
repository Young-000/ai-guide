import Link from 'next/link';
import type { NewsLang } from '@/types/news';
import type { NewsSection, SectionId } from '@/lib/news-sections';

type SectionChipsProps = {
  lang: NewsLang;
  sections: readonly { section: NewsSection; count: number }[];
  activeId?: SectionId;
};

function sectionHref(lang: NewsLang, id: SectionId): string {
  return lang === 'ko' ? `/news/section/${id}` : `/en/news/section/${id}`;
}

/**
 * 섹션 간 이동 칩. 홈/뉴스/섹션 랜딩에서 공유. 현재 섹션은 aria-current로 표시.
 */
export default function SectionChips({
  lang,
  sections,
  activeId,
}: SectionChipsProps): JSX.Element | null {
  const visible = sections.filter(({ count }) => count > 0);
  if (visible.length === 0) return null;

  return (
    <nav aria-label={lang === 'ko' ? '뉴스 섹션' : 'News sections'}>
      <ul className="flex flex-wrap gap-2">
        {visible.map(({ section, count }) => {
          const isActive = section.id === activeId;
          const label = lang === 'ko' ? section.labelKo : section.labelEn;
          return (
            <li key={section.id}>
              <Link
                href={sectionHref(lang, section.id)}
                aria-current={isActive ? 'page' : undefined}
                className={
                  isActive
                    ? 'inline-flex items-center gap-1.5 rounded-full border border-blue-600 bg-blue-600 px-3.5 py-1.5 text-sm font-medium text-white transition-colors'
                    : 'inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:border-blue-400 hover:text-blue-600 transition-colors'
                }
              >
                {label}
                <span
                  className={
                    isActive
                      ? 'text-xs font-normal text-blue-100'
                      : 'text-xs font-normal text-slate-400'
                  }
                >
                  {count}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
