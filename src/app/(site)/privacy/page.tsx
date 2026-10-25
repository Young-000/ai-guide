import type { Metadata } from 'next';
import { BASE_URL } from '@/lib/site';
import { businessInfo } from '@/lib/business-info';

export const metadata: Metadata = {
  title: '개인정보처리방침 | AIWire',
  description: 'AIWire 개인정보처리방침입니다.',
  alternates: { canonical: `${BASE_URL}/privacy` },
};

export default function PrivacyPage(): JSX.Element {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">개인정보처리방침</h1>
      <p className="mt-2 text-sm text-gray-500">시행일: 2026년 10월 24일</p>

      <p className="mt-6 text-gray-700 leading-relaxed">
        {businessInfo.bizName}(이하 &quot;운영자&quot;)는 {businessInfo.serviceName}(이하
        &quot;사이트&quot;) 이용자의 개인정보를 중요시하며, 「개인정보 보호법」을 준수합니다. 본
        방침은 사이트가 수집하는 개인정보 항목, 이용 목적, 보유 기간, 처리위탁 및 제3자 제공 등을
        안내합니다.
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          1. 수집하는 개인정보 항목 및 수집 방법
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          본 사이트는 회원가입 없이 이용할 수 있습니다. 개인정보는 아래의 경우에 한해 최소한으로
          수집합니다.
        </p>
        <ul className="mt-3 list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>
            뉴스레터 구독: 이용자가 직접 입력하는 <strong>이메일 주소</strong> (구독 신청 시)
          </li>
          <li>
            자동 수집되는 서버 접속 로그: IP 주소, 접속 일시, 브라우저 정보, 방문 페이지
          </li>
          <li>
            이용 기록(분석 도구 Amplitude): 페이지 조회·클릭 등 이용 기록, 브라우저·기기 정보, 임의로
            생성한 기기 식별자. 이 분석 도구로는 IP 주소를 전송하지 않습니다.
          </li>
          <li>쿠키 및 유사 기술: 광고 및 서비스 개선 목적</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          2. 개인정보의 수집 및 이용 목적
        </h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>뉴스레터 발송 등 이용자가 신청한 서비스 제공</li>
          <li>서비스 운영 및 품질 개선</li>
          <li>통계 분석을 통한 콘텐츠 개선</li>
          <li>광고 게재 (Google AdSense, Kakao AdFit)</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          3. 개인정보의 보유 및 이용 기간
        </h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>
            뉴스레터 구독 이메일: 구독 해지 요청 시 또는 서비스 종료 시까지 보관 후 지체 없이
            파기합니다.
          </li>
          <li>자동 수집 서버 로그: 수집일로부터 최대 6개월간 보관 후 삭제합니다.</li>
          <li>
            유입 경로 정보(aiwire_ft): 이용자의 브라우저에만 저장되며 30일 후 만료됩니다. 우리
            서버에는 보관하지 않고, 아웃링크 클릭 같은 이벤트에 함께 실려 분석 도구(Amplitude)로
            전송됩니다.
          </li>
        </ul>
        <p className="mt-3 text-sm text-gray-700 leading-relaxed">
          법령에 특별한 규정이 있는 경우 해당 기간 동안 보관합니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          4. 개인정보 처리의 위탁
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          운영자는 서비스 제공을 위해 아래와 같이 개인정보 처리 업무를 외부 사업자에게 위탁하고
          있습니다.
        </p>
        <ul className="space-y-3 text-sm text-gray-700">
          <li>
            <p className="font-semibold text-gray-900">Vercel Inc.</p>
            <p className="mt-1">위탁 업무: 웹사이트 호스팅 및 서버 인프라 운영</p>
          </li>
          <li>
            <p className="font-semibold text-gray-900">Supabase, Inc.</p>
            <p className="mt-1">위탁 업무: 뉴스레터 구독 이메일의 저장 및 관리</p>
          </li>
          <li>
            <p className="font-semibold text-gray-900">Amplitude, Inc.</p>
            <p className="mt-1">
              위탁 업무: 서비스 이용 행태 분석 — 페이지 조회·클릭 등 이용 기록, 브라우저·기기 정보,
              광고 유입 정보(UTM 값, 광고 클릭 식별자, 유입 사이트 주소의 도메인과 경로 — 검색어 등
              쿼리와 해시는 제외)를 수집·분석합니다. IP 주소는 전송하지 않도록 설정했습니다.
              이용자의 이름·이메일 등 직접 식별 정보와 결합하지 않습니다.
            </p>
            <p className="mt-1">
              국외 이전: 이전받는 자 Amplitude, Inc. / 이전 국가 미국(미국에 있는 Amplitude 서버) /
              이전 항목 위 이용 기록·기기 정보·임의 기기 식별자·광고 유입 정보(IP 주소 제외) / 이전 시기 및 방법 이용자가 서비스를
              이용하는 시점에 인터넷을 통해 전송 / 보유 기간 분석 도구의 보관 정책에 따라 기간이
              지나면 삭제되며, 이용자가 처리정지·삭제를 요청하면 지체 없이 처리합니다.
            </p>
            <p className="mt-1">
              이전받는 자의 연락처: privacy@amplitude.com / Amplitude, Inc. Attn: Privacy, 201 Third
              Street, Suite 200, San Francisco, CA 94103 (출처: https://amplitude.com/privacy)
            </p>
            <p className="mt-1">
              이전 거부 방법 및 거부 시 영향: 브라우저의 추적 방지·콘텐츠 차단 설정을 켜거나, 쿠키와
              사이트 데이터(Amplitude가 기기 식별자를 저장하는 쿠키·로컬 저장소 localStorage 포함)를
              삭제하거나, 개인정보 보호책임자에게 처리 정지를 요청하여 Amplitude로의 이전을 거부할 수
              있습니다. 거부해도 서비스 이용에는 제한이 없습니다.
            </p>
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">5. 쿠키(Cookie) 사용</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          본 사이트는 이용 편의 향상과 광고 제공을 위해 쿠키를 사용합니다. 쿠키는 브라우저에
          저장되는 소량의 데이터로, 브라우저 설정에서 거부하거나 삭제할 수 있습니다. 단, 쿠키를
          거부하면 일부 서비스 이용이 제한될 수 있습니다.
        </p>
        <p className="mt-3 text-sm text-gray-700 leading-relaxed">
          유입 경로 쿠키(aiwire_ft): 처음 방문했을 때의 유입 정보(UTM 값, 광고 클릭 식별자, 유입
          사이트 주소의 도메인)를 30일 동안 저장합니다. 같은 내용이 브라우저 로컬 저장소에도
          저장되며, 브라우저 설정에서 삭제할 수 있습니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">6. 제3자 광고 및 분석 도구</h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          본 사이트는 아래 제3자 광고·분석 서비스를 이용하며, 각 서비스는 고유한 쿠키를
          설정합니다. 이 쿠키는 해당 회사의 개인정보처리방침에 따라 관리됩니다.
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
          <li>
            <p className="font-semibold text-gray-900">Vercel Analytics</p>
            <p className="mt-1">
              사이트 트래픽 측정을 위해 Vercel Inc.가 익명화된 이용 데이터를 수집할 수 있습니다.
              자세한 내용은{' '}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Vercel 개인정보처리방침
              </a>
              을 참고하세요.
            </p>
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">7. 개인정보의 제3자 제공</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          본 사이트는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 법령에 근거가
          있거나 수사기관의 적법한 요청이 있는 경우에 한해 제공할 수 있으며, 제6조의 제3자 광고·분석
          서비스는 각 회사의 약관에 따라 데이터를 처리합니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">8. 이용자의 권리</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          이용자는 언제든지 수집된 개인정보의 열람, 정정, 삭제, 처리 정지를 요청할 수 있으며,
          뉴스레터 구독은 언제든지 해지할 수 있습니다. 관련 요청은 아래 개인정보 보호책임자
          연락처로 보내주시면 지체 없이 처리합니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">9. 개인정보 보호책임자</h2>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>개인정보 보호책임자: {businessInfo.privacyOfficer}</li>
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
        <p className="mt-3 text-sm text-gray-700">
          개인정보 관련 불만이 있으실 경우 개인정보보호위원회(국번 없이 182) 또는
          한국인터넷진흥원 개인정보침해 신고센터(국번 없이 118)에 신고하실 수 있습니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">10. 방침의 변경</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          본 방침의 내용이 변경될 경우, 변경 사항과 시행일을 명시하여 사이트 내 공지사항 또는 이
          페이지를 통해 안내합니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">부칙</h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>이 방침은 2026년 10월 24일부터 시행합니다. (종전 시행일: 2026년 6월 27일)</li>
          <li>2026-10-24: 유입 경로 기록 쿠키(aiwire_ft, 30일) 추가</li>
          <li>2026-10-24: Amplitude 고지 추가</li>
          <li>2026-10-25: Amplitude 수집 범위 정정 (IP 주소 미전송, 유입 사이트 주소는 도메인·경로까지)</li>
        </ul>
      </section>
    </div>
  );
}
