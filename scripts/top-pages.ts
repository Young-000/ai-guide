#!/usr/bin/env tsx
/** Read-only traffic winners. Usage: npm run top-pages -- --limit 20 */
import { PostgrestClient } from '@supabase/postgrest-js';
import { completedKstWindow, type FunnelWindow } from './revenue-funnel-report';
import { rankTopPages, readViewRows, sanitizePathForDisplay, type ViewRow } from './top-pages-report';

const WINDOW_DAYS = [7, 30];

function createSearchTrendsClient(url: string, key: string) {
  return new PostgrestClient(`${url.replace(/\/$/, '')}/rest/v1`, {
    schema: 'search_trends', headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
}
type SearchTrendsClient = ReturnType<typeof createSearchTrendsClient>;

function requestedLimit(): number {
  const index = process.argv.indexOf('--limit');
  return index < 0 ? 20 : Number(process.argv[index + 1]);
}

async function readTable(client: SearchTrendsClient, table: string, window: FunnelWindow): Promise<ViewRow[]> {
  return readViewRows(async (from, to) => {
    const { data, error } = await client.from(table).select('path,day,count')
      .gte('day', window.since).lt('day', window.until)
      .order('day').order('path').range(from, to);
    if (error) throw new Error(`${table} query failed: ${error.message}`);
    return (data ?? []) as ViewRow[];
  });
}

async function main(): Promise<void> {
  const limit = requestedLimit();
  if (!Number.isSafeInteger(limit) || limit <= 0) throw new Error('--limit must be a positive integer');
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are required');
  const client = createSearchTrendsClient(url, key);
  for (const days of WINDOW_DAYS) {
    const window = completedKstWindow(days);
    const [human, total] = await Promise.all([
      readTable(client, 'page_views_human', window), readTable(client, 'page_views', window),
    ]);
    console.log(`\nTop ${limit} paths, last ${days} completed KST days [${window.since}, ${window.until})`);
    console.log('SOURCE: search_trends.page_views_human (bot UA filtered); total = page_views (includes crawlers).');
    console.log('rank  human  total  path');
    rankTopPages(human, total, limit).forEach((row, i) => {
      console.log(`${String(i + 1).padStart(4)}  ${String(row.human).padStart(5)}  ${String(row.total).padStart(5)}  ${sanitizePathForDisplay(row.path)}`);
    });
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
