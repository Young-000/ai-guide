import Link from 'next/link';
import { notFound } from 'next/navigation';
import toolsData from '@/data/tools.json';
import type { Tool } from '@/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

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
    description: tool.tagline,
  };
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const tools = toolsData.tools as Tool[];
  const tool = tools.find((t) => t.slug === slug);

  if (!tool) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* 뒤로가기 */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-8 text-sm"
      >
        ← 홈으로
      </Link>

      {/* 헤더: 아이콘 + 이름 + 설명 */}
      <header className="text-center mb-8">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${tool.color} text-4xl mb-4`}>
          {tool.icon}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{tool.name}</h1>
        <p className="text-gray-600">{tool.tagline}</p>
      </header>

      {/* 시작 버튼 */}
      <div className="text-center mb-6">
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
        >
          {tool.name} 시작하기 →
        </a>
        {tool.pricing.free && (
          <p className="mt-2 text-sm text-green-600">무료로 시작 가능</p>
        )}
      </div>

      {/* 빠른 시작 - 최상단 배치 */}
      {tool.installation?.quickStart && (
        <section className="mb-10">
          <div className="p-5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">⚡</span>
              <h2 className="text-lg font-bold">바로 시작하기</h2>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">복붙 OK</span>
            </div>
            <div className="space-y-2 font-mono text-sm bg-white/10 rounded-xl p-4">
              {tool.installation.quickStart.map((step: string, i: number) => (
                <p key={i} className="text-white/95">{step}</p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 설명 */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 mb-3">소개</h2>
        <p className="text-gray-600 leading-relaxed">{tool.description}</p>
      </section>

      {/* 주요 기능 */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 mb-3">주요 기능</h2>
        <ul className="space-y-2">
          {tool.features.slice(0, 4).map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-gray-600">
              <span className="text-green-500">✓</span>
              {feature}
            </li>
          ))}
        </ul>
      </section>

      {/* 상세 시작 가이드 */}
      {tool.installation && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-3">📖 상세 가이드</h2>
          <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200 text-sm text-gray-500">
              <span>⏱️ {tool.installation.timeToSetup}</span>
              <span>📋 {tool.installation.requirements.join(', ')}</span>
            </div>
            <ol className="space-y-4">
              {tool.installation.steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{step.title}</p>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* 시작하기 가이드 (installation이 없는 경우) */}
      {!tool.installation && tool.guide && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-3">시작 방법</h2>
          <div className="bg-gray-50 rounded-xl p-5">
            <ol className="space-y-4">
              {tool.guide.gettingStarted.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </span>
                  <p className="text-gray-700 pt-0.5">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* 기본 사용법 */}
      {tool.guide?.basicUsage && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-3">📱 기본 사용법</h2>
          <div className="bg-blue-50 rounded-xl p-5">
            <div className="space-y-4">
              {tool.guide.basicUsage.map((item: { title: string; description: string }, i: number) => (
                <div key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 더 잘 쓰기 (Pro Tips) */}
      {tool.guide?.proTips && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-3">💡 더 잘 쓰는 팁</h2>
          <div className="bg-amber-50 rounded-xl p-5">
            <ul className="space-y-3">
              {tool.guide.proTips.map((tip: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-gray-700">
                  <span className="text-amber-500 mt-0.5">💡</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 활용 사례 */}
      {tool.guide?.useCases && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-3">🎯 이렇게 활용해보세요</h2>
          <div className="space-y-4">
            {tool.guide.useCases.map((useCase: { title: string; description: string; example: string }, i: number) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-medium text-gray-900 mb-1">{useCase.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{useCase.description}</p>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">예시 프롬프트:</p>
                  <p className="text-sm text-gray-800 font-mono">&quot;{useCase.example}&quot;</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 한계점 */}
      {tool.guide?.limitations && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-3">⚠️ 알아두세요</h2>
          <div className="bg-red-50 rounded-xl p-5">
            <ul className="space-y-2">
              {tool.guide.limitations.map((limitation: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                  <span className="text-red-400">•</span>
                  <span>{limitation}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 가격 */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 mb-3">가격</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {tool.pricing.plans.slice(0, 3).map((plan, i) => (
            <div
              key={i}
              className={`flex-1 min-w-[140px] p-4 rounded-xl ${
                i === 0 ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'
              }`}
            >
              <p className="font-medium text-gray-900 text-sm">{plan.name}</p>
              <p className="text-lg font-bold text-gray-900">
                {typeof plan.price === 'number'
                  ? plan.price === 0
                    ? '무료'
                    : `$${plan.price}/월`
                  : plan.price}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 다시 시작 버튼 */}
      <div className="text-center pt-6 border-t border-gray-100">
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
        >
          {tool.name} 시작하기 →
        </a>
      </div>
    </div>
  );
}
