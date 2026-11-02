/**
 * Reads scripts/worklist.json and generates bilingual (ko + en) news digest
 * markdown files under src/content/news/. Run after `npm run fetch-news`.
 *
 * Two generation backends, auto-selected:
 *   1. ANTHROPIC_API_KEY set   → Anthropic SDK (used by CI when a key exists).
 *   2. no key, `claude` CLI    → local Claude Code auth, no API key required.
 * This lets the pipeline run locally with zero API key.
 *
 * Exit codes: 0 = at least one pair written, 1 = nothing new, 2 = every attempt failed.
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { DEFAULT_NEWS_MODEL } from './claude-cli-args';
import { ClaudeCliError, runClaudeCli } from './claude-cli-run';
import { saveRawOutput } from './raw-output-store';
import Anthropic from '@anthropic-ai/sdk';
import type { FeedItem } from '../src/lib/news-feed';
import { getAllNews } from '../src/lib/news';
import { NEWS_QUALITY, checkArticleQuality, resolveDailyLimit } from '../src/lib/news-quality';
import { planGeneration, storySources } from '../src/lib/news-plan';
import type { SkipReason, Story } from '../src/lib/news-plan';
import { isSlugTaken } from '../src/lib/news-slug-guard';
import { classifyGenerationRun, validateGeneratedPair } from '../src/lib/news-validate';

// ─── Types ────────────────────────────────────────────────────────────────────

type Worklist = { generatedAt: string; items: Story[] };
type PublishedState = { urls: string[] };
type Generate = (prompt: string) => Promise<string>;
type GeneratedOutput = { slug: string; ko: string; en: string; raw: string };

// ─── Constants ────────────────────────────────────────────────────────────────

const ROOT = join(__dirname, '..');
const TODAY = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
const NEWS_MODEL = process.env.NEWS_MODEL || DEFAULT_NEWS_MODEL;
const CRASH_EXIT_CODE = 4; // distinct from 1 (nothing new) and 2 (every attempt failed)

// ─── Load files ───────────────────────────────────────────────────────────────

const worklistPath = join(ROOT, 'scripts', 'worklist.json');
if (!existsSync(worklistPath)) {
  console.log('No worklist.json — run fetch-news first.');
  process.exit(0);
}

const worklist = JSON.parse(readFileSync(worklistPath, 'utf-8')) as Worklist;

// Quality plan (src/lib/news-plan.ts, thresholds in src/lib/news-quality.ts), applied BEFORE any model call:
// no headline-only or promotional items, at least NEWS_QUALITY.minSources outlets per story, no event already
// published today, and a daily + per-run publishing cap. Planning first spares the weekly CLI quota.
const DAILY_LIMIT = resolveDailyLimit();
const todaysArticles = getAllNews('en').filter((article) => article.date === TODAY);
const plan = planGeneration({
  stories: worklist.items,
  publishedToday: todaysArticles.length,
  dailyLimit: DAILY_LIMIT,
  runLimit: NEWS_QUALITY.runLimit,
  minSources: NEWS_QUALITY.minSources,
  todaysArticles,
});
const items = plan.selected;

function describeSkips(skipped: { reason: SkipReason }[]): string {
  const counts = new Map<SkipReason, number>();
  for (const { reason } of skipped) counts.set(reason, (counts.get(reason) ?? 0) + 1);
  return Array.from(counts, ([reason, count]) => `${count} ${reason}`).join(', ');
}

if (plan.skipped.length > 0) {
  console.log(`${plan.skipped.length} item(s) not written (${describeSkips(plan.skipped)}); ${todaysArticles.length}/${DAILY_LIMIT} published today.`);
}

if (items.length === 0) {
  // Nothing qualified: exit 1 with the summary line publish-local.sh reads as "nothing new" (it treats exit 1
  // without that line as a crash). A worklist that was empty to begin with stays exit 0, as before.
  console.log(`0 article pair(s) written, 0 failed, 0 skipped (nothing to write: ${describeSkips(plan.skipped) || 'empty worklist'}).`);
  process.exit(plan.skipped.length > 0 ? 1 : 0);
}

const generationGuide = readFileSync(
  join(ROOT, 'scripts', 'GENERATION_PROMPT.md'),
  'utf-8',
);

const publishedPath = join(ROOT, 'scripts', '_published.json');
const publishedState: PublishedState = existsSync(publishedPath)
  ? (JSON.parse(readFileSync(publishedPath, 'utf-8')) as PublishedState)
  : { urls: [] };

// ─── Backends ───────────────────────────────────────────────────────────────

async function runAnthropicApi(prompt: string, client: Anthropic): Promise<string> {
  const response = await client.messages.create({
    model: NEWS_MODEL,
    // Opus 5.5 always thinks (cannot be disabled); the budget covers thinking + the digest.
    max_tokens: 16000,
    messages: [{ role: 'user', content: prompt }],
  });
  // Thinking blocks may precede the answer, so take the first text block, not content[0].
  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === 'text',
  );
  return textBlock?.text ?? '';
}

// ─── Generation ───────────────────────────────────────────────────────────────

function saveFailure(item: Story, reason: string, text: string): string {
  const file = saveRawOutput({ reason, title: item.title, url: item.url, text });
  return file ? `raw output: ${file}` : 'raw output could not be saved';
}

function describeSource(source: FeedItem, index: number): string {
  return `### Source ${index + 1}
Title: ${source.title}
URL: ${source.url}
Outlet feed: ${source.source}
Published: ${source.publishedAt ?? 'unknown'}
Summary: ${source.summary ?? '(none)'}`;
}

async function generatePair(
  item: Story,
  generate: Generate,
): Promise<GeneratedOutput | null> {
  const sources = storySources(item);
  const userPrompt = `You are an AI news digest writer. Based on the ${sources.length} source items below, which cover the same event, write ONE bilingual (Korean + English) article following the rules. Cite every source URL below in the frontmatter \`sources\` and use no other URL.

## SOURCE ITEMS
${sources.map(describeSource).join('\n\n')}

## RULES
${generationGuide}

## TODAY'S DATE
${TODAY}

## OUTPUT FORMAT
Output exactly this structure — nothing before or after:

===SLUG_START===
<3-5 word kebab-case slug, same for both languages>
===SLUG_END===
===KO_START===
<complete Korean markdown file including frontmatter>
===KO_END===
===EN_START===
<complete English markdown file including frontmatter>
===EN_END===`;

  const text = await generate(userPrompt);

  const slug = text.match(/===SLUG_START===\s*([\s\S]*?)\s*===SLUG_END===/)?.[1]?.trim();
  const ko = text.match(/===KO_START===\s*([\s\S]*?)\s*===KO_END===/)?.[1]?.trim();
  const en = text.match(/===EN_START===\s*([\s\S]*?)\s*===EN_END===/)?.[1]?.trim();

  if (!slug || !ko || !en) {
    console.warn(`[WARN] Malformed output for "${item.title}" — skipped (${saveFailure(item, 'malformed', text)})`);
    return null;
  }

  return { slug, ko, en, raw: text };
}

// ─── Main ────────────────────────────────────────────────────────────────────

function selectGenerator(): Generate {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    const client = new Anthropic({ apiKey });
    console.log('Backend: Anthropic API (ANTHROPIC_API_KEY set).');
    return (prompt) => runAnthropicApi(prompt, client);
  }
  console.log('Backend: local `claude` CLI (no ANTHROPIC_API_KEY — Claude Code auth).');
  return runClaudeCli;
}

async function main(): Promise<void> {
  const generate = selectGenerator();
  let published = 0;
  let failed = 0;
  let skipped = 0;
  let rejected = 0;

  console.log(`Generating articles for ${items.length} item(s)…`);

  for (const item of items) {
    console.log(`  • ${item.title}`);

    let pair: GeneratedOutput | null = null;
    try {
      pair = await generatePair(item, generate);
    } catch (err) {
      const message = (err as Error).message;
      const [reason, raw] = err instanceof ClaudeCliError ? ['cli-error', err.rawOutput] : ['api-error', ''];
      const saved = saveFailure(item, reason, `error: ${message}\n\n${raw}`);
      console.warn(`  [WARN] generation error: ${message} (${saved})`);
      failed++;
      continue;
    }

    if (!pair) {
      failed++;
      continue;
    }

    // Validate before anything touches disk. An invalid pair is dropped and its URL stays out
    // of the ledger, so the story is retried later instead of being marked done and lost.
    const verdict = validateGeneratedPair(pair);
    if (!verdict.ok) {
      const saved = saveFailure(item, `invalid-article: ${verdict.reason}`, pair.raw);
      console.warn(`  [WARN] invalid article '${pair.slug}' — not written: ${verdict.reason} (${saved})`);
      failed++;
      continue;
    }

    // Well-formed but not worth publishing: too short, or fewer sources than the gate wants. Not a generation
    // failure, so it is counted apart (a run of only these exits 1 "quality-rejected", not 2), but the raw text
    // is saved the same way so a prompt that stops producing long articles shows up.
    const quality = checkArticleQuality(pair, { allowedSourceUrls: storySources(item).map((source) => source.url) });
    if (!quality.ok) {
      const saved = saveFailure(item, `quality-rejected: ${quality.reason}`, pair.raw);
      console.warn(`  [WARN] quality gate '${pair.slug}' — not written: ${quality.reason} (${saved})`);
      rejected++;
      continue;
    }

    if (isSlugTaken(pair.slug)) {
      console.warn(
        `  [WARN] slug collision '${pair.slug}' already used by an existing article — skipping (not overwriting)`,
      );
      skipped++;
      continue;
    }

    const koDir = join(ROOT, 'src', 'content', 'news', 'ko');
    const enDir = join(ROOT, 'src', 'content', 'news', 'en');
    mkdirSync(koDir, { recursive: true });
    mkdirSync(enDir, { recursive: true });

    writeFileSync(join(koDir, `${TODAY}-${pair.slug}.md`), pair.ko + '\n');
    writeFileSync(join(enDir, `${TODAY}-${pair.slug}.md`), pair.en + '\n');

    // Record the URL right after its files are written. A crash later in the run must not leave
    // written articles outside the ledger (they would be regenerated under another slug).
    // Every outlet the article used goes into the ledger, so a related item never returns as a story of its own.
    publishedState.urls.push(...storySources(item).map((source) => source.url));
    writeFileSync(publishedPath, JSON.stringify(publishedState, null, 2) + '\n');
    console.log(`  ✓ ${TODAY}-${pair.slug} (ko + en)`);
    published++;
  }

  // Exit codes: 0 = pairs written, 1 = nothing new (duplicates only), 2 = every attempt failed,
  // 4 = unexpected crash. CI treats any non-zero as "nothing to commit"; publish-local.sh tells
  // them apart (a crash must never look like a quiet news day).
  const verdict = classifyGenerationRun({ written: published, failed, skipped, rejected });
  console.log(`\n${published} article pair(s) written, ${failed} failed, ${skipped} skipped, ${rejected} rejected (${verdict.label}).`);
  if (verdict.exitCode !== 0) process.exit(verdict.exitCode);
}

main().catch((err: unknown) => {
  console.error('[ERROR]', err);
  process.exit(CRASH_EXIT_CODE);
});
