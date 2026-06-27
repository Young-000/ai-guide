import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import NewsCard from '@/components/news/NewsCard';
import SectionChips from '@/components/news/SectionChips';
import SectionJsonLd from '@/components/news/SectionJsonLd';
import {
  SECTION_IDS,
  getNewsBySection,
  getSection,
  getSectionsWithCounts,
  isSectionId,
} from '@/lib/news-sections';
import { BASE_URL } from '@/lib/site';

type Params = { section: string };

export function generateStaticParams(): Params[] {
  return SECTION_IDS.map((section) => ({ section }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const section = getSection(params.section);
  if (!section) return {};
  const canonical = `${BASE_URL}/en/news/section/${section.id}`;
  return {
    title: `${section.labelEn} | AI News | AIWire`,
    description: `${section.descriptionEn} — the latest AI & LLM news grouped into the ${section.labelEn} section.`,
    alternates: {
      canonical,
      languages: {
        'ko-KR': `${BASE_URL}/news/section/${section.id}`,
        'en-US': canonical,
        'x-default': `${BASE_URL}/news/section/${section.id}`,
      },
    },
    openGraph: { locale: 'en_US' },
  };
}

export default function EnSectionPage({ params }: { params: Params }): JSX.Element {
  if (!isSectionId(params.section)) notFound();
  const section = getSection(params.section);
  if (!section) notFound();

  const items = getNewsBySection(section.id, 'en');
  const sections = getSectionsWithCounts('en');
  const others = sections.filter((s) => s.section.id !== section.id && s.count > 0);
  const canonical = `${BASE_URL}/en/news/section/${section.id}`;

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <SectionJsonLd section={section} lang="en" items={items} url={canonical} />

      {/* Back link */}
      <Link
        href="/en/news"
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
      >
        <svg
          className="h-4 w-4"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        All news
      </Link>

      <h1 className="mt-5 text-3xl font-bold text-slate-900">{section.labelEn}</h1>
      <p className="mt-2 text-slate-600">{section.descriptionEn}</p>
      <p className="mt-1 text-sm text-slate-500">{items.length} articles</p>

      {/* Section nav */}
      <div className="mt-5">
        <SectionChips lang="en" sections={sections} activeId={section.id} />
      </div>

      {items.length === 0 ? (
        <p className="mt-10 text-slate-500">No articles in this section yet.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <NewsCard key={item.slug} lang="en" item={item} />
          ))}
        </div>
      )}

      {/* Cross-links: other sections */}
      {others.length > 0 && (
        <div className="mt-12 border-t border-slate-200 pt-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Other sections
          </h2>
          <ul className="flex flex-wrap gap-2">
            {others.map(({ section: other }) => (
              <li key={other.id}>
                <Link
                  href={`/en/news/section/${other.id}`}
                  className="inline-block rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  {other.labelEn}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
