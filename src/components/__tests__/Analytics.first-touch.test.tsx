import { render } from '@testing-library/react';
import Analytics from '../Analytics';
import { FIRST_TOUCH_STORAGE_KEY } from '@/lib/first-touch';

jest.mock('next/navigation', () => ({ usePathname: () => '/' }));
jest.mock('@/lib/analytics', () => ({
  initAmplitude: () => Promise.resolve(),
  track: jest.fn(() => Promise.resolve()),
}));

describe('Analytics — 랜딩에서 첫 접점을 저장한다', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    // 유입원 집계(/api/visit)는 이 테스트의 관심사가 아니다 — jsdom 에는 fetch 가 없다.
    global.fetch = jest.fn(() => Promise.resolve({ ok: true })) as unknown as typeof fetch;
  });

  it('utm·클릭 ID 를 마운트 직후 저장한다 (Amplitude 키와 무관하게 저장소만 쓴다)', () => {
    window.history.pushState({}, '', '/?utm_source=google&utm_medium=display&gclid=g9');

    render(<Analytics />);

    const stored = JSON.parse(window.localStorage.getItem(FIRST_TOUCH_STORAGE_KEY) ?? 'null');
    expect(stored.touch).toEqual({ utm_source: 'google', utm_medium: 'display', gclid: 'g9' });
  });
});
