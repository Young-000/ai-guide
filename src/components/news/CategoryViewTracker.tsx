'use client';

import { useEffect } from 'react';
import { track } from '@/lib/analytics';

type CategoryViewTrackerProps = {
  tag: string;
};

/**
 * Fires a `category_view` Amplitude event once per mount.
 * Renders nothing — purely a side-effect component.
 */
export default function CategoryViewTracker({ tag }: CategoryViewTrackerProps): null {
  useEffect(() => {
    void track('category_view', { tag });
  }, [tag]);

  return null;
}
