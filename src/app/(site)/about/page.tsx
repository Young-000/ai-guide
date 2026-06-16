import type { Metadata } from 'next';
import Link from 'next/link';
import { BASE_URL } from '@/lib/site';
import EmbedSnippet from '@/components/EmbedSnippet';

const EMBED_IFRAME = `<iframe src="${BASE_URL}/embed/ai-news" width="100%" height="360" style="border:1px solid #e2e8f0;border-radius:12px;" title="AIWire 최신 AI 뉴스" loading="lazy"></iframe>`;

export const metadata: Metadata = {
  title: '소개 | AIWire',
  description:
    'AIWire는 AI·LLM 분야의 최신 소식을 매일 한국어와 영어로 정리하는 미디어입니다. 출처를 명시하고 핵심만 요약·해설합니다.',
  alternates: { canonical: `${BASE_URL}/about` },
};

export default function AboutPage(): JSX.Element {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">AIWire 소개</h1>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">우리가 하는 일</h2>
        <p className="text-gray-700 leading-relaxed">
          AIWire는 AI·LLM(대형 언어 모델) 분야의 최신 동향을 매일{' '}
          <strong>한국어와 영어</strong>로 정리해 전달하는 뉴스 미디어입니다. 학술 논문 발표부터
          주요 AI 기업의 제품 업데이트, 정책 동향, 연구 결과까지 — 핵심만 추려 빠르게 읽을 수
          있도록 요약·해설합니다.
        </p>
        <p className="mt-4 text-gray-700 leading-relaxed">
          인터넷에 넘쳐나는 AI 관련 정보 중 실제로 중요한 내용을 선별해, 바쁜 독자도 하루 5분
          안에 AI 업계 핵심 흐름을 파악할 수 있도록 하는 것이 우리의 목표입니다.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">편집 원칙</h2>
        <ol className="space-y-5">
          <li className="flex gap-4">
            <span
              aria-hidden="true"
              className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center"
            >
              1
            </span>
            <div>
              <p className="font-semibold text-gray-900">출처 명시</p>
              <p className="mt-1 text-sm text-gray-700">
                모든 기사에는 원문 출처 링크를 첨부합니다. 독자가 직접 원문을 확인할 수 있도록
                출처 기관과 URL을 함께 표기합니다.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span
              aria-hidden="true"
              className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center"
            >
              2
            </span>
            <div>
              <p className="font-semibold text-gray-900">재작성·요약 (복제 금지)</p>
              <p className="mt-1 text-sm text-gray-700">
                원문을 그대로 복사하지 않습니다. 각 기사는 편집팀이 직접 읽고 핵심 내용을
                재작성·요약합니다. 인용이 필요한 경우 명확히 표시합니다.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span
              aria-hidden="true"
              className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center"
            >
              3
            </span>
            <div>
              <p className="font-semibold text-gray-900">AI 보조 작성 고지</p>
              <p className="mt-1 text-sm text-gray-700">
                일부 기사는 AI 도구를 활용해 초안을 작성하며, 편집자가 사실 확인 및 최종 검수를
                거쳐 게재합니다. 모든 게재 콘텐츠는 편집자의 검토를 통과한 것입니다.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span
              aria-hidden="true"
              className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center"
            >
              4
            </span>
            <div>
              <p className="font-semibold text-gray-900">사실 확인 및 정정</p>
              <p className="mt-1 text-sm text-gray-700">
                명백한 오류나 오해를 유발하는 내용이 포함된 경우 정정 기사를 게재하거나 기존
                기사를 수정합니다. 수정 내역은 기사 하단에 명시합니다.
              </p>
            </div>
          </li>
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">운영 방침</h2>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
          <li>특정 기업이나 제품의 광고성 기사를 정론 기사처럼 제공하지 않습니다.</li>
          <li>독자의 개인정보는 최소한으로 수집하며, 제3자에게 무단 제공하지 않습니다.</li>
          <li>사이트에는 Google AdSense 및 Kakao AdFit 광고가 표시될 수 있습니다.</li>
          <li>
            외부 링크는 새 탭에서 열리며, 당사는 외부 사이트의 내용에 책임을 지지 않습니다.
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">이 위젯 임베드하기</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          AIWire의 최신 AI 뉴스를 여러분의 블로그나 웹사이트에 무료로 붙일 수 있어요.
          아래 코드를 복사해 원하는 위치에 넣으면 됩니다.
        </p>
        <EmbedSnippet code={EMBED_IFRAME} />
        <p className="mt-3 text-sm text-gray-500">
          미리보기는{' '}
          <Link
            href="/embed/ai-news"
            className="text-blue-600 hover:underline"
          >
            /embed/ai-news
          </Link>
          에서 확인할 수 있어요.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">문의</h2>
        <p className="text-gray-700">
          기사 오류 신고, 협업 제안, 저작권 관련 문의는{' '}
          <Link href="/contact" className="text-blue-600 hover:underline">
            문의 페이지
          </Link>
          를 이용해 주세요.
        </p>
      </section>
    </div>
  );
}
