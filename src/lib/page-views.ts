import { getServiceClient } from './supabase';

/**
 * Returns the current date in KST (Asia/Seoul, UTC+9) as YYYY-MM-DD.
 * Avoids `Intl.DateTimeFormat` to keep the logic testable with jest.spyOn(Date, 'now').
 */
export function getKstDay(): string {
  const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
  const kst = new Date(Date.now() + KST_OFFSET_MS);
  return kst.toISOString().slice(0, 10);
}

/**
 * Increments the daily page-view counter for `path` in `search_trends.page_views`.
 * Uses the `upsert_page_view` Postgres function (ON CONFLICT DO UPDATE count+1).
 * Silently logs on error — never throws, so the page render is never blocked.
 */
export async function recordView(path: string): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase.rpc('upsert_page_view', {
    p_path: path,
    p_day: getKstDay(),
  });
  if (error) {
    console.error('[page-views] recordView failed:', path, error.message);
  }
}
