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
    expect(screen.getByText(/UTM 값, 광고 클릭 식별자/)).toBeInTheDocument();
    expect(screen.getAllByText(/30일/).length).toBeGreaterThanOrEqual(2);
  });
});
