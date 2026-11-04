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

export async function readFunnelRows<T = FunnelRow>(
  fetchPage: (from: number, to: number) => Promise<T[]>,
  pageSize = 500,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const page = await fetchPage(from, from + pageSize - 1);
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}

/** One `search_trends.site_visits` bucket (day × hour × source × medium × is_bot); hour is summed away here. */
export type VisitSourceRow = {
  day: string; site: string; source: string; medium: string; is_bot: boolean; visits: number;
};
export type VisitSourceSummary = {
  humans: number; direct: number; search: number; searchByEngine: [engine: string, visits: number][];
};

/** site_visits also stores outclicks; v_revenue_funnel excludes the same sources from `humans`. */
const OUTCLICK_SOURCES = ['coupang', 'tool'];
/** `src/lib/referrer.ts` labels search-engine referrers (google·bing·duckduckgo·yahoo·naver…) medium=organic. */
const SEARCH_MEDIUM = 'organic';

function isHumanVisit(row: VisitSourceRow, window: FunnelWindow): boolean {
  return row.site === FUNNEL_SITE && !row.is_bot && !OUTCLICK_SOURCES.includes(row.source)
    && row.day >= window.since && row.day < window.until;
}

/** Search-referrer visits and direct visits among the same human visits v_revenue_funnel counts. */
export function summarizeVisitSources(input: VisitSourceRow[], window: FunnelWindow): VisitSourceSummary {
  const rows = input.filter((row) => isHumanVisit(row, window));
  const engines = new Map<string, number>();
  rows.filter((row) => row.medium === SEARCH_MEDIUM)
    .forEach((row) => engines.set(row.source, (engines.get(row.source) ?? 0) + row.visits));
  const searchByEngine = Array.from(engines.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return {
    humans: rows.reduce((sum, row) => sum + row.visits, 0),
    direct: rows.filter((row) => row.source === 'direct').reduce((sum, row) => sum + row.visits, 0),
    search: searchByEngine.reduce((sum, [, visits]) => sum + visits, 0),
    searchByEngine,
  };
}

/** Machine-read by metrics-snapshot.py (claude-ops-scripts) into docs/metrics/<day>.md — keep the wording. */
export function formatVisitSourceLines(summary: VisitSourceSummary, days: number): string[] {
  const searchLine = `검색 리퍼러 방문 ${days}일: ${summary.search}회`;
  if (summary.humans === 0) return [searchLine, 'direct share unknown: no human visits in the window.'];
  const directPct = Math.round((summary.direct / summary.humans) * 1000) / 10;
  return [searchLine, `direct 비율 ${days}일: ${directPct.toFixed(1)}%`];
}
