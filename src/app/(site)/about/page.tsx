import type { Metadata } from 'next';
import Link from 'next/link';
import { BASE_URL } from '@/lib/site';
import EmbedSnippet from '@/components/EmbedSnippet';

const EMBED_IFRAME = `<iframe src="${BASE_URL}/embed/ai-news" width="100%" height="360" style="border:1px solid #e2e8f0;border-radius:12px;" title="AIWire 최신 AI 뉴스" loading="lazy"></iframe>`;

export const metadata: Metadata = {
  title: '소개 | AIWire',
  description:
    'AIWire는 AI·LLM 분야의 뉴스를 AI가 한국어와 영어로 요약·해설해 자동으로 게재하는 사이트입니다. 사람이 쓰거나 검수하지 않으며, 모든 기사에 출처를 밝힙니다.',
  alternates: { canonical: `${BASE_URL}/about` },
};

export default function AboutPage(): JSX.Element {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">AIWire 소개</h1>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">우리가 하는 일</h2>
        <p className="text-gray-700 leading-relaxed">
          AIWire는 AI·LLM(대형 언어 모델) 분야의 뉴스를 <strong>한국어와 영어</strong>로 요약·해설해
          싣는 사이트입니다. 기사는 AI가 해외 매체의 원문을 읽고 자동으로 작성해 게재하며,{' '}
          <strong>게재 전에 사람이 읽거나 사실을 확인하는 단계는 없습니다.</strong>
        </p>
        <p className="mt-4 text-gray-700 leading-relaxed">
          바쁜 독자가 AI 업계 소식을 빠르게 훑어볼 수 있게 하는 것이 목표입니다. 중요한 판단에는
          기사 아래의 원문 링크를 직접 확인해 주세요.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">작성 원칙</h2>
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
                모든 기사에는 근거로 쓴 원문 링크를 첨부하고, 새로 게재하는 기사는 두 곳 이상을 밝힙니다.
                독자가 직접 원문을 확인할 수 있도록 매체명과 URL을 함께 표기합니다.
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
                원문을 그대로 복사하지 않습니다. AI가 원문에서 확인되는 사실만 골라 자기 문장으로
                요약하고, 인용이 필요한 경우 인용임을 표시합니다.
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
              <p className="font-semibold text-gray-900">AI 작성 고지</p>
              <p className="mt-1 text-sm text-gray-700">
                뉴스 기사는 AI가 작성해 자동으로 게재하며, 사람이 검수하지 않습니다. 대신 게재 전에
                자동 검사를 거칩니다. 형식, 출처 두 곳 이상, 최소 분량을 확인하고 기준에 못 미치면
                게재하지 않습니다. 이 검사는 내용이 사실인지까지 가려내지는 못합니다.
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
              <p className="font-semibold text-gray-900">오류 신고와 정정</p>
              <p className="mt-1 text-sm text-gray-700">
                오류나 오해를 부르는 내용을 알려 주시면 확인한 뒤 기사를 고치거나 내립니다.
                문의 페이지로 알려 주세요.
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
