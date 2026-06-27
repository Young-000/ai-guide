import { render, screen } from '@testing-library/react';
import TermsPage, { metadata } from '@/app/(site)/terms/page';
import { businessInfo } from '@/lib/business-info';

describe('TermsPage', () => {
  it('renders the page heading', () => {
    render(<TermsPage />);
    expect(screen.getByRole('heading', { level: 1, name: '이용약관' })).toBeInTheDocument();
  });

  it('exposes the operator business name and contact from businessInfo', () => {
    render(<TermsPage />);
    expect(
      screen.getAllByText(new RegExp(businessInfo.bizName.replace(/[()]/g, '\\$&'))).length
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole('link', { name: businessInfo.email })
    ).toHaveAttribute('href', `mailto:${businessInfo.email}`);
  });

  it('covers the required legal clauses', () => {
    render(<TermsPage />);
    expect(screen.getByRole('heading', { name: /광고/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /저작권/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /면책/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /준거법/ })).toBeInTheDocument();
  });

  it('states the effective date', () => {
    render(<TermsPage />);
    expect(screen.getAllByText(/2026년 6월 27일/).length).toBeGreaterThan(0);
  });

  it('provides page metadata', () => {
    expect(metadata.title).toContain('이용약관');
  });
});
