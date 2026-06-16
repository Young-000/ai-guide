'use client';

import { useEffect, useRef } from 'react';

const ADFIT_SCRIPT_SRC = '//t1.daumcdn.net/kas/static/ba.min.js';

type AdFitDevice = 'pc' | 'mobile';

interface AdFitUnitProps {
  /** 'pc' uses NEXT_PUBLIC_ADFIT_UNIT_PC, 'mobile' uses NEXT_PUBLIC_ADFIT_UNIT_MOBILE */
  device?: AdFitDevice;
  width: number;
  height: number;
  className?: string;
}

function resolveUnitId(device: AdFitDevice): string | undefined {
  if (device === 'mobile') return process.env.NEXT_PUBLIC_ADFIT_UNIT_MOBILE;
  return process.env.NEXT_PUBLIC_ADFIT_UNIT_PC;
}

/**
 * Kakao AdFit display unit. Env-gated: renders nothing until the relevant
 * unit id env var is set, so it is harmless to place ahead of approval.
 */
export default function AdFitUnit({
  device = 'pc',
  width,
  height,
  className = '',
}: AdFitUnitProps): JSX.Element | null {
  const containerRef = useRef<HTMLDivElement>(null);
  const unitId = resolveUnitId(device);

  useEffect(() => {
    if (!unitId || !containerRef.current) return;
    // Load the AdFit loader script once; it scans for `.kakao_ad_area` on load.
    if (!document.querySelector(`script[src="${ADFIT_SCRIPT_SRC}"]`)) {
      const script = document.createElement('script');
      script.src = ADFIT_SCRIPT_SRC;
      script.async = true;
      containerRef.current.appendChild(script);
    }
  }, [unitId]);

  if (!unitId) return null;

  return (
    <div ref={containerRef} className={className}>
      <ins
        className="kakao_ad_area"
        style={{ display: 'none' }}
        data-ad-unit={unitId}
        data-ad-width={String(width)}
        data-ad-height={String(height)}
      />
    </div>
  );
}
