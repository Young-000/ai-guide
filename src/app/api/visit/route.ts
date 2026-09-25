import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { isBotUserAgent } from '@/lib/bot-detect';

/**
 * 유입원 1건 기록.
 *
 * 🔴 왜 (2026-09-26): 이 사이트는 하루 6,000 페이지뷰를 받는데 **사람이 어디서 오는지
 * 모른다.** page_views 는 경로만 세고 유입원을 세지 않았다. 어디서 오는지 모르면
 * 무엇을 키울지 정할 수 없다 — trend-radar 는 같은 계측으로 "쇼츠 설명 링크가 한 번도
 * 눌리지 않았다"를 알아냈고, 그 덕에 그 채널에 3주를 더 쓰지 않았다.
 *
 * 세 사이트(hottrend.news · aiwire.news · mystica.world)가 같은 표를 쓴다. 사이트마다
 * 따로 만들면 "어디에 힘을 쏟을지"를 나란히 비교할 수 없다 — 실제로 그래서 이 사이트가
 * 트래픽 260배인 것을 3주 동안 몰랐다.
 */
export const dynamic = 'force-dynamic';
export const fetchCache = 'default-cache';

const SITE = 'aiwire';
/** 유입원 문자열을 그대로 믿지 않는다 — URL로 들어오는 값이다. */
const TOKEN_RE = /^[a-zA-Z0-9_\-.]{1,40}$/;

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json().catch(() => ({}))) as { source?: unknown; medium?: unknown };
  const rawSource = typeof body.source === 'string' ? body.source : '';
  const rawMedium = typeof body.medium === 'string' ? body.medium : '';

  const source = TOKEN_RE.test(rawSource) ? rawSource : 'direct';
  const medium = TOKEN_RE.test(rawMedium) ? rawMedium : 'unknown';
  /*
    봇도 센다. 거르기만 하면 "조용한 것"과 "죽은 것"을 못 가른다 — 크롤러 양은
    색인 건강도 신호이기도 하다. 판단은 is_bot=false 행으로만 한다.
  */
  const isBot = isBotUserAgent(request.headers.get('user-agent'));

  try {
    await getServiceClient().rpc('record_site_visit', {
      p_site: SITE,
      p_source: source,
      p_medium: medium,
      p_is_bot: isBot,
    });
  } catch {
    // 계측이 페이지를 깨뜨리면 안 된다.
  }

  return NextResponse.json({ ok: true });
}
