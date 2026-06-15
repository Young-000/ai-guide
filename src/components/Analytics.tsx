'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initAmplitude, track } from '@/lib/analytics';

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

  // Track each SPA route change
  useEffect(() => {
    void track('page_view', { path: pathname });
  }, [pathname]);

  return null;
}
