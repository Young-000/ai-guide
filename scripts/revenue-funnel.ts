#!/usr/bin/env tsx
/** aiwire-only leading indicators. Usage: npm run funnel -- --days 7 */
import { createClient } from '@supabase/supabase-js';
import { completedKstWindow, FUNNEL_SITE, readFunnelRows, summarizeFunnel, type FunnelRow, type FunnelWindow } from './revenue-funnel-report';

function requestedDays(): number {
  const index = process.argv.indexOf('--days');
  return index < 0 ? 7 : Number(process.argv[index + 1]);
}

function printCompleteMetrics(humans: number, outclicks: number, days: number): void {
  console.log(`Daily average recorded human visits: ${Math.round(humans / days)}`);
  // Preserve metrics-snapshot.py's existing machine-readable protocol, only for complete windows.
  console.log(`합계 ${days}일: 사람 ${humans}명 · 아웃클릭 ${outclicks}회`);
  console.log(`하루 평균 사람 ${Math.round(humans / days)}명`);
}

function printReport(rows: FunnelRow[], window: FunnelWindow): void {
  const summary = summarizeFunnel(rows, window);
  console.log(`Scope: site=${FUNNEL_SITE}; KST completed days [${window.since}, ${window.until})`);
  console.log('SOURCE: search_trends.v_revenue_funnel; existing bot-filtered visit counts, not verified unique people.');
  console.log('day         site      humans    bots  outclicks  click_rate_pct');
  for (const row of summary.rows) {
    console.log(`${row.day}  ${row.site}  ${row.humans}  ${row.bots}  ${row.outclicks}  ${row.click_rate_pct ?? 'unknown'}`);
  }
  if (summary.missingDays > 0) {
    console.log(`Incomplete measurement: ${summary.observedDays}/${window.days} days present; missing days are not zeros. Average withheld.`);
  } else {
    printCompleteMetrics(summary.humans, summary.outclicks, window.days);
  }
  console.log(`Recorded totals (${window.days} completed KST days): humans=${summary.humans}; outclicks=${summary.outclicks}`);
  console.log('Outclicks are leading signals, not confirmed earnings. Zero stored outclicks does not prove delivery or revenue conversion.');
}

async function main(): Promise<void> {
  const window = completedKstWindow(requestedDays());
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are required');
  const supabase = createClient(url, key, { db: { schema: 'search_trends' } });
  const rows = await readFunnelRows(async (from, to) => {
    const { data, error } = await supabase.from('v_revenue_funnel').select('*')
      .eq('site', FUNNEL_SITE).gte('day', window.since).lt('day', window.until)
      .order('day').order('site').range(from, to);
    if (error) throw new Error(`Funnel query failed: ${error.message}`);
    return (data ?? []) as FunnelRow[];
  });
  printReport(rows, window);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
