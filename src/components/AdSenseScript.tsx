'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { shouldLoadAds } from '@/lib/ad-eligibility';

const ADSENSE_SRC = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1379707580934572';

/**
 * AdSense 스크립트 — 사람에게만 내려보낸다.
 *
 * 🔴 왜 (2026-09-26).
 *
 * 이 사이트의 하루 6,000 페이지뷰는 대부분 크롤러다(상위 6개 경로가 전부 목록
 * 페이지). 그런데 광고 스크립트는 방문자를 가리지 않고 로드돼, **하루 수천 건의
 * 봇 광고 요청**이 구글로 나가고 있었다. AdSense 는 9/12부터 심사 중인데
 * 무효 트래픽이 쌓이는 것은 통과에 불리하다.
 *
 * `docs/PENDING-OWNER-ACTIONS.md` 에 5주 이월돼 있던 "UA 봇 필터"가 이것이다.
 *
 * **서버가 아니라 클라이언트에서 가른다.** 서버에서 `headers()` 로 UA 를 읽으면
 * 정적 렌더가 동적으로 바뀌어 4,939개 페이지가 전부 함수 호출이 된다 — 비용이
 * 폭증하고, 이 프로젝트에는 이미 `force-dynamic` 으로 사이트를 죽인 이력이 있다.
 *
 * 판정은 계측과 같은 봇 목록을 쓰되 **구글의 광고 크롤러는 예외**로 둔다
 * (`shouldLoadAds`). Mediapartners-Google 은 광고를 매칭하려고 페이지를 읽는 쪽이라
 * 막으면 광고 품질이 떨어진다 — 계측용 판정을 그대로 쓰면 안 되는 자리다.
 */
export default function AdSenseScript(): JSX.Element | null {
  /*
    첫 렌더에서는 넣지 않는다. 서버가 만든 HTML 과 클라이언트의 첫 렌더가 달라지면
    hydration 이 깨진다 — navigator 는 서버에 없다.
  */
  const [isHuman, setIsHuman] = useState(false);

  useEffect(() => {
    setIsHuman(shouldLoadAds(navigator.userAgent));
  }, []);

  if (!isHuman) return null;

  return <Script async src={ADSENSE_SRC} crossOrigin="anonymous" strategy="afterInteractive" />;
}
