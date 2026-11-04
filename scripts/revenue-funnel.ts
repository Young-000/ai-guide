#!/usr/bin/env tsx
/** aiwire-only leading indicators. Usage: npm run funnel -- --days 7 */
import { PostgrestClient } from '@supabase/postgrest-js';
import {
  completedKstWindow, formatVisitSourceLines, FUNNEL_SITE, readFunnelRows, summarizeFunnel, summarizeVisitSources,
  type FunnelRow, type FunnelWindow, type VisitSourceRow,
} from './revenue-funnel-report';

function requestedDays(): number {
  const index = process.argv.indexOf('--days');
  return index < 0 ? 7 : Number(process.argv[index + 1]);
}

function createSearchTrendsClient(url: string, key: string) {
  return new PostgrestClient(`${url.replace(/\/$/, '')}/rest/v1`, {
    schema: 'search_trends', headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
}
type SearchTrendsClient = ReturnType<typeof createSearchTrendsClient>;

function printCompleteMetrics(humans: number, outclicks: number, days: number): void {
  console.log(`Daily average recorded human visits: ${Math.round(humans / days)}`);
  // Preserve metrics-snapshot.py's existing machine-readable protocol, only for complete windows.
  console.log(`합계 ${days}일: 사람 ${humans}명 · 아웃클릭 ${outclicks}회`);
  console.log(`하루 평균 사람 ${Math.round(humans / days)}명`);
}

function printVisitSources(visits: VisitSourceRow[], window: FunnelWindow, funnelHumans: number): void {
  const sources = summarizeVisitSources(visits, window);
  console.log('SOURCE: search_trends.site_visits (is_bot=false, outclicks excluded); search = referrer medium "organic" (src/lib/referrer.ts), not GSC clicks.');
  if (sources.humans !== funnelHumans) {
    console.log(`Visit sources withheld: site_visits humans=${sources.humans} but funnel humans=${funnelHumans}.`);
    return;
  }
  const engines = sources.searchByEngine.map(([engine, count]) => `${engine}=${count}`).join(', ');
  console.log(`Search referrers (organic) by engine: ${engines || 'none'}`);
  formatVisitSourceLines(sources, window.days).forEach((line) => console.log(line));
}

function printReport(rows: FunnelRow[], visits: VisitSourceRow[], window: FunnelWindow): void {
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
    printVisitSources(visits, window, summary.humans);
  }
  console.log(`Recorded totals (${window.days} completed KST days): humans=${summary.humans}; outclicks=${summary.outclicks}`);
  console.log('Outclicks are leading signals, not confirmed earnings. Zero stored outclicks does not prove delivery or revenue conversion.');
}

async function readFunnel(client: SearchTrendsClient, window: FunnelWindow): Promise<FunnelRow[]> {
  return readFunnelRows(async (from, to) => {
    const { data, error } = await client.from('v_revenue_funnel').select('*')
      .eq('site', FUNNEL_SITE).gte('day', window.since).lt('day', window.until)
      .order('day').order('site').range(from, to);
    if (error) throw new Error(`Funnel query failed: ${error.message}`);
    return (data ?? []) as FunnelRow[];
  });
}

async function readVisitSources(client: SearchTrendsClient, window: FunnelWindow): Promise<VisitSourceRow[]> {
  return readFunnelRows<VisitSourceRow>(async (from, to) => {
    const { data, error } = await client.from('site_visits').select('day,site,source,medium,is_bot,visits')
      .eq('site', FUNNEL_SITE).eq('is_bot', false).gte('day', window.since).lt('day', window.until)
      .order('day').order('hour_kst').order('source').order('medium').range(from, to);
    if (error) throw new Error(`site_visits query failed: ${error.message}`);
    return (data ?? []) as VisitSourceRow[];
  });
}

async function main(): Promise<void> {
  const window = completedKstWindow(requestedDays());
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are required');
  const client = createSearchTrendsClient(url, key);
  // Sequential on purpose: the second read must not start if the funnel read fails.
  const rows = await readFunnel(client, window);
  const visits = await readVisitSources(client, window);
  printReport(rows, visits, window);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
