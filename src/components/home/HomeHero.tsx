import Link from 'next/link';

// Editorial, server-rendered hero. One-line value prop that communicates the
// dual nature of AIWire — AI news + practical usage guides — within ~5 seconds.
export default function HomeHero(): JSX.Element {
  return (
    <section
      aria-labelledby="home-hero-heading"
      className="border-b border-slate-200 bg-white"
    >
      <div className="mx-auto max-w-4xl px-4 py-12 md:py-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
          AI 뉴스 + 활용 가이드
        </p>
        <h2
          id="home-hero-heading"
          className="mt-3 text-3xl md:text-4xl font-bold leading-tight text-slate-900"
        >
          매일 쏟아지는 AI 소식,
          <br className="hidden sm:block" /> 핵심만 읽고 바로 써먹기
        </h2>
        <p className="mt-4 text-base md:text-lg leading-relaxed text-slate-600">
          최신 AI·LLM 뉴스를 한국어로 정리하고, 상황별 AI 활용법까지 한곳에서 안내해요.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/news"
            className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:w-auto"
          >
            최신 AI 뉴스 보기
          </Link>
          <Link
            href="/learn"
            className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-6 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 sm:w-auto"
          >
            AI 활용법 둘러보기
          </Link>
        </div>
      </div>
    </section>
  );
}
