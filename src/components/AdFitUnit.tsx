'use client';

import { useEffect, useRef } from 'react';

const ADFIT_SCRIPT_SRC = '//t1.kakaocdn.net/kas/static/ba.min.js';

/**
 * Kakao AdFit slots. Each maps to a NEXT_PUBLIC_ADFIT_UNIT_* env var and its
 * fixed creative size:
 *  - rect: 300x250 in-content (PC/mobile)
 *  - sky : 160x600 desktop sidebar
 * Renders nothing when the matching env var is unset, so it is harmless to drop
 * into pages before approval / before the env is configured.
 */
const SLOT_PRESETS = {
  rect: { unit: process.env.NEXT_PUBLIC_ADFIT_UNIT_RECT, width: 300, height: 250 },
  sky: { unit: process.env.NEXT_PUBLIC_ADFIT_UNIT_SKY, width: 160, height: 600 },
} as const;

type AdFitSlot = keyof typeof SLOT_PRESETS;

interface AdFitUnitProps {
  slot?: AdFitSlot;
  /** Override the env-provided unit id (mainly for testing). */
  unit?: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function AdFitUnit({
  slot = 'rect',
  unit,
  width,
  height,
  className = '',
}: AdFitUnitProps): JSX.Element | null {
  const preset = SLOT_PRESETS[slot];
  const unitId = unit ?? preset.unit;
  const adWidth = width ?? preset.width;
  const adHeight = height ?? preset.height;

  const containerRef = useRef<HTMLDivElement>(null);

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
        data-ad-width={String(adWidth)}
        data-ad-height={String(adHeight)}
      />
    </div>
  );
}
