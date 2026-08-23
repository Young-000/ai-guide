'use client';

import { useEffect } from 'react';

type PageViewTrackerProps = {
  /** /news/ 로 시작하는 정규화된 경로. 예: /news/some-slug */
  path: string;
};

/**
 * 마운트 시 /api/pageview 에 POST 하여 Supabase search_trends.page_views 에
 * 경로·일자 카운트를 원자적으로 upsert 한다.
 * Fire-and-forget — 측정 실패가 페이지를 깨뜨리면 안 된다.
 * UI를 렌더링하지 않는 순수 사이드이펙트 컴포넌트.
 */
export default function PageViewTracker({ path }: PageViewTrackerProps): null {
  useEffect(() => {
    void fetch('/api/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    }).catch(() => {
      // 측정 실패는 조용히 삼킨다 — 추적이 페이지 경험을 해치면 안 된다
    });
  }, [path]);

  return null;
}
