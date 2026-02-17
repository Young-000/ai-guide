'use client';

import { useEffect, useRef } from 'react';

type AdFormat = 'auto' | 'rectangle' | 'horizontal' | 'vertical';

const MIN_HEIGHT_MAP: Record<AdFormat, number> = {
  auto: 100,
  rectangle: 250,
  horizontal: 90,
  vertical: 600,
};

interface AdUnitProps {
  slot: string;
  format?: AdFormat;
  responsive?: boolean;
  className?: string;
  dataPage?: string;
}

export default function AdUnit({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
  dataPage,
}: AdUnitProps): JSX.Element | null {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded or blocked
    }
  }, []);

  // Only render ads in production
  if (process.env.NODE_ENV !== 'production') return null;

  return (
    <div className={className} data-page={dataPage}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight: `${MIN_HEIGHT_MAP[format]}px` }}
        data-ad-client="ca-pub-1379707580934572"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
