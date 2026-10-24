import { fireEvent, render, screen } from '@testing-library/react';
import OutclickLink from '../OutclickLink';
import OutboundToolLink from '../OutboundToolLink';
import { captureFirstTouch } from '@/lib/first-touch';

const track = jest.fn();
jest.mock('@/lib/analytics', () => ({
  track: (...args: unknown[]) => track(...args),
  trackToolClick: jest.fn(),
}));

describe('aiwire 아웃클릭 — 첫 접점 (2026-10-24)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.cookie = 'aiwire_ft=; Max-Age=0; Path=/';
    track.mockClear();
    Object.defineProperty(navigator, 'sendBeacon', { value: jest.fn(), configurable: true });
    window.history.pushState({}, '', '/?utm_source=google&utm_medium=display&utm_campaign=aiwire_a&gclid=g1');
    captureFirstTouch(); // 랜딩 (Analytics 가 마운트 때 하는 일)
    window.history.pushState({}, '', '/news/some-article');
  });

  const FIRST_TOUCH = {
    ft_utm_source: 'google',
    ft_utm_medium: 'display',
    ft_utm_campaign: 'aiwire_a',
    ft_gclid: 'g1',
  };

  it('쿠팡 배너 클릭(affiliate_outclick)에 네트워크·배치와 첫 접점을 싣는다', () => {
    render(
      <OutclickLink href="https://link.coupang.com/a/x" network="coupang" placement="aiwire-article">
        배너
      </OutclickLink>,
    );

    fireEvent.click(screen.getByRole('link', { name: '배너' }));

    expect(track).toHaveBeenCalledWith('affiliate_outclick', {
      network: 'coupang',
      placement: 'aiwire-article',
      ...FIRST_TOUCH,
    });
  });

  it('도구 아웃링크 클릭(tool_outbound_click)에 첫 접점을 싣는다', () => {
    render(
      <OutboundToolLink href="https://tool.example" toolName="cursor" sourcePage="news" isAffiliate>
        열기
      </OutboundToolLink>,
    );

    fireEvent.click(screen.getByRole('link', { name: /cursor/ }));

    expect(track).toHaveBeenCalledWith('tool_outbound_click', {
      slug: 'cursor',
      isAffiliate: true,
      ...FIRST_TOUCH,
    });
  });

  it('기록이 던져도 이동은 막히지 않는다', () => {
    track.mockImplementation(() => {
      throw new Error('down');
    });
    render(
      <OutclickLink href="https://link.coupang.com/a/x" network="coupang" placement="aiwire-article">
        배너
      </OutclickLink>,
    );

    expect(() => fireEvent.click(screen.getByRole('link', { name: '배너' }))).not.toThrow();
    track.mockReset();
  });
});
