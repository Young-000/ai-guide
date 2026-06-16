import type { Metadata } from 'next';
import { BASE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: '문의 | AIWire',
  description: 'AIWire에 기사 오류 신고, 협업 제안, 저작권 문의를 보내주세요.',
  alternates: { canonical: `${BASE_URL}/contact` },
};

export default function ContactPage(): JSX.Element {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">문의</h1>

      <p className="mt-6 text-gray-700 leading-relaxed">
        AIWire에 대한 의견이나 문의 사항은 아래 이메일로 보내주세요. 영업일 기준 2~3일 이내에
        답변 드리겠습니다.
      </p>

      <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
        <h2 className="text-base font-semibold text-gray-900 mb-2">문의 이메일</h2>
        <a
          href="mailto:wkddudwoek@gmail.com"
          className="text-blue-600 text-lg font-medium hover:underline"
        >
          wkddudwoek@gmail.com
        </a>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">문의 유형</h2>
        <dl className="space-y-4 text-sm text-gray-700">
          <div className="flex gap-4">
            <dt className="font-semibold text-gray-900 w-28 flex-shrink-0">기사 오류 신고</dt>
            <dd>
              기사 내용 중 사실 오류나 오해를 유발하는 표현이 있으면 알려주세요. 검토 후
              정정하겠습니다.
            </dd>
          </div>
          <div className="flex gap-4">
            <dt className="font-semibold text-gray-900 w-28 flex-shrink-0">저작권 문의</dt>
            <dd>콘텐츠 저작권 관련 문의를 보내주시면 즉시 검토합니다.</dd>
          </div>
          <div className="flex gap-4">
            <dt className="font-semibold text-gray-900 w-28 flex-shrink-0">협업·제휴</dt>
            <dd>콘텐츠 협업, 뉴스레터 파트너십 등 제안을 환영합니다.</dd>
          </div>
          <div className="flex gap-4">
            <dt className="font-semibold text-gray-900 w-28 flex-shrink-0">광고 문의</dt>
            <dd>광고 게재 및 스폰서십 관련 문의도 같은 이메일로 보내주세요.</dd>
          </div>
        </dl>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">개인정보 문의</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          개인정보 열람·정정·삭제·처리 정지 요청은 동일한 이메일로 보내주세요. 자세한 내용은{' '}
          <a href="/privacy" className="text-blue-600 hover:underline">
            개인정보처리방침
          </a>
          을 참고하세요.
        </p>
      </section>
    </div>
  );
}
