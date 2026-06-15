import Link from 'next/link';

export default function FinalCtaSection(): JSX.Element {
  return (
    <section
      aria-labelledby="final-cta-title"
      className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16 md:py-20 px-4 text-white"
    >
      <div className="max-w-3xl mx-auto text-center">
        <h2
          id="final-cta-title"
          className="text-2xl md:text-3xl font-bold mb-3"
        >
          아직 어떤 AI를 써야 할지 모르겠다면?
        </h2>
        <p className="text-lg text-white/90 mb-8">
          3가지 질문에 답하면 바로 알려드릴게요
        </p>
        {/* /onboarding is built in cycle 2. Fallback to /situations if not available. */}
        <Link
          href="/onboarding"
          className="inline-block bg-white text-blue-600 font-bold py-4 px-8 rounded-2xl hover:bg-gray-100 transition-colors text-lg"
        >
          무료로 시작하기 →
        </Link>
        <p className="mt-4 text-sm text-white/70">
          가입 없이, 30초면 충분해요
        </p>
      </div>
    </section>
  );
}
