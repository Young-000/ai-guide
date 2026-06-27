import type { Metadata } from 'next';
import Link from 'next/link';
import { BASE_URL } from '@/lib/site';
import { businessInfo } from '@/lib/business-info';

const EFFECTIVE_DATE = '2026년 6월 27일';

export const metadata: Metadata = {
  title: '이용약관 | AIWire',
  description: 'AIWire 서비스 이용약관입니다.',
  alternates: { canonical: `${BASE_URL}/terms` },
};

export default function TermsPage(): JSX.Element {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">이용약관</h1>
      <p className="mt-2 text-sm text-gray-500">시행일: {EFFECTIVE_DATE}</p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">제1조 (목적)</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          본 약관은 {businessInfo.bizName}(이하 &quot;운영자&quot;)가 제공하는{' '}
          {businessInfo.serviceName}(이하 &quot;서비스&quot;)의 이용과 관련하여 운영자와 이용자
          간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정하는 것을 목적으로 합니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">제2조 (정의)</h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>
            &quot;서비스&quot;란 운영자가 인공지능(AI)·대형 언어 모델(LLM) 관련 뉴스, 가이드,
            용어 사전 등의 콘텐츠를 제공하는 웹사이트 및 부수 서비스를 말합니다.
          </li>
          <li>
            &quot;이용자&quot;란 본 약관에 따라 서비스에 접속하여 서비스를 이용하는 모든 방문자를
            말합니다.
          </li>
          <li>
            &quot;게시물&quot;이란 서비스에 게재된 기사, 이미지, 영상, 링크 등 일체의 콘텐츠를
            말합니다.
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">제3조 (서비스의 내용)</h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>AI·LLM 분야의 최신 소식을 한국어·영어로 요약·해설하여 제공합니다.</li>
          <li>AI 도구 활용 가이드, 비교, 용어 사전, 퀴즈 등 정보성 콘텐츠를 제공합니다.</li>
          <li>이메일 뉴스레터 구독 신청을 받아 정기 소식을 발송합니다.</li>
        </ul>
        <p className="mt-3 text-sm text-gray-700 leading-relaxed">
          서비스는 회원가입 없이 누구나 무료로 이용할 수 있으며, 운영자는 서비스의 내용을
          운영상·기술상 필요에 따라 변경할 수 있습니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">제4조 (이용자의 의무)</h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-2">
          이용자는 서비스 이용 시 다음 행위를 하여서는 안 됩니다.
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>게시물을 운영자의 사전 동의 없이 무단으로 복제·배포·상업적으로 이용하는 행위</li>
          <li>서비스의 정상적인 운영을 방해하는 행위(과도한 자동 수집, 해킹 등)</li>
          <li>관련 법령 및 본 약관에서 금지하는 행위</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          제5조 (게시물 및 저작권)
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          서비스에 게재된 게시물에 대한 저작권 및 기타 지식재산권은 운영자 또는 정당한 권리자에게
          귀속됩니다. 이용자는 운영자의 사전 서면 동의 없이 게시물을 복제, 전송, 출판, 배포,
          방송하거나 기타 방법으로 무단 이용할 수 없습니다. 인용 시에는 출처를 명확히 표기해야
          합니다. 외부 출처를 인용한 경우 해당 저작권은 원저작자에게 있습니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          제6조 (광고 및 제휴 고지)
        </h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>
            서비스에는 Google AdSense, Kakao AdFit 등 제3자 광고가 게재될 수 있습니다.
          </li>
          <li>
            서비스는 제휴 마케팅(affiliate) 링크를 포함할 수 있으며, 이용자가 해당 링크를 통해
            상품·서비스를 이용하는 경우 운영자가 일정 수수료를 받을 수 있습니다.
          </li>
          <li>
            광고 및 제휴 링크의 게재가 해당 상품·서비스에 대한 운영자의 보증을 의미하지는
            않습니다.
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">제7조 (면책)</h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>
            운영자는 게시물에 담긴 정보의 정확성·완전성·최신성을 보증하지 않으며, 이를 신뢰하여
            내린 이용자의 판단과 그 결과에 대해 책임을 지지 않습니다.
          </li>
          <li>
            일부 게시물은 AI 도구의 보조를 받아 작성되며 편집자의 검수를 거칩니다. 그럼에도
            오류가 있을 수 있으므로 중요한 의사결정 시에는 원문 출처를 직접 확인하시기 바랍니다.
          </li>
          <li>
            서비스 내 외부 링크로 연결되는 제3자 사이트의 내용에 대해 운영자는 책임을 지지
            않습니다.
          </li>
          <li>
            천재지변, 통신 장애 등 운영자의 합리적 통제를 벗어난 사유로 인한 서비스 중단에
            대해서는 책임이 면제됩니다.
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">제8조 (개인정보 보호)</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          운영자는 이용자의 개인정보를 관련 법령에 따라 보호하며, 수집·이용·보관에 관한 구체적인
          사항은 별도의{' '}
          <Link href="/privacy" className="text-blue-600 hover:underline">
            개인정보처리방침
          </Link>
          에서 정합니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">제9조 (약관의 변경)</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          운영자는 관련 법령을 위반하지 않는 범위에서 본 약관을 변경할 수 있습니다. 약관이 변경되는
          경우 변경 내용과 시행일을 명시하여 시행일 이전에 서비스 내 공지사항 또는 본 페이지를
          통해 공지합니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          제10조 (준거법 및 관할)
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          본 약관은 대한민국 법령에 따라 규율되고 해석됩니다. 서비스 이용과 관련하여 운영자와
          이용자 간에 분쟁이 발생한 경우, 관할은 민사소송법에 따른 법원으로 합니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">운영자 정보</h2>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>상호: {businessInfo.bizName}</li>
          <li>대표: {businessInfo.representative}</li>
          <li>사업자등록번호: {businessInfo.bizRegNo}</li>
          <li>주소: {businessInfo.address}</li>
          <li>
            이메일:{' '}
            <a
              href={`mailto:${businessInfo.email}`}
              className="text-blue-600 hover:underline"
            >
              {businessInfo.email}
            </a>
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">부칙</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          본 약관은 {EFFECTIVE_DATE}부터 시행합니다.
        </p>
      </section>
    </div>
  );
}
