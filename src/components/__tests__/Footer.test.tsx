import { render, screen, within } from '@testing-library/react';
import { Footer } from '@/components/Footer';
import { businessInfo } from '@/lib/business-info';

describe('Footer — legal links', () => {
  it('renders the terms-of-service link', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: '이용약관' });
    expect(link).toHaveAttribute('href', '/terms');
  });

  it('renders the privacy-policy link', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: '개인정보처리방침' });
    expect(link).toHaveAttribute('href', '/privacy');
  });
});

describe('Footer — business information block', () => {
  it('renders the populated business fields', () => {
    render(<Footer />);
    const region = screen.getByRole('region', { name: '사업자 정보' });
    expect(within(region).getByText(/팀와이\(TeamY\)/)).toBeInTheDocument();
    expect(within(region).getByText(/장영재/)).toBeInTheDocument();
    expect(within(region).getByText(/874-30-01936/)).toBeInTheDocument();
    expect(within(region).getByText(new RegExp(businessInfo.address.slice(0, 10)))).toBeInTheDocument();
    expect(within(region).getByText(/wkddudwoek@gmail\.com/)).toBeInTheDocument();
  });

  it('does not render empty fields (phone, e-commerce reg no)', () => {
    render(<Footer />);
    const region = screen.getByRole('region', { name: '사업자 정보' });
    expect(within(region).queryByText(/전화/)).not.toBeInTheDocument();
    expect(within(region).queryByText(/통신판매업/)).not.toBeInTheDocument();
  });
});
