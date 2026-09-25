import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { isBotUserAgent } from '@/lib/bot-detect';

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
 *
 * 🔴 두 곳에 센다 (2026-09-26).
 *
 * `page_views` 는 봇을 거르지 않는다. 9/25 에 17,960 뷰가 잡혔는데 상위 6개 경로가
 * 전부 목록 페이지였다(`/news/topics` 646, `/news/topic/Anthropic` 222 …) — 사람은
 * 기사를 읽으러 오고 크롤러는 링크가 많은 인덱스를 반복 방문한다. 즉 이 숫자로는
 * 사람이 몇 명인지 알 수 없고, 3주간 그걸 모른 채 다른 사이트에 힘을 쓰고 있었다.
 *
 * 그래서 나눈다:
 *   - `page_views`       총 트래픽. 크롤러 양은 **색인 건강도 신호**라 버리지 않는다.
 *   - `page_views_human` 봇 UA 를 거른 방문. 의사결정은 이 숫자로 한다.
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

    /*
      사람으로 보이면 한 번 더 센다. 이 기록이 실패해도 총 트래픽 집계는 이미 끝났으므로
      500을 주지 않는다 — 계측의 정밀도를 위해 페이지를 깨뜨리지 않는다.
    */
    if (!isBotUserAgent(request.headers.get('user-agent'))) {
      const { error: humanError } = await supabase.rpc('upsert_page_view_human', {
        p_path: normalized,
        p_day: day,
      });
      if (humanError) console.error('[pageview] human count error:', humanError.message);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[pageview] Unexpected error:', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
