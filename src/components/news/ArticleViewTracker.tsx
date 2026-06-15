'use client';

import { useEffect } from 'react';
import { track } from '@/lib/analytics';
import type { NewsLang } from '@/types/news';

type ArticleViewTrackerProps = {
  slug: string;
  lang: NewsLang;
};

/**
 * Fires an `article_view` Amplitude event once per mount.
 * Renders nothing — purely a side-effect component.
 */
export default function ArticleViewTracker({ slug, lang }: ArticleViewTrackerProps): null {
  useEffect(() => {
    void track('article_view', { slug, lang });
  }, [slug, lang]);

  return null;
}
