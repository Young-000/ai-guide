'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initAmplitude, track } from '@/lib/analytics';
import { classifyReferrer } from '@/lib/referrer';

/**
 * Mounts once in the root layout to:
 *   1. Initialise Amplitude (no-op when API key is absent).
 *   2. Track explicit `page_view` events on SPA route changes via usePathname.
 *
 * Autocapture in the Amplitude SDK already records pageviews, but the explicit
 * event gives us a reliable `path` property for funnel analysis.
 */
export default function Analytics(): null {
  const pathname = usePathname();

  // Init once on mount
  useEffect(() => {
    void initAmplitude();
  }, []);

  /*
    🔴 유입원을 우리 DB 에 센다 — 세션당 1회 (2026-09-26 신설).

    이 사이트는 하루 6,000 페이지뷰를 받으면서도 **사람이 어디서 오는지 몰랐다.**
    page_views 는 경로만 세고 유입원을 세지 않았고, Amplitude 는 조회할 키가 없다.
    어디서 오는지 모르면 무엇을 키울지 정할 수 없다.

    referrer 를 본다 — trend-radar 는 utm_source 만 봐서 구글 검색으로 들어온 사람까지
    전부 'direct' 로 셌고, 그 덩어리가 전체의 88%가 되어 아무것도 읽을 수 없었다.
  */
  useEffect(() => {
    try {
      if (sessionStorage.getItem('visit') === '1') return;
      sessionStorage.setItem('visit', '1');
    } catch {
      return; // 저장을 못 하면 매 이동마다 셀 위험이 있으므로 아예 세지 않는다
    }

    const origin = classifyReferrer(document.referrer, window.location.host, window.location.search);
    if (!origin) return; // 사이트 안에서의 이동은 새 방문이 아니다

    void fetch('/api/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(origin),
      keepalive: true,
    }).catch(() => undefined);
  }, []);

  // Track each SPA route change
  useEffect(() => {
    void track('page_view', { path: pathname });
  }, [pathname]);

  return null;
}
