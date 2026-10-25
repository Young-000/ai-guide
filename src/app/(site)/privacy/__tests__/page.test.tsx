import { render, screen } from '@testing-library/react';
import PrivacyPage from '@/app/(site)/privacy/page';
import { businessInfo } from '@/lib/business-info';

describe('PrivacyPage', () => {
  it('renders the page heading', () => {
    render(<PrivacyPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: '개인정보처리방침' })
    ).toBeInTheDocument();
  });

  it('discloses newsletter email collection', () => {
    render(<PrivacyPage />);
    expect(screen.getAllByText(/뉴스레터/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/이메일/).length).toBeGreaterThan(0);
  });

  it('discloses processing consignment / third parties (Vercel, Supabase)', () => {
    render(<PrivacyPage />);
    expect(screen.getAllByText(/Vercel/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Supabase/)).toBeInTheDocument();
  });

  it('names the privacy officer from businessInfo', () => {
    render(<PrivacyPage />);
    expect(
      screen.getAllByText(new RegExp(businessInfo.privacyOfficer)).length
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole('link', { name: businessInfo.email })
    ).toHaveAttribute('href', `mailto:${businessInfo.email}`);
  });

  it('discloses the first-touch cookie (aiwire_ft): name, contents and 30-day retention', () => {
    render(<PrivacyPage />);
    // retention (section 3) + cookie (section 5)
    expect(screen.getAllByText(/aiwire_ft/).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText(/UTM 값, 광고 클릭 식별자/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/30일/).length).toBeGreaterThanOrEqual(2);
  });

  it('pins the effective date to 2026년 10월 24일 and records the previous date and the revision in 부칙', () => {
    const { container } = render(<PrivacyPage />);
    const text = container.textContent ?? '';

    expect(text).toContain('시행일: 2026년 10월 24일');
    expect(text).toContain('종전 시행일: 2026년 6월 27일');
    expect(text).toContain('2026-10-24: 유입 경로 기록 쿠키(aiwire_ft, 30일) 추가');
  });

  it('discloses Amplitude, Inc. in the outsourcing section: purpose, US servers, overseas-transfer notice', () => {
    render(<PrivacyPage />);
    const item = screen.getByText('Amplitude, Inc.').closest('li');
    expect(item).not.toBeNull();
    const text = item?.textContent ?? '';

    expect(text).toContain('서비스 이용 행태 분석');
    expect(text).toContain('이전 국가 미국');
    expect(text).toContain('이전 항목');
    expect(text).toContain('보유 기간');
    expect(text).toContain('UTM 값, 광고 클릭 식별자');
    expect(item?.closest('section')?.textContent).toContain('4. 개인정보 처리의 위탁');
  });

  it('says in the aiwire_ft retention line that the values go to the analytics tool (Amplitude)', () => {
    const { container } = render(<PrivacyPage />);
    const text = container.textContent ?? '';

    expect(text).toContain('아웃링크 클릭 같은 이벤트에 함께 실려 분석 도구(Amplitude)로 전송됩니다');
  });

  it('records the Amplitude notice in the 2026-10-24 부칙', () => {
    const { container } = render(<PrivacyPage />);

    expect(container.textContent).toContain('2026-10-24: Amplitude 고지 추가');
  });

  it('gives the Amplitude recipient contact taken from amplitude.com/privacy', () => {
    render(<PrivacyPage />);
    const text = screen.getByText('Amplitude, Inc.').closest('li')?.textContent ?? '';

    expect(text).toContain('privacy@amplitude.com');
    expect(text).toContain('Amplitude, Inc. Attn: Privacy, 201 Third Street, Suite 200, San Francisco, CA 94103');
    expect(text).toContain('https://amplitude.com/privacy');
  });

  it('says how to refuse the Amplitude transfer and that refusing does not limit the service', () => {
    render(<PrivacyPage />);
    const text = screen.getByText('Amplitude, Inc.').closest('li')?.textContent ?? '';

    expect(text).toContain('추적 방지·콘텐츠 차단 설정');
    expect(text).toContain('쿠키와 사이트 데이터');
    expect(text).toContain('localStorage');
    expect(text).toContain('개인정보 보호책임자에게 처리 정지를 요청');
    expect(text).toContain('거부해도 서비스 이용에는 제한이 없습니다');
  });

  it('states what Amplitude really receives: no IP address, referrer only as domain and path', () => {
    const { container } = render(<PrivacyPage />);
    const item = (screen.getByText('Amplitude, Inc.').closest('li')?.textContent ?? '').replace(/\s+/g, ' ');
    const text = (container.textContent ?? '').replace(/\s+/g, ' ');

    expect(item).toContain('IP 주소는 전송하지 않도록 설정했습니다');
    expect(item).toContain('유입 사이트 주소의 도메인과 경로');
    expect(item).toContain('쿼리와 해시는 제외');
    expect(text).toContain('이 분석 도구로는 IP 주소를 전송하지 않습니다');
    expect(text).toContain('2026-10-25: Amplitude 수집 범위 정정');
  });
});
