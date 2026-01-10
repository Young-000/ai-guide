import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 브랜드 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🤖</span>
              <span className="font-bold text-xl text-gray-900">AI 가이드</span>
            </div>
            <p className="text-gray-600 text-sm">
              AI 초보자를 위한 도구 가이드.<br />
              복잡한 AI 세상을 쉽게 안내해드려요.
            </p>
          </div>

          {/* 링크 */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">바로가기</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm">
                  도구 목록
                </Link>
              </li>
              <li>
                <Link href="/compare" className="text-gray-600 hover:text-gray-900 text-sm">
                  비교하기
                </Link>
              </li>
              <li>
                <Link href="/glossary" className="text-gray-600 hover:text-gray-900 text-sm">
                  용어 사전
                </Link>
              </li>
            </ul>
          </div>

          {/* 카테고리 */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">카테고리</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/?category=chatbot" className="text-gray-600 hover:text-gray-900 text-sm">
                  AI 챗봇
                </Link>
              </li>
              <li>
                <Link href="/?category=coding" className="text-gray-600 hover:text-gray-900 text-sm">
                  코딩 AI
                </Link>
              </li>
              <li>
                <Link href="/?category=image" className="text-gray-600 hover:text-gray-900 text-sm">
                  이미지 생성
                </Link>
              </li>
              <li>
                <Link href="/?category=productivity" className="text-gray-600 hover:text-gray-900 text-sm">
                  생산성
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>© 2025 AI 가이드. Made with ❤️ for AI beginners.</p>
        </div>
      </div>
    </footer>
  );
}
