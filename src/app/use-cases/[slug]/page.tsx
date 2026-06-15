import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import type { UseCaseStory } from '@/types';
import useCasesData from '@/data/use-cases.json';
import situationsData from '@/data/situations.json';
import { getToolBySlug } from '@/lib/tools';
import { BASE_URL } from '@/lib/site';
const useCases = useCasesData.useCases as UseCaseStory[];

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return useCases.map((uc) => ({ slug: uc.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const useCase = useCases.find((uc) => uc.slug === slug);

  if (!useCase) {
    return { title: 'AI 가이드' };
  }

  const description = `${useCase.persona}의 사례: ${useCase.challenge.slice(0, 80)}... 결과: ${useCase.resultHighlight}`;

  return {
    title: `${useCase.title} | AI Guide`,
    description,
    alternates: {
      canonical: `${BASE_URL}/use-cases/${slug}`,
    },
    openGraph: {
      title: `${useCase.title} | AI Guide`,
      description,
      url: `${BASE_URL}/use-cases/${slug}`,
      siteName: 'AI 가이드',
      locale: 'ko_KR',
      type: 'article',
    },
  };
}

const difficultyLabels = {
  easy: { text: '쉬움', color: 'bg-green-100 text-green-700' },
  medium: { text: '보통', color: 'bg-yellow-100 text-yellow-700' },
  hard: { text: '어려움', color: 'bg-red-100 text-red-700' },
};

function getRelatedUseCases(current: UseCaseStory): UseCaseStory[] {
  const sameProfession = useCases.filter(
    (uc) => uc.profession === current.profession && uc.slug !== current.slug,
  );

  const currentCategory = situationsData.situations.find(
    (s) => s.slug === current.situation,
  )?.category;

  const sameSituationCategory = useCases.filter((uc) => {
    if (uc.slug === current.slug) return false;
    if (sameProfession.some((sp) => sp.slug === uc.slug)) return false;
    const ucCategory = situationsData.situations.find(
      (s) => s.slug === uc.situation,
    )?.category;
    return ucCategory === currentCategory;
  });

  return [...sameProfession, ...sameSituationCategory].slice(0, 3);
}

function buildJsonLd(useCase: UseCaseStory): string {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: useCase.title,
    description: `${useCase.persona}의 AI 활용 사례: ${useCase.resultHighlight}`,
    author: {
      '@type': 'Organization',
      name: 'AI Guide',
    },
  };
  return JSON.stringify(jsonLd);
}

export default async function UseCaseDetailPage({ params }: PageProps): Promise<React.ReactElement> {
  const { slug } = await params;
  const useCase = useCases.find((uc) => uc.slug === slug);

  if (!useCase) {
    notFound();
  }

  const difficulty = difficultyLabels[useCase.difficulty];
  const primaryTool = getToolBySlug(useCase.toolUsed);
  const additionalTools = (useCase.additionalTools ?? [])
    .map((s) => getToolBySlug(s))
    .filter((t): t is NonNullable<typeof t> => t !== undefined);
  const situation = situationsData.situations.find(
    (s) => s.slug === useCase.situation,
  );
  const relatedUseCases = getRelatedUseCases(useCase);

  // JSON-LD uses only static data from the JSON file, safe from XSS
  const jsonLdString = buildJsonLd(useCase);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* JSON-LD structured data (static content only, no user input) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString }}
      />

      {/* Back link */}
      <Link
        href="/use-cases"
        className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        활용 사례 목록으로
      </Link>

      {/* Header */}
      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
            {useCase.professionLabel}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficulty.color}`}>
            난이도: {difficulty.text}
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
          {useCase.title}
        </h1>
        <p className="text-lg text-gray-500">{useCase.persona}</p>
      </header>

      {/* Challenge */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-full text-sm font-bold">
            !
          </span>
          <h2 className="text-xl font-bold text-gray-900">어떤 문제가 있었나요?</h2>
        </div>
        <div className="bg-red-50 rounded-2xl p-6">
          <p className="text-gray-700 leading-relaxed">{useCase.challenge}</p>
        </div>
      </section>

      {/* Solution */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
            AI
          </span>
          <h2 className="text-xl font-bold text-gray-900">AI로 어떻게 해결했나요?</h2>
        </div>
        <div className="bg-blue-50 rounded-2xl p-6">
          <p className="text-gray-700 leading-relaxed mb-4">{useCase.solution}</p>

          {/* Tools used */}
          <div className="border-t border-blue-100 pt-4">
            <p className="text-sm text-blue-600 font-medium mb-2">사용한 도구</p>
            <div className="flex flex-wrap gap-2">
              {primaryTool && (
                <Link
                  href={`/tools/${primaryTool.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-sm font-medium text-gray-800 hover:bg-blue-50 transition-colors"
                >
                  {primaryTool.icon && <span>{primaryTool.icon}</span>}
                  <span>{primaryTool.name}</span>
                  <span className="px-1.5 py-0.5 bg-blue-500 text-white text-[10px] rounded font-bold">
                    MAIN
                  </span>
                </Link>
              )}
              {additionalTools.map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {tool.icon && <span>{tool.icon}</span>}
                  <span>{tool.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Result */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full text-sm font-bold">
            ✓
          </span>
          <h2 className="text-xl font-bold text-gray-900">어떤 결과를 얻었나요?</h2>
        </div>
        <div className="bg-green-50 rounded-2xl p-6">
          <p className="text-2xl font-bold text-green-700 mb-3">{useCase.resultHighlight}</p>
          <p className="text-gray-700 leading-relaxed">{useCase.result}</p>
        </div>
      </section>

      {/* CTA: Try it yourself */}
      {situation && (
        <section className="mb-10">
          <Link
            href={`/situations/${situation.slug}`}
            className="block bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white hover:from-blue-600 hover:to-indigo-700 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">나도 해보기</p>
                <p className="text-xl font-bold">{situation.title}</p>
                <p className="text-blue-100 mt-1">
                  단계별 가이드를 따라 바로 시작해보세요
                </p>
              </div>
              <span className="text-3xl group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>
        </section>
      )}

      {/* Tags */}
      {useCase.tags.length > 0 && (
        <section className="mb-10">
          <div className="flex flex-wrap gap-2">
            {useCase.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Related use cases */}
      {relatedUseCases.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">비슷한 사례 더 보기</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {relatedUseCases.map((related) => {
              const relDifficulty = difficultyLabels[related.difficulty];
              return (
                <Link
                  key={related.slug}
                  href={`/use-cases/${related.slug}`}
                  className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      {related.professionLabel}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${relDifficulty.color}`}
                    >
                      {relDifficulty.text}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-2 leading-snug">
                    {related.title}
                  </h3>
                  <p className="text-xs text-green-700 font-medium">{related.resultHighlight}</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-2">더 많은 사례가 궁금하다면?</h2>
        <p className="text-gray-300 mb-6">다양한 직업군의 AI 활용 사례를 확인해보세요.</p>
        <Link
          href="/use-cases"
          className="inline-block px-6 py-3 bg-white text-gray-900 font-medium rounded-xl hover:bg-gray-100 transition-colors"
        >
          모든 사례 보기 →
        </Link>
      </section>
    </div>
  );
}
