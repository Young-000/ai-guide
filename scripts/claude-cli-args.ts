// argv for the headless `claude -p` call used by generate-news.ts.
// CEO rule 2026-10-18: lightest model and effort that keeps accuracy.

export const DEFAULT_NEWS_MODEL = 'claude-sonnet-5-5';
export const DEFAULT_NEWS_EFFORT = 'medium';

// The digest is text in, text out, and stdout must hold exactly one answer. The machine's settings
// carry hooks written for human sessions: a Stop hook that asks for a Korean rewrite makes the CLI
// answer twice, and stdout keeps only the second answer. --bare would also skip them but refuses
// OAuth, which is what the cron authenticates with.
const ISOLATION_ARGS = [
  '--setting-sources', '',
  '--strict-mcp-config',
  '--tools', '',
  '--disable-slash-commands',
];

export function buildClaudeCliArgs(env: Record<string, string | undefined> = process.env): string[] {
  const model = env.NEWS_MODEL || DEFAULT_NEWS_MODEL;
  const effort = env.NEWS_EFFORT || DEFAULT_NEWS_EFFORT;
  return ['-p', '--model', model, '--effort', effort, ...ISOLATION_ARGS];
}

