import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <nav className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <span className="font-bold text-gray-900">AI 가이드</span>
          </Link>

          <Link
            href="/tools"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            전체 도구
          </Link>
        </div>
      </nav>
    </header>
  );
}
