import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import type { Tip } from '@/types';
import tipsData from '@/data/tips.json';
import situationsData from '@/data/situations.json';
import { getToolBySlug } from '@/lib/tools';
import TipContentRenderer from './tip-content-renderer';
import { BASE_URL } from '@/lib/site';
import { safeJson } from '@/lib/json-ld';
const tips = tipsData.tips as Tip[];

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return tips.map((tip) => ({ slug: tip.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tip = tips.find((t) => t.slug === slug);

  if (!tip) {
    return { title: 'AIWire' };
  }

  return {
    title: `${tip.title} | AIWire`,
    description: tip.excerpt,
    alternates: {
      canonical: `${BASE_URL}/tips/${slug}`,
    },
    openGraph: {
      title: `${tip.title} | AIWire`,
      description: tip.excerpt,
      url: `${BASE_URL}/tips/${slug}`,
      siteName: 'AIWire',
      locale: 'ko_KR',
      type: 'article',
    },
  };
}

const difficultyLabels = {
  beginner: { text: '초급', color: 'bg-green-100 text-green-700' },
  intermediate: { text: '중급', color: 'bg-yellow-100 text-yellow-700' },
  advanced: { text: '고급', color: 'bg-red-100 text-red-700' },
};

function buildJsonLd(tip: Tip): string {
  // JSON-LD uses only static data from the JSON file, safe from XSS
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: tip.title,
    description: tip.excerpt,
    author: {
      '@type': 'Organization',
      name: 'AIWire',
    },
    publisher: {
      '@type': 'Organization',
      name: 'AIWire',
    },
    datePublished: tip.publishedDate,
    url: `${BASE_URL}/tips/${tip.slug}`,
    inLanguage: 'ko',
  };
  return safeJson(jsonLd);
}

function getPrevNextTips(currentSlug: string): { prev: Tip | null; next: Tip | null } {
  const currentIndex = tips.findIndex((t) => t.slug === currentSlug);
  return {
    prev: currentIndex > 0 ? tips[currentIndex - 1] : null,
    next: currentIndex < tips.length - 1 ? tips[currentIndex + 1] : null,
  };
}

export default async function TipDetailPage({ params }: PageProps): Promise<React.ReactElement> {
  const { slug } = await params;
  const tip = tips.find((t) => t.slug === slug);

  if (!tip) {
    notFound();
  }

  const difficulty = difficultyLabels[tip.difficulty];
  const categoryInfo = tipsData.categories.find((c) => c.id === tip.category);
  // JSON-LD structured data (static content only, no user input)
  const jsonLdString = buildJsonLd(tip);
  const { prev, next } = getPrevNextTips(tip.slug);

  // Related situations
  const relatedSituations = tip.relatedSituations
    .map((situationSlug) => situationsData.situations.find((s) => s.slug === situationSlug))
    .filter((s): s is NonNullable<typeof s> => s !== undefined);

  // Related tools
  const relatedTools = tip.relatedTools
    .map((toolSlug) => getToolBySlug(toolSlug))
    .filter((t): t is NonNullable<typeof t> => t !== undefined);

  // Related tips
  const relatedTipItems = tip.relatedTips
    .map((tipSlug) => tips.find((t) => t.slug === tipSlug))
    .filter((t): t is Tip => t !== undefined);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* JSON-LD structured data (static content only, no user input) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString }}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6" aria-label="breadcrumb">
        <Link href="/" className="hover:text-gray-700 transition-colors">홈</Link>
        <span>/</span>
        <Link href="/tips" className="hover:text-gray-700 transition-colors">AI 활용 팁</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-none">{tip.title}</span>
      </nav>

      {/* Header */}
      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
            {categoryInfo?.icon} {categoryInfo?.name}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficulty.color}`}>
            {difficulty.text}
          </span>
          <span className="text-xs text-gray-400">{tip.publishedDate}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
          {tip.title}
        </h1>
        <p className="text-lg text-gray-500">{tip.excerpt}</p>
      </header>

      {/* Content */}
      <article className="mb-10">
        <TipContentRenderer content={tip.content} />
      </article>

      {/* Tags */}
      {tip.tags.length > 0 && (
        <section className="mb-10">
          <div className="flex flex-wrap gap-2">
            {tip.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Related situations */}
      {relatedSituations.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">관련 가이드</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {relatedSituations.map((situation) => (
              <Link
                key={situation.slug}
                href={`/situations/${situation.slug}`}
                className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{situation.icon}</span>
                  <h3 className="font-bold text-gray-900">{situation.title}</h3>
                </div>
                <p className="text-sm text-gray-500">{situation.subtitle}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Related tools */}
      {relatedTools.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">추천 도구</h2>
          <div className="flex flex-wrap gap-3">
            {relatedTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 hover:bg-blue-50 hover:border-blue-200 transition-colors"
              >
                {tool.icon && <span className="text-lg">{tool.icon}</span>}
                <span>{tool.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Related tips */}
      {relatedTipItems.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">함께 읽으면 좋은 팁</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {relatedTipItems.map((relatedTip) => {
              const relCategoryInfo = tipsData.categories.find((c) => c.id === relatedTip.category);
              return (
                <Link
                  key={relatedTip.slug}
                  href={`/tips/${relatedTip.slug}`}
                  className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all"
                >
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    {relCategoryInfo?.icon} {relCategoryInfo?.name}
                  </span>
                  <h3 className="font-bold text-gray-900 text-sm mt-2 leading-snug">
                    {relatedTip.title}
                  </h3>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Prev / Next navigation */}
      {(prev || next) && (
        <nav className="flex items-stretch gap-4 mb-10" aria-label="이전/다음 팁">
          {prev && (
            <Link
              href={`/tips/${prev.slug}`}
              className="flex-1 bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
            >
              <p className="text-xs text-gray-400 mb-1">이전 팁</p>
              <p className="text-sm font-medium text-gray-900 leading-snug">{prev.title}</p>
            </Link>
          )}
          {next && (
            <Link
              href={`/tips/${next.slug}`}
              className={`flex-1 bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors ${prev ? 'text-right' : ''}`}
            >
              <p className="text-xs text-gray-400 mb-1">다음 팁</p>
              <p className="text-sm font-medium text-gray-900 leading-snug">{next.title}</p>
            </Link>
          )}
        </nav>
      )}

      {/* Bottom CTA */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-2">더 많은 팁을 보고 싶다면?</h2>
        <p className="text-gray-300 mb-6">AI 활용의 모든 것을 학습센터에서 확인하세요.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/tips"
            className="inline-block px-6 py-3 bg-white text-gray-900 font-medium rounded-xl hover:bg-gray-100 transition-colors"
          >
            모든 팁 보기 →
          </Link>
          <Link
            href="/learn"
            className="inline-block px-6 py-3 bg-white/10 text-white font-medium rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
          >
            학습센터
          </Link>
        </div>
      </section>
    </div>
  );
}
