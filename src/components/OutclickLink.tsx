'use client';

import type { ReactNode } from 'react';
import { buildOutclickPayload } from '@/lib/outclick';

interface OutclickLinkProps {
  href: string;
  /** 광고망 이름 — 'coupang' 등. */
  network: string;
  /** 배치 이름 — 어느 화면의 어느 자리인지. */
  placement: string;
  className?: string;
  children: ReactNode;
}

/**
 * 광고·제휴 링크. 클릭을 세고 나서 원래대로 이동한다.
 *
 * 🔴 왜 (2026-09-26): 쿠팡 배너는 승인된 유일한 즉시 수익 경로인데 클릭이 몇 번인지
 * 몰랐다. 파트너스 대시보드는 전환만 보여주고, 그 앞단(몇 명이 눌렀나)이 없으면
 * 배치를 고쳐야 할지 배너를 바꿔야 할지 가릴 수 없다.
 *
 * `sendBeacon` 을 쓴다 — 클릭 즉시 페이지를 떠나므로 일반 fetch 는 중간에 끊긴다.
 * 기록에 실패해도 이동은 막지 않는다: 계측 때문에 수익 링크를 잃는 것이 훨씬 나쁘다.
 */
export default function OutclickLink({
  href,
  network,
  placement,
  className,
  children,
}: OutclickLinkProps): JSX.Element {
  const handleClick = (): void => {
    try {
      const payload = buildOutclickPayload(network, placement);
      navigator.sendBeacon?.('/api/visit', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    } catch {
      // 계측 실패가 이동을 막으면 안 된다
    }
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener sponsored"
      // 이게 없으면 referrer 가 쿠팡에 닿지 않아 수수료가 귀속되지 않는다.
      referrerPolicy="unsafe-url"
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
