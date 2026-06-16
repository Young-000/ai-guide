import { getServiceClient } from '@/lib/supabase';

// A single row from search_trends.trend_snapshots.
// Only the columns this feature relies on are typed; the table has more.
export type TrendSnapshotRow = {
  source: string;
  geo: string;
  captured_at: string;
  rank: number;
  keyword: string;
  traffic: number | string | null;
};

export type TrendingKeyword = {
  keyword: string;
  rank: number;
};

// AI/LLM keyword filter. Matched case-insensitively against the keyword text.
// Korean + English terms commonly seen for AI-related searches.
const AI_KEYWORD_PATTERNS: readonly string[] = [
  'ai',
  'a.i',
  '인공지능',
  'llm',
  '챗gpt',
  'chatgpt',
  'gpt',
  '챗봇',
  'chatbot',
  '클로드',
  'claude',
  'gemini',
  '제미나이',
  '제미니',
  '코파일럿',
  'copilot',
  'sora',
  '소라',
  '미드저니',
  'midjourney',
  '딥시크',
  'deepseek',
  '머신러닝',
  'machine learning',
  '생성형',
  '생성 ai',
  '모델',
  '오픈ai',
  'openai',
];

/**
 * Returns true when the keyword looks AI/LLM-related.
 * Conservative substring match — false positives are cheap (just a seed candidate),
 * false negatives only mean we miss a trend.
 */
export function isAiRelatedKeyword(keyword: string): boolean {
  const normalized = keyword.toLowerCase();
  return AI_KEYWORD_PATTERNS.some((pattern) => normalized.includes(pattern));
}

/**
 * Builds an outbound link to the sister site hottrend.news for a keyword.
 */
export function hottrendKeywordUrl(keyword: string): string {
  return `https://hottrend.news/keyword/${encodeURIComponent(keyword)}?geo=KR`;
}

/**
 * Pure transform: from raw snapshot rows, pick the latest captured_at snapshot,
 * keep KR rows, drop blanks, dedupe by keyword (best rank wins), sort by rank asc,
 * and cap to `limit`.
 *
 * Kept pure (no I/O) so it is fully unit-testable.
 */
export function selectLatestKrTop(
  rows: readonly TrendSnapshotRow[],
  limit: number,
): TrendingKeyword[] {
  if (rows.length === 0) return [];

  const krRows = rows.filter((r) => r.geo === 'KR' && r.keyword.trim() !== '');
  if (krRows.length === 0) return [];

  const latestCapturedAt = krRows.reduce(
    (max, r) => (r.captured_at > max ? r.captured_at : max),
    krRows[0].captured_at,
  );

  const latestRows = krRows.filter((r) => r.captured_at === latestCapturedAt);

  // Dedupe by keyword, keeping the lowest (best) rank.
  const byKeyword = new Map<string, number>();
  for (const r of latestRows) {
    const existing = byKeyword.get(r.keyword);
    if (existing === undefined || r.rank < existing) {
      byKeyword.set(r.keyword, r.rank);
    }
  }

  return Array.from(byKeyword.entries())
    .map(([keyword, rank]) => ({ keyword, rank }))
    .sort((a, b) => a.rank - b.rank)
    .slice(0, limit);
}

/**
 * Fetches the latest KR trending keywords from search_trends.trend_snapshots.
 * Fully fail-soft: returns [] on any error (missing env, DB down, empty data),
 * so callers can hide the widget without ever breaking the page.
 */
export async function fetchTrendingKeywords(limit = 8): Promise<TrendingKeyword[]> {
  try {
    const supabase = getServiceClient();
    // Pull a recent window ordered by captured_at desc; the pure transform then
    // isolates the single latest snapshot. A generous row cap covers multiple
    // sources without an extra round-trip for the max(captured_at).
    const { data, error } = await supabase
      .from('trend_snapshots')
      .select('source, geo, captured_at, rank, keyword, traffic')
      .eq('geo', 'KR')
      .order('captured_at', { ascending: false })
      .order('rank', { ascending: true })
      .limit(200);

    if (error || !data) return [];
    return selectLatestKrTop(data as TrendSnapshotRow[], limit);
  } catch {
    return [];
  }
}
