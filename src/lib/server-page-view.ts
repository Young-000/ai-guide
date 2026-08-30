import { createClient } from '@supabase/supabase-js';

const MAX_PATH_LENGTH = 500;

/** KST(UTC+9) 기준 오늘 날짜 'YYYY-MM-DD' */
function getTodayKst(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

/**
 * 서버사이드에서 추적할 경로인지 확인.
 * /news/ 로 시작하는 서브페이지(상세·섹션·토픽)만 대상.
 * /news (인덱스)는 Next.js가 trailing slash를 제거하므로 startsWith('/news/')에 걸리지 않는다.
 */
export function isTrackablePath(pathname: string): boolean {
  return (
    typeof pathname === 'string' &&
    pathname.startsWith('/news/') &&
    pathname.length <= MAX_PATH_LENGTH
  );
}

/**
 * 서버사이드(미들웨어)에서 경로별 일자 방문 카운트를
 * search_trends.page_views 에 원자적으로 upsert.
 *
 * - SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 없으면 no-op (로컬·테스트 안전).
 * - 추적 불가 경로면 no-op.
 * - 실패는 조용히 삼킨다 — 추적이 요청 처리를 깨뜨리면 안 된다.
 */
export async function trackServerPageView(pathname: string): Promise<void> {
  if (!isTrackablePath(pathname)) return;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;

  // query string·trailing slash 제거 (API route의 normalisation과 동일)
  const normalized = pathname.split('?')[0].replace(/\/+$/, '');
  const day = getTodayKst();

  try {
    const supabase = createClient(url, key, {
      db: { schema: 'search_trends' },
      auth: { persistSession: false },
    });
    await supabase.rpc('upsert_page_view', {
      p_path: normalized,
      p_day: day,
    });
  } catch {
    // silent — analytics must not break page serving
  }
}
