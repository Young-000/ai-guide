import Link from 'next/link';
import compareData from '@/data/compare.json';
import toolsData from '@/data/tools.json';
import type { Tool } from '@/types';
import { getToolLink, hasAffiliateLinks } from '@/lib/affiliateLinks';
import OutboundToolLink from '@/components/OutboundToolLink';
import AdUnit from '@/components/AdUnit';
import AffiliateDisclosure from '@/components/AffiliateDisclosure';

export const metadata = {
  title: 'ChatGPT vs Claude vs Gemini 비교 | AIWire',
  description: '가장 인기있는 AI 챗봇 ChatGPT, Claude, Gemini를 한눈에 비교해보세요.',
};

export default function ComparePage() {
  const { comparison } = compareData;
  const tools = toolsData.tools as Tool[];

  const chatgpt = tools.find((t) => t.slug === 'chatgpt');
  const claude = tools.find((t) => t.slug === 'claude');
  const gemini = tools.find((t) => t.slug === 'gemini');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {comparison.title}
        </h1>
        <p className="text-gray-600 text-lg">
          {comparison.description}
        </p>
      </header>

      {/* 도구 헤더 카드 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[chatgpt, claude, gemini].map((tool) => tool && (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="bg-white rounded-2xl border border-gray-100 p-6 text-center hover:shadow-lg transition-shadow"
          >
            <div className={`w-16 h-16 mx-auto rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-3xl mb-3`}>
              {tool.icon}
            </div>
            <h2 className="font-bold text-gray-900 text-lg">{tool.name}</h2>
            <p className="text-gray-500 text-sm">{tool.tagline}</p>
          </Link>
        ))}
      </div>

      {/* 비교 테이블 */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-12">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">비교 항목</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                <span className="flex items-center justify-center gap-2">
                  {chatgpt?.icon} ChatGPT
                </span>
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                <span className="flex items-center justify-center gap-2">
                  {claude?.icon} Claude
                </span>
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                <span className="flex items-center justify-center gap-2">
                  {gemini?.icon} Gemini
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {comparison.items.map((item, index) => (
              <tr
                key={index}
                className={`border-b border-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
              >
                <td className="px-6 py-4 font-medium text-gray-900">{item.feature}</td>
                <td className="px-6 py-4 text-center text-gray-600">{item.chatgpt}</td>
                <td className="px-6 py-4 text-center text-gray-600">{item.claude}</td>
                <td className="px-6 py-4 text-center text-gray-600">{item.gemini}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ad: between comparison table and 결론 */}
      <AdUnit
        slot={process.env.NEXT_PUBLIC_ADSENSE_CONTENT_SLOT ?? ''}
        format="horizontal"
        className="mb-12"
        dataPage="compare"
      />

      {/* 결론 섹션 */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-green-50 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            {chatgpt?.icon}
            <h3 className="font-bold text-gray-900">ChatGPT 추천</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• AI를 처음 시작하는 분</li>
            <li>• 다양한 기능이 필요한 분</li>
            <li>• 이미지 생성도 하고 싶은 분</li>
          </ul>
        </div>

        <div className="bg-orange-50 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            {claude?.icon}
            <h3 className="font-bold text-gray-900">Claude 추천</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• 긴 문서 분석이 필요한 분</li>
            <li>• 코딩 작업이 많은 개발자</li>
            <li>• 정확한 답변을 원하는 분</li>
          </ul>
        </div>

        <div className="bg-blue-50 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            {gemini?.icon}
            <h3 className="font-bold text-gray-900">Gemini 추천</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• 구글 서비스를 많이 쓰는 분</li>
            <li>• 최신 정보가 자주 필요한 분</li>
            <li>• Gmail/Docs 연동이 필요한 분</li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-2">어떤 걸 선택할지 고민되시나요?</h2>
        <p className="text-gray-300 mb-6">
          일단 무료로 다 써보세요! 3개 모두 무료 플랜이 있어요.
        </p>
        {(() => {
          const chatgptLink = getToolLink('chatgpt', chatgpt?.url ?? 'https://chat.openai.com');
          const claudeLink = getToolLink('claude', claude?.url ?? 'https://claude.ai');
          const geminiLink = getToolLink('gemini', gemini?.url ?? 'https://gemini.google.com');
          return (
            <div className="flex flex-wrap justify-center gap-4">
              <OutboundToolLink
                href={chatgptLink.href}
                toolName="ChatGPT"
                sourcePage="compare"
                isAffiliate={chatgptLink.isAffiliate}
                className="px-6 py-3 bg-white text-gray-900 font-medium rounded-xl hover:bg-gray-100 transition-colors"
              >
                ChatGPT 시작하기
              </OutboundToolLink>
              <OutboundToolLink
                href={claudeLink.href}
                toolName="Claude"
                sourcePage="compare"
                isAffiliate={claudeLink.isAffiliate}
                className="px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors border border-white/20"
              >
                Claude 시작하기
              </OutboundToolLink>
              <OutboundToolLink
                href={geminiLink.href}
                toolName="Gemini"
                sourcePage="compare"
                isAffiliate={geminiLink.isAffiliate}
                className="px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors border border-white/20"
              >
                Gemini 시작하기
              </OutboundToolLink>
            </div>
          );
        })()}
      </section>

      <AffiliateDisclosure show={hasAffiliateLinks(['chatgpt', 'claude', 'gemini'])} />
    </div>
  );
}
