'use client';

import { useEffect } from 'react';

type PageViewTrackerProps = {
  path: string;
};

/**
 * Fires a server-side page-view count increment once per mount.
 * Posts to /api/record-view → search_trends.page_views via Supabase service_role.
 * Renders nothing — purely a side-effect component.
 */
export default function PageViewTracker({ path }: PageViewTrackerProps): null {
  useEffect(() => {
    void fetch('/api/record-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    }).catch((err: unknown) => {
      console.error('[PageViewTracker]', err);
    });
  }, [path]);

  return null;
}
