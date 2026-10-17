/**
 * Validates the article files a publish run just produced and quarantines the bad ones.
 *
 *   tsx scripts/validate-news.ts            # candidates = untracked/modified files in src/content/news
 *   tsx scripts/validate-news.ts a.md b.md  # explicit candidates
 *
 * A bad file is moved (never deleted) to src/content/_quarantine/<lang>/ together with its
 * translation partner, and the reason is appended to QUARANTINE.log. Everything else is left
 * for the publish step, so one poisoned article can no longer hold back the rest.
 *
 * Exit code is 0 unless the script itself fails; the summary line
 * `validate: kept=<n> quarantined=<n>` is what publish-local.sh logs.
 */
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { quarantineInvalidArticles } from '../src/lib/news-validate';

const ROOT = resolve(__dirname, '..');
const NEWS_ROOT = join(ROOT, 'src', 'content', 'news');
const QUARANTINE_ROOT = join(ROOT, 'src', 'content', '_quarantine');

function changedArticleFiles(): string[] {
  const out = execFileSync(
    'git',
    ['status', '--porcelain', '-z', '--untracked-files=all', '--', 'src/content/news'],
    { cwd: ROOT, encoding: 'utf8' },
  );
  return out
    .split('\0')
    .filter((entry) => entry.length > 3)
    .filter((entry) => !entry.startsWith(' D') && !entry.startsWith('D '))
    .map((entry) => join(ROOT, entry.slice(3)))
    .filter((file) => file.endsWith('.md'));
}

function main(): void {
  const explicit = process.argv.slice(2).map((file) => resolve(file));
  const candidates = explicit.length > 0 ? explicit : changedArticleFiles();
  const report = quarantineInvalidArticles(candidates, {
    newsRoot: NEWS_ROOT,
    quarantineRoot: QUARANTINE_ROOT,
  });
  for (const entry of report.quarantined) {
    console.log(`  ✗ quarantined ${entry.file} — ${entry.reason}`);
  }
  console.log(`validate: kept=${report.kept} quarantined=${report.quarantined.length}`);
}

main();
