export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white" role="contentinfo">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-sm font-semibold text-gray-900">AIWire</p>
        <p className="mt-1 text-xs text-gray-500">
          AI·LLM 최신 소식을 매일 한국어·영어로 정리합니다.
        </p>

        <nav aria-label="사이트 링크" className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
          <a href="/about" className="text-xs text-gray-500 hover:text-gray-700">소개</a>
          <a href="/privacy" className="text-xs text-gray-500 hover:text-gray-700">개인정보처리방침</a>
          <a href="/contact" className="text-xs text-gray-500 hover:text-gray-700">문의</a>
          <a href="/news" className="text-xs text-gray-500 hover:text-gray-700">뉴스</a>
          <a href="/tools" className="text-xs text-gray-500 hover:text-gray-700">도구</a>
        </nav>

        <p className="mt-4 text-xs text-gray-400">
          © {new Date().getFullYear()} AIWire. 본 사이트의 일부 콘텐츠는 AI 도구의 보조를 받아
          작성되며 편집자가 검수합니다.
        </p>
      </div>
    </footer>
  );
}
