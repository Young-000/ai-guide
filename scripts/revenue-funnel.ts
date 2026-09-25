#!/usr/bin/env tsx
/**
 * 수익 선행지표 한 장.
 *
 *   npm run funnel            # 최근 7일
 *   npm run funnel -- --days 30
 *
 * 🔴 왜 (2026-09-26): 목표는 "DAU당 일간 수익 1원"인데, 그 분모인 **사람 수**를
 * 아무도 모르고 있었다. 하루 6,000 페이지뷰가 찍히지만 상위 경로가 전부 목록
 * 페이지라 대부분 크롤러였고, 광고가 채워지지 않는 이유도 그것이다 —
 * **광고주는 사람에게 입찰한다.**
 *
 * 사람 수·아웃클릭·클릭률이 흩어져 있으면 같은 조사를 매번 반복하게 된다.
 */
import { createClient } from '@supabase/supabase-js';

type Row = {
  day: string;
  site: string;
  humans: number;
  bots: number;
  outclicks: number;
  click_rate_pct: number | null;
};

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main(): Promise<void> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 필요합니다.');
    process.exit(2);
  }

  const days = Number(arg('days') ?? '7') || 7;
  const since = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);

  const supabase = createClient(url, key, { db: { schema: 'search_trends' } });
  const { data, error } = await supabase
    .from('v_revenue_funnel')
    .select('*')
    .gte('day', since)
    .order('day', { ascending: false });

  if (error) {
    console.error(`조회 실패: ${error.message}`);
    process.exit(1);
  }

  const rows = (data ?? []) as Row[];
  if (rows.length === 0) {
    /* "0"과 "아직 안 쌓임"은 다르다 — 계측은 2026-09-26 배포분부터 쌓인다. */
    console.log('아직 기록이 없습니다. 계측은 2026-09-26 배포분부터 쌓입니다.');
    return;
  }

  console.log(`${'날짜'.padEnd(12)}${'사이트'.padEnd(10)}${'사람'.padStart(7)}${'봇'.padStart(8)}${'아웃클릭'.padStart(9)}${'클릭률'.padStart(8)}`);
  for (const row of rows) {
    const rate = row.click_rate_pct === null ? '—' : `${row.click_rate_pct}%`;
    console.log(
      `${row.day.padEnd(12)}${row.site.padEnd(10)}${String(row.humans).padStart(7)}${String(row.bots).padStart(8)}${String(row.outclicks).padStart(9)}${rate.padStart(8)}`,
    );
  }

  const humans = rows.reduce((sum, r) => sum + r.humans, 0);
  const clicks = rows.reduce((sum, r) => sum + r.outclicks, 0);
  console.log(`\n합계 ${days}일: 사람 ${humans}명 · 아웃클릭 ${clicks}회`);
  /*
    목표는 "DAU당 1원". 분모가 정해져야 목표까지의 거리를 말할 수 있다.
    광고 수익은 여기서 계산하지 않는다 — AdSense·AdFit·쿠팡 실적은 각 콘솔에만 있다.
  */
  /*
    표본이 하루도 안 되면 평균을 말하지 않는다. 계측을 켠 당일에는 몇 건이 잡히든
    그건 우리 확인 방문이고, 그걸 "하루 평균"이라 부르면 다음 판단이 그 위에 쌓인다.
  */
  const MEASUREMENT_STARTED = '2026-09-26';
  const fullDays = rows.filter((row) => row.day > MEASUREMENT_STARTED).length;
  if (fullDays === 0) {
    console.log(`계측은 ${MEASUREMENT_STARTED} 배포분부터입니다 — 온전한 하루가 아직 없어 평균을 내지 않습니다.`);
    return;
  }
  if (humans > 0) {
    const perDay = Math.round(humans / days);
    console.log(`하루 평균 사람 ${perDay}명 → "DAU당 1원" 목표액 = 하루 ${perDay}원`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
