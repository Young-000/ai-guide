import Link from 'next/link';
import { businessInfo } from '@/lib/business-info';

export function Footer(): JSX.Element {
  return (
    <footer className="border-t border-slate-200 bg-white" role="contentinfo">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid sm:grid-cols-3 gap-8">
          {/* Brand column */}
          <div>
            <p className="text-base font-bold text-slate-900">AIWire</p>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              AI·LLM 최신 소식을 매일 한국어·영어로 정리합니다.
            </p>
            <p className="mt-3 text-sm">
              <a
                href="https://hottrend.news"
                className="text-slate-500 hover:text-blue-600 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                실시간 검색어 → hottrend.news
              </a>
            </p>
            <p className="mt-2 text-sm">
              <a
                href="https://mystica.world"
                className="text-slate-500 hover:text-blue-600 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                운세·타로·사주 → mystica.world
              </a>
            </p>
          </div>

          {/* AI 가이드 column */}
          <nav aria-label="AI 가이드 링크">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              AI 가이드
            </p>
            <ul className="space-y-2">
              {[
                { href: '/situations', label: '상황별 가이드' },
                { href: '/tools', label: 'AI 도구 목록' },
                { href: '/compare', label: '도구 비교' },
                { href: '/use-cases', label: '활용 사례' },
                { href: '/tips', label: '활용 팁' },
                { href: '/glossary', label: '용어 사전' },
                { href: '/trends', label: '트렌드' },
                { href: '/learn', label: '학습센터' },
                { href: '/quiz', label: 'AI 퀴즈' },
                { href: '/faq', label: 'FAQ' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Site links column */}
          <nav aria-label="사이트 링크">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              사이트
            </p>
            <ul className="space-y-2">
              {[
                { href: '/news', label: '뉴스' },
                { href: '/news/topics', label: '주제별 뉴스' },
                { href: '/en/news', label: 'English' },
                { href: '/about', label: '소개' },
                { href: '/terms', label: '이용약관' },
                { href: '/privacy', label: '개인정보처리방침' },
                { href: '/contact', label: '문의' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <section
          aria-label="사업자 정보"
          className="mt-8 pt-6 border-t border-slate-200 text-xs text-slate-500 leading-relaxed"
        >
          <h2 className="sr-only">사업자 정보</h2>
          <dl className="flex flex-wrap gap-x-3 gap-y-1">
            <div>
              <dt className="inline">상호</dt>{' '}
              <dd className="inline">{businessInfo.bizName}</dd>
            </div>
            <span aria-hidden="true">·</span>
            <div>
              <dt className="inline">대표</dt>{' '}
              <dd className="inline">{businessInfo.representative}</dd>
            </div>
            <span aria-hidden="true">·</span>
            <div>
              <dt className="inline">사업자등록번호</dt>{' '}
              <dd className="inline">{businessInfo.bizRegNo}</dd>
            </div>
            {businessInfo.ecommerceRegNo ? (
              <>
                <span aria-hidden="true">·</span>
                <div>
                  <dt className="inline">통신판매업신고번호</dt>{' '}
                  <dd className="inline">{businessInfo.ecommerceRegNo}</dd>
                </div>
              </>
            ) : null}
          </dl>
          <p className="mt-1">주소 {businessInfo.address}</p>
          <p className="mt-1">
            이메일{' '}
            <a
              href={`mailto:${businessInfo.email}`}
              className="hover:text-blue-600 transition-colors"
            >
              {businessInfo.email}
            </a>
            {businessInfo.phone ? <span> · 전화 {businessInfo.phone}</span> : null}
          </p>
        </section>

        <p className="mt-6 text-xs text-slate-500">
          © {new Date().getFullYear()} AIWire. 본 사이트의 일부 콘텐츠는 AI 도구의 보조를 받아
          작성되며 편집자가 검수합니다.
        </p>
      </div>
    </footer>
  );
}
