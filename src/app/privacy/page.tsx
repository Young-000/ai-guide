import type { Metadata } from 'next';
import { BASE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: '개인정보처리방침 | AIWire',
  description: 'AIWire 개인정보처리방침입니다.',
  alternates: { canonical: `${BASE_URL}/privacy` },
};

export default function PrivacyPage(): JSX.Element {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">개인정보처리방침</h1>
      <p className="mt-2 text-sm text-gray-500">최종 수정일: 2026년 6월 16일</p>

      <p className="mt-6 text-gray-700 leading-relaxed">
        AIWire(이하 &quot;사이트&quot;)는 이용자의 개인정보를 중요시하며,
        「개인정보 보호법」을 준수합니다. 본 방침은 사이트가 수집하는 정보, 이용 목적,
        제3자 제공 여부 등을 안내합니다.
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          1. 수집하는 개인정보 항목 및 수집 방법
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          본 사이트는 회원가입 없이 이용할 수 있으며, 이용자가 직접 입력하는 개인정보를
          수집하지 않습니다. 다만, 아래와 같이 자동 수집되는 정보가 있습니다.
        </p>
        <ul className="mt-3 list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>서버 접속 로그: IP 주소, 접속 일시, 브라우저 정보, 방문 페이지</li>
          <li>쿠키 및 유사 기술: 광고 및 서비스 개선 목적</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          2. 개인정보의 수집 및 이용 목적
        </h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>서비스 운영 및 품질 개선</li>
          <li>통계 분석을 통한 콘텐츠 개선</li>
          <li>광고 게재 (Google AdSense, Kakao AdFit)</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">3. 쿠키(Cookie) 사용</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          본 사이트는 이용 편의 향상과 광고 제공을 위해 쿠키를 사용합니다. 쿠키는 브라우저에
          저장되는 소량의 데이터로, 브라우저 설정에서 거부하거나 삭제할 수 있습니다. 단, 쿠키를
          거부하면 일부 서비스 이용이 제한될 수 있습니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">4. 제3자 광고 쿠키</h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          본 사이트는 아래 제3자 광고 서비스를 이용하며, 각 서비스는 고유한 쿠키를 설정합니다.
          이 쿠키는 해당 회사의 개인정보처리방침에 따라 관리됩니다.
        </p>
        <ul className="space-y-4 text-sm text-gray-700">
          <li>
            <p className="font-semibold text-gray-900">Google AdSense</p>
            <p className="mt-1">
              맞춤형 광고 제공 목적으로 Google LLC가 쿠키를 사용합니다. 이용자는{' '}
              <a
                href="https://policies.google.com/technologies/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Google 광고 설정
              </a>
              에서 맞춤 광고를 거부할 수 있습니다.
            </p>
          </li>
          <li>
            <p className="font-semibold text-gray-900">Kakao AdFit</p>
            <p className="mt-1">
              관련성 높은 광고를 제공하기 위해 Kakao Corp.가 쿠키를 사용합니다. 자세한 내용은{' '}
              <a
                href="https://policy.kakao.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                카카오 개인정보처리방침
              </a>
              을 참고하세요.
            </p>
          </li>
          <li>
            <p className="font-semibold text-gray-900">Google Analytics 4</p>
            <p className="mt-1">
              사이트 이용 통계 분석 목적으로 Google LLC가 데이터를 수집합니다. 자세한 내용은{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Google 개인정보처리방침
              </a>
              을 참고하세요.
            </p>
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          5. 개인정보의 보유 및 이용 기간
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          자동 수집 서버 로그는 최대 6개월간 보관 후 삭제합니다. 법령에 특별한 규정이 있는
          경우 해당 기간 동안 보관합니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          6. 개인정보의 제3자 제공
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          본 사이트는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 단, 제4조의
          제3자 광고 쿠키 서비스는 각 회사의 약관에 따라 데이터를 처리합니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">7. 이용자의 권리</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          이용자는 언제든지 수집된 개인정보의 열람, 정정, 삭제, 처리 정지를 요청할 수 있습니다.
          관련 문의는 아래 연락처로 보내주세요.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">8. 개인정보 보호책임자</h2>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>담당: AIWire 운영팀</li>
          <li>
            이메일:{' '}
            <a
              href="mailto:wkddudwoek@gmail.com"
              className="text-blue-600 hover:underline"
            >
              wkddudwoek@gmail.com
            </a>
          </li>
        </ul>
        <p className="mt-3 text-sm text-gray-700">
          개인정보 관련 불만이 있으실 경우 개인정보보호위원회(국번 없이 182) 또는
          한국인터넷진흥원 개인정보침해 신고센터(국번 없이 118)에 신고하실 수 있습니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">9. 방침의 변경</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          본 방침의 내용이 변경될 경우, 변경 사항을 사이트 내 공지사항 또는 이 페이지를 통해
          안내합니다.
        </p>
      </section>
    </div>
  );
}
