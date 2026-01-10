import Link from 'next/link';
import type { Tool } from '@/types';

interface ToolCardProps {
  tool: Tool;
}

const categoryLabels: Record<string, string> = {
  chatbot: 'AI 챗봇',
  coding: '코딩',
  image: '이미지',
  video: '영상',
  productivity: '생산성',
  search: '검색',
};

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Link href={`/tools/${tool.slug}`}>
      <div className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-gray-200 transition-all duration-300">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform`}>
            {tool.icon}
          </div>
          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
            {categoryLabels[tool.category]}
          </span>
        </div>

        {/* 제목 */}
        <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
          {tool.name}
        </h3>
        <p className="text-gray-500 text-sm mb-4">
          {tool.tagline}
        </p>

        {/* 가격 정보 */}
        <div className="flex items-center gap-2 mb-4">
          {tool.pricing.free ? (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
              무료 가능
            </span>
          ) : (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
              유료
            </span>
          )}
          {tool.pricing.plans[0] && (
            <span className="text-gray-400 text-xs">
              {typeof tool.pricing.plans[0].price === 'number'
                ? tool.pricing.plans[0].price === 0
                  ? ''
                  : `$${tool.pricing.plans[0].price}/월~`
                : tool.pricing.plans[0].price
              }
            </span>
          )}
        </div>

        {/* 주요 기능 */}
        <ul className="space-y-1">
          {tool.features.slice(0, 2).map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-green-500">✓</span>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}
