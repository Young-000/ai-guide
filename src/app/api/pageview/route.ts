import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const MAX_PATH_LENGTH = 500;

/** KST(UTC+9) 기준 오늘 날짜 'YYYY-MM-DD' */
function getTodayKst(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

function isValidNewsPath(path: unknown): path is string {
  return (
    typeof path === 'string' &&
    path.startsWith('/news/') &&
    path.length <= MAX_PATH_LENGTH
  );
}

/**
 * POST /api/pageview
 * Body: { path: string }  — /news/ 로 시작하는 경로만 허용
 *
 * search_trends.page_views 테이블에 (path, day) 기준 일자 카운트를 원자적으로 upsert.
 * 실패해도 페이지를 깨뜨리면 안 되므로 클라이언트는 fire-and-forget으로 호출한다.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let path: unknown;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    path = body.path;
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  if (!isValidNewsPath(path)) {
    return NextResponse.json({ error: 'invalid_path' }, { status: 400 });
  }

  // query string·trailing slash 제거
  const normalized = path.split('?')[0].replace(/\/+$/, '');
  const day = getTodayKst();

  try {
    const supabase = getServiceClient();
    const { error } = await supabase.rpc('upsert_page_view', {
      p_path: normalized,
      p_day: day,
    });

    if (error) {
      console.error('[pageview] Supabase error:', error.message);
      return NextResponse.json({ error: 'db_error' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[pageview] Unexpected error:', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
