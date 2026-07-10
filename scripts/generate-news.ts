/**
 * Reads scripts/worklist.json and generates bilingual (ko + en) news digest
 * markdown files under src/content/news/. Run after `npm run fetch-news`.
 *
 * Two generation backends, auto-selected:
 *   1. ANTHROPIC_API_KEY set   → Anthropic SDK (used by CI when a key exists).
 *   2. no key, `claude` CLI    → local Claude Code auth, no API key required.
 * This lets the pipeline run locally with zero API key.
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import Anthropic from '@anthropic-ai/sdk';
import type { FeedItem } from '../src/lib/news-feed';
import { isSlugTaken } from '../src/lib/news-slug-guard';

// ─── Types ────────────────────────────────────────────────────────────────────

type Worklist = { generatedAt: string; items: FeedItem[] };
type PublishedState = { urls: string[] };
type Generate = (prompt: string) => Promise<string>;

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_ARTICLES = 3;
const ROOT = join(__dirname, '..');
const TODAY = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
const NEWS_MODEL = process.env.NEWS_MODEL ?? 'claude-opus-4-8';
const CLI_TIMEOUT_MS = 180_000;

// ─── Load files ───────────────────────────────────────────────────────────────

const worklistPath = join(ROOT, 'scripts', 'worklist.json');
if (!existsSync(worklistPath)) {
  console.log('No worklist.json — run fetch-news first.');
  process.exit(0);
}

const worklist = JSON.parse(readFileSync(worklistPath, 'utf-8')) as Worklist;
const items = worklist.items.slice(0, MAX_ARTICLES);

if (items.length === 0) {
  console.log('0 items in worklist — nothing to generate.');
  process.exit(0);
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
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });
  return response.content[0].type === 'text' ? response.content[0].text : '';
}

// Local backend: pipe the prompt to `claude -p` (headless) via stdin, capture
// stdout. Uses the machine's Claude Code auth — no ANTHROPIC_API_KEY needed.
function runClaudeCli(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn('claude', ['-p', '--model', NEWS_MODEL], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let out = '';
    let err = '';
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`claude CLI timed out after ${CLI_TIMEOUT_MS}ms`));
    }, CLI_TIMEOUT_MS);
    child.stdout.on('data', (chunk: Buffer) => (out += chunk.toString()));
    child.stderr.on('data', (chunk: Buffer) => (err += chunk.toString()));
    child.on('error', (e) => {
      clearTimeout(timer);
      reject(e);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) resolve(out);
      else reject(new Error(`claude CLI exit ${code}: ${err.slice(0, 300)}`));
    });
    child.stdin.write(prompt);
    child.stdin.end();
  });
}

// ─── Generation ───────────────────────────────────────────────────────────────

async function generatePair(
  item: FeedItem,
  generate: Generate,
): Promise<{ slug: string; ko: string; en: string } | null> {
  const userPrompt = `You are an AI news digest writer. Based on the RSS item below, write a bilingual (Korean + English) digest following the rules.

## RSS ITEM
Title: ${item.title}
URL: ${item.url}
Source: ${item.source}
Published: ${item.publishedAt ?? 'unknown'}
Summary: ${item.summary ?? '(none)'}

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
    console.warn(`[WARN] Malformed output for "${item.title}" — skipped`);
    return null;
  }

  return { slug, ko, en };
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

  console.log(`Generating articles for ${items.length} item(s)…`);

  for (const item of items) {
    console.log(`  • ${item.title}`);

    let pair: { slug: string; ko: string; en: string } | null = null;
    try {
      pair = await generatePair(item, generate);
    } catch (err) {
      console.warn(`  [WARN] generation error: ${(err as Error).message}`);
      continue;
    }

    if (!pair) continue;

    if (isSlugTaken(pair.slug)) {
      console.warn(
        `  [WARN] slug collision '${pair.slug}' already used by an existing article — skipping (not overwriting)`,
      );
      continue;
    }

    const koDir = join(ROOT, 'src', 'content', 'news', 'ko');
    const enDir = join(ROOT, 'src', 'content', 'news', 'en');
    mkdirSync(koDir, { recursive: true });
    mkdirSync(enDir, { recursive: true });

    writeFileSync(join(koDir, `${TODAY}-${pair.slug}.md`), pair.ko + '\n');
    writeFileSync(join(enDir, `${TODAY}-${pair.slug}.md`), pair.en + '\n');

    publishedState.urls.push(item.url);
    console.log(`  ✓ ${TODAY}-${pair.slug} (ko + en)`);
    published++;
  }

  if (published > 0) {
    writeFileSync(publishedPath, JSON.stringify(publishedState, null, 2) + '\n');
  }

  console.log(`\n${published} article pair(s) written.`);
  if (published === 0) process.exit(1); // signal to CI: nothing to commit
}

main().catch((err: unknown) => {
  console.error('[ERROR]', err);
  process.exit(1);
});
