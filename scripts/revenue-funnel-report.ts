/** Reporting scope only: preserves the database's existing visit and outclick definitions. */
export type FunnelRow = {
  day: string;
  site: string;
  humans: number;
  bots: number;
  outclicks: number;
  click_rate_pct: number | null;
};
export type FunnelWindow = { since: string; until: string; days: number };
export const FUNNEL_SITE = 'aiwire';
const DAY_MS = 86_400_000;

export function completedKstWindow(days: number, now = new Date()): FunnelWindow {
  if (!Number.isSafeInteger(days) || days <= 0) throw new Error('--days must be a positive integer');
  const until = new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const since = new Date(Date.parse(`${until}T00:00:00Z`) - days * DAY_MS).toISOString().slice(0, 10);
  return { since, until, days };
}

export function summarizeFunnel(input: FunnelRow[], window: FunnelWindow): {
  rows: FunnelRow[]; humans: number; outclicks: number; observedDays: number; missingDays: number;
} {
  const rows = input.filter((row) => row.site === FUNNEL_SITE && row.day >= window.since && row.day < window.until)
    .sort((a, b) => a.day.localeCompare(b.day));
  const observedDays = new Set(rows.map((row) => row.day)).size;
  return {
    rows,
    humans: rows.reduce((sum, row) => sum + row.humans, 0),
    outclicks: rows.reduce((sum, row) => sum + row.outclicks, 0),
    observedDays,
    missingDays: window.days - observedDays,
  };
}

export async function readFunnelRows(
  fetchPage: (from: number, to: number) => Promise<FunnelRow[]>,
  pageSize = 500,
): Promise<FunnelRow[]> {
  const rows: FunnelRow[] = [];
  for (let from = 0; ; from += pageSize) {
    const page = await fetchPage(from, from + pageSize - 1);
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}
