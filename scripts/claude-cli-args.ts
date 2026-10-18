// argv for the headless `claude -p` call used by generate-news.ts.
// CEO rule 2026-10-18: lightest model and effort that keeps accuracy.

export const DEFAULT_NEWS_MODEL = 'claude-sonnet-5-5';
export const DEFAULT_NEWS_EFFORT = 'medium';

export function buildClaudeCliArgs(env: Record<string, string | undefined> = process.env): string[] {
  const model = env.NEWS_MODEL || DEFAULT_NEWS_MODEL;
  const effort = env.NEWS_EFFORT || DEFAULT_NEWS_EFFORT;
  return ['-p', '--model', model, '--effort', effort];
}
