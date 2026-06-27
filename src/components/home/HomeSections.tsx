import Link from 'next/link';
import NewsCard from '@/components/news/NewsCard';
import { getNewsBySection, getSectionsWithCounts } from '@/lib/news-sections';
import type { NewsLang } from '@/types/news';

type HomeSectionsProps = {
  lang?: NewsLang;
  /** 섹션당 노출할 최신 기사 수 */
  perSection?: number;
};

function moreHref(lang: NewsLang, id: string): string {
  return lang === 'ko' ? `/news/section/${id}` : `/en/news/section/${id}`;
}

/**
 * TLDR AI 식 섹션별 최신 묶음. 섹션당 최신 N개 카드 + 섹션 랜딩으로 가는 '더보기'.
 * 빌드타임 정적 생성(fs 기반). 기사가 없는 섹션은 건너뛴다.
 */
export default function HomeSections({
  lang = 'ko',
  perSection = 4,
}: HomeSectionsProps): JSX.Element | null {
  const sections = getSectionsWithCounts(lang, undefined).filter(({ count }) => count > 0);
  if (sections.length === 0) return null;

  const moreLabel = lang === 'ko' ? '더보기' : 'More';

  return (
    <div className="space-y-12">
      {sections.map(({ section, count }) => {
        const items = getNewsBySection(section.id, lang).slice(0, perSection);
        if (items.length === 0) return null;
        const headingId = `home-section-${section.id}`;
        const label = lang === 'ko' ? section.labelKo : section.labelEn;
        const description = lang === 'ko' ? section.descriptionKo : section.descriptionEn;

        return (
          <section key={section.id} aria-labelledby={headingId}>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2
                  id={headingId}
                  className="text-xl font-bold text-slate-900"
                >
                  <Link
                    href={moreHref(lang, section.id)}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {label}
                  </Link>
                </h2>
                <p className="mt-1 text-sm text-slate-500">{description}</p>
              </div>
              <Link
                href={moreHref(lang, section.id)}
                className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                aria-label={`${label} ${moreLabel} (${count})`}
              >
                {moreLabel}
                <svg
                  className="h-4 w-4"
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
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((item) => (
                <NewsCard key={item.slug} lang={lang} item={item} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
