/** Pure helpers for the top-pages report: rank paths by human hits, keep total traffic beside them. */
export type ViewRow = { path: string; day: string; count: number };
export type TopPage = { path: string; human: number; total: number };

function sumByPath(rows: ViewRow[]): Map<string, number> {
  const sums = new Map<string, number>();
  for (const row of rows) sums.set(row.path, (sums.get(row.path) ?? 0) + row.count);
  return sums;
}

export function rankTopPages(human: ViewRow[], total: ViewRow[], limit: number): TopPage[] {
  const humanSums = sumByPath(human);
  const totalSums = sumByPath(total);
  const paths = new Set(Array.from(humanSums.keys()).concat(Array.from(totalSums.keys())));
  return Array.from(paths)
    .map((path) => ({ path, human: humanSums.get(path) ?? 0, total: totalSums.get(path) ?? 0 }))
    .sort((a, b) => b.human - a.human || b.total - a.total || a.path.localeCompare(b.path))
    .slice(0, limit);
}

const UNSAFE_DISPLAY_CHARS = /[\u0000-\u001f\u007f-\u009f\u2028\u2029\u202a-\u202e\u2066-\u2069]/g;
const NAMED_ESCAPES: Record<string, string> = { '\n': '\\n', '\r': '\\r', '\t': '\\t' };

/** Paths come from public traffic: escape control/bidi characters so they cannot drive the terminal. */
export function sanitizePathForDisplay(path: string): string {
  return path.replace(UNSAFE_DISPLAY_CHARS, (char) => {
    const code = char.charCodeAt(0);
    return NAMED_ESCAPES[char] ?? (code <= 0xff ? `\\x${code.toString(16).padStart(2, '0')}` : `\\u${code.toString(16).padStart(4, '0')}`);
  });
}

export async function readViewRows(
  fetchPage: (from: number, to: number) => Promise<ViewRow[]>,
  pageSize = 1000,
): Promise<ViewRow[]> {
  const rows: ViewRow[] = [];
  for (let from = 0; ; from += pageSize) {
    const page = await fetchPage(from, from + pageSize - 1);
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}
