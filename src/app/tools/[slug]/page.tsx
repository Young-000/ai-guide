import Link from 'next/link';
import { notFound } from 'next/navigation';
import toolsData from '@/data/tools.json';
import type { Tool } from '@/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const categoryLabels: Record<string, string> = {
  chatbot: 'AI 챗봇',
  coding: '코딩',
  image: '이미지',
  video: '영상',
  productivity: '생산성',
  search: '검색',
};

export async function generateStaticParams() {
  return toolsData.tools.map((tool) => ({
    slug: tool.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const tool = toolsData.tools.find((t) => t.slug === slug) as Tool | undefined;

  if (!tool) {
    return { title: '도구를 찾을 수 없습니다' };
  }

  return {
    title: `${tool.name} - AI 가이드`,
    description: tool.description,
  };
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const tools = toolsData.tools as Tool[];
  const tool = tools.find((t) => t.slug === slug);

  if (!tool) {
    notFound();
  }

  const alternatives = tools.filter((t) => tool.alternatives.includes(t.slug));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 뒤로가기 */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        도구 목록으로
      </Link>

      {/* 헤더 */}
      <header className="mb-8">
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-4xl shadow-lg`}>
            {tool.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                {categoryLabels[tool.category]}
              </span>
              {tool.pricing.free && (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  무료 가능
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{tool.name}</h1>
            <p className="text-gray-500 text-lg">{tool.tagline}</p>
          </div>
        </div>

        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
        >
          {tool.name} 시작하기
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </header>

      {/* 설명 */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">소개</h2>
        <p className="text-gray-600 leading-relaxed">
          {tool.description}
        </p>
      </section>

      {/* 시작하기 가이드 */}
      {tool.guide && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">시작하기</h2>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
            <ol className="space-y-3">
              {tool.guide.gettingStarted.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* 주요 기능 */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">주요 기능</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tool.features.map((feature, index) => (
            <div key={index} className="bg-white p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-green-500 text-lg">✓</span>
                <span className="text-gray-700 font-medium">{feature}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 활용 팁 */}
      {tool.guide && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">활용 팁</h2>
          <div className="bg-amber-50 rounded-2xl p-6">
            <ul className="space-y-3">
              {tool.guide.proTips.map((tip, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-amber-500 text-lg">💡</span>
                  <span className="text-gray-700">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 사용 예시 */}
      {tool.guide && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">이렇게 활용해보세요</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tool.guide.useCases.map((useCase, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <h3 className="font-bold text-gray-900 mb-2">{useCase.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{useCase.description}</p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">예시</p>
                  <p className="text-sm text-gray-700 font-medium">&ldquo;{useCase.example}&rdquo;</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 한계점 */}
      {tool.guide && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">알아두세요</h2>
          <div className="bg-gray-50 rounded-2xl p-6">
            <ul className="space-y-2">
              {tool.guide.limitations.map((limitation, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-600">
                  <span className="text-gray-400">•</span>
                  <span>{limitation}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 이런 분께 추천 */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">이런 분께 추천해요</h2>
        <ul className="space-y-2">
          {tool.bestFor.map((item, index) => (
            <li key={index} className="flex items-center gap-3 text-gray-600">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* 가격 정보 */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">가격</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tool.pricing.plans.map((plan, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl border ${
                index === 0 ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-white'
              }`}
            >
              <h3 className="font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-2xl font-bold text-gray-900 mb-3">
                {typeof plan.price === 'number'
                  ? plan.price === 0
                    ? '무료'
                    : `$${plan.price}/월`
                  : plan.price
                }
              </p>
              {plan.features && (
                <ul className="space-y-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 대안 도구 */}
      {alternatives.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">비슷한 도구</h2>
          <div className="flex flex-wrap gap-3">
            {alternatives.map((alt) => (
              <Link
                key={alt.slug}
                href={`/tools/${alt.slug}`}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
              >
                <span>{alt.icon}</span>
                <span className="font-medium text-gray-700">{alt.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-center text-white">
        <h2 className="text-xl font-bold mb-2">지금 바로 시작하세요</h2>
        <p className="text-gray-300 mb-6">{tool.name}으로 AI의 가능성을 경험해보세요.</p>
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-medium rounded-xl hover:bg-gray-100 transition-colors"
        >
          {tool.name} 바로가기
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </section>
    </div>
  );
}
