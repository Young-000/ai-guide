import { render, screen } from '@testing-library/react';
import { StaplePrices } from '@/components/StaplePrices';

describe('StaplePrices — links to hottrend comparison pages', () => {
  it('asks the shopper question instead of claiming live keywords', () => {
    render(<StaplePrices placement="home" />);
    expect(screen.getByRole('heading', { name: '생필품, 오늘 제일 싼 건?' })).toBeInTheDocument();
    expect(screen.queryByText(/실시간/)).not.toBeInTheDocument();
  });

  it('links every chip to its /pick page with aiwire attribution', () => {
    render(<StaplePrices placement="home" />);
    const link = screen.getByRole('link', { name: /생수/ });
    expect(link).toHaveAttribute(
      'href',
      'https://hottrend.news/pick/water?utm_source=aiwire&utm_medium=widget_home',
    );
  });

  it('never links to the retired /keyword/ path', () => {
    render(<StaplePrices placement="home" />);
    for (const link of screen.getAllByRole('link')) {
      expect(link.getAttribute('href')).not.toContain('/keyword/');
      expect(link.getAttribute('href')).toContain('utm_source=aiwire');
    }
  });
});

describe('StaplePrices — placement and new-tab hint', () => {
  it('tags clicks from /news separately from home', () => {
    render(<StaplePrices placement="news" />);
    expect(screen.getByRole('link', { name: /생수/ }).getAttribute('href')).toContain(
      'utm_medium=widget_news',
    );
  });

  it('tells the user each chip opens hottrend.news in a new tab', () => {
    render(<StaplePrices placement="home" />);
    expect(screen.getByRole('link', { name: '생수 (hottrend.news, 새 창)' })).toBeInTheDocument();
  });
});
