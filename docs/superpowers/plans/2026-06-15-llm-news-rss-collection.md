# LLM News RSS Collection Script — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a deterministic (no LLM) script that fetches RSS/Atom feeds, deduplicates against already-published articles, and writes a `scripts/worklist.json` of new items for a downstream generation step.

**Architecture:** A pure TypeScript library (`src/lib/news-feed.ts`) handles XML parsing and dedup logic — fully testable with Jest. A separate runner script (`scripts/fetch-llm-news.ts`) orchestrates feed fetching, builds the URL/title sets from existing markdown articles via `getAllNews()`, and writes the worklist. The runner is executed via `tsx` so it shares types with the app.

**Tech Stack:** Next.js 14 / TypeScript 5, Jest 30 + ts-jest, `fast-xml-parser@^4` (XML), `tsx` (script runner), `gray-matter` (already installed — used by `news.ts` to read existing articles).

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `scripts/feeds.json` | Curated list of AI/LLM RSS/Atom feed URLs |
| Create | `scripts/_published.json` | Persisted dedup state (committed; seed = `{"urls":[]}`) |
| Gitignore | `scripts/worklist.json` | Runtime output — never committed |
| Create | `src/lib/news-feed.ts` | `FeedItem` type, `parseFeed()`, `dedupeItems()` |
| Create | `src/lib/__tests__/news-feed.test.ts` | Jest tests (RSS fixture, Atom fixture, dedup) |
| Create | `scripts/fetch-llm-news.ts` | Runner: fetch → parse → dedup → write worklist |
| Modify | `package.json` | Add `"fetch-news"` script; add `fast-xml-parser`, `tsx` deps |
| Modify | `.gitignore` | Add `scripts/worklist.json` |

---

## Task 1: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1.1: Install `fast-xml-parser` as a runtime dependency**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
npm install fast-xml-parser@^4
```

Expected output includes: `added 1 package` and `fast-xml-parser@4.x.x` in the dependency tree.

- [ ] **Step 1.2: Install `tsx` as a dev dependency**

```bash
npm install --save-dev tsx
```

Expected output includes: `added 1 package` and `tsx@x.x.x`.

- [ ] **Step 1.3: Verify both are in package.json**

```bash
grep -E '"fast-xml-parser"|"tsx"' /Users/Young/Desktop/claude-workspace/teamY/ai-guide/package.json
```

Expected: both names appear.

---

## Task 2: Create `scripts/feeds.json`

**Files:**
- Create: `scripts/feeds.json`

- [ ] **Step 2.1: Create the scripts directory and feeds file**

Create `/Users/Young/Desktop/claude-workspace/teamY/ai-guide/scripts/feeds.json`:

```json
[
  { "name": "OpenAI Blog", "url": "https://openai.com/news/rss/" },
  { "name": "Google AI Blog", "url": "https://blog.google/technology/ai/rss/" },
  { "name": "Hugging Face Blog", "url": "https://huggingface.co/blog/feed.xml" },
  { "name": "MIT Tech Review AI", "url": "https://www.technologyreview.com/topic/artificial-intelligence/feed" },
  { "name": "VentureBeat AI", "url": "https://venturebeat.com/category/ai/feed/" }
]
```

- [ ] **Step 2.2: Commit seeds**

```bash
git add scripts/feeds.json
git commit -m "chore: add RSS feeds config"
```

---

## Task 3: Write failing tests for `news-feed.ts` (RED)

**Files:**
- Create: `src/lib/__tests__/news-feed.test.ts`

- [ ] **Step 3.1: Create the test file**

Create `/Users/Young/Desktop/claude-workspace/teamY/ai-guide/src/lib/__tests__/news-feed.test.ts`:

```typescript
import { parseFeed, dedupeItems } from '@/lib/news-feed';
import type { FeedItem } from '@/lib/news-feed';

// ─── Fixtures ──────────────────────────────────────────────────────────────

const RSS_FIXTURE = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test Feed</title>
    <item>
      <title>Article One</title>
      <link>https://example.com/article-one</link>
      <pubDate>Mon, 15 Jun 2026 10:00:00 GMT</pubDate>
      <description>Summary of article one</description>
    </item>
    <item>
      <title>Article Two</title>
      <link>https://example.com/article-two</link>
      <pubDate>Sun, 14 Jun 2026 08:00:00 GMT</pubDate>
      <description>Summary of article two</description>
    </item>
  </channel>
</rss>`;

const ATOM_FIXTURE = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Atom Test Feed</title>
  <entry>
    <title>Atom Article One</title>
    <link href="https://atom.example.com/one" rel="alternate"/>
    <updated>2026-06-15T09:00:00Z</updated>
    <summary>Atom summary one</summary>
  </entry>
</feed>`;

const ATOM_MULTI_LINK_FIXTURE = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <title>Multi Link Entry</title>
    <link href="https://example.com/self" rel="self"/>
    <link href="https://example.com/alternate" rel="alternate"/>
    <updated>2026-06-15T09:00:00Z</updated>
    <summary>Multi link summary</summary>
  </entry>
</feed>`;

// ─── parseFeed ──────────────────────────────────────────────────────────────

describe('parseFeed', () => {
  describe('RSS 2.0', () => {
    it('parses two items with all fields', () => {
      const items = parseFeed(RSS_FIXTURE, 'Test Source');
      expect(items).toHaveLength(2);
      expect(items[0]).toEqual<FeedItem>({
        source: 'Test Source',
        title: 'Article One',
        url: 'https://example.com/article-one',
        publishedAt: 'Mon, 15 Jun 2026 10:00:00 GMT',
        summary: 'Summary of article one',
      });
    });

    it('attaches sourceName to every item', () => {
      const items = parseFeed(RSS_FIXTURE, 'My Source');
      expect(items.every((i) => i.source === 'My Source')).toBe(true);
    });

    it('second item fields are correct', () => {
      const items = parseFeed(RSS_FIXTURE, 'Test Source');
      expect(items[1]?.title).toBe('Article Two');
      expect(items[1]?.url).toBe('https://example.com/article-two');
    });
  });

  describe('Atom', () => {
    it('parses a single entry with link[@href]', () => {
      const items = parseFeed(ATOM_FIXTURE, 'Atom Source');
      expect(items).toHaveLength(1);
      expect(items[0]).toEqual<FeedItem>({
        source: 'Atom Source',
        title: 'Atom Article One',
        url: 'https://atom.example.com/one',
        publishedAt: '2026-06-15T09:00:00Z',
        summary: 'Atom summary one',
      });
    });

    it('uses the alternate link when multiple links exist', () => {
      const items = parseFeed(ATOM_MULTI_LINK_FIXTURE, 'Multi');
      expect(items).toHaveLength(1);
      expect(items[0]?.url).toBe('https://example.com/alternate');
    });
  });

  describe('edge cases', () => {
    it('returns empty array for invalid XML structure', () => {
      expect(parseFeed('not xml', 'Bad')).toEqual([]);
    });

    it('returns empty array for empty string', () => {
      expect(parseFeed('', 'Empty')).toEqual([]);
    });

    it('returns empty array for XML with no RSS or Atom root', () => {
      expect(parseFeed('<root><child/></root>', 'Unknown')).toEqual([]);
    });
  });
});

// ─── dedupeItems ────────────────────────────────────────────────────────────

describe('dedupeItems', () => {
  const base: FeedItem[] = [
    { source: 'S', title: 'Alpha', url: 'https://example.com/a', publishedAt: null, summary: null },
    { source: 'S', title: 'Beta', url: 'https://example.com/b', publishedAt: null, summary: null },
    { source: 'S', title: 'Gamma', url: 'https://example.com/c', publishedAt: null, summary: null },
  ];

  it('returns all items when nothing is published', () => {
    const result = dedupeItems(base, new Set(), new Set());
    expect(result).toHaveLength(3);
  });

  it('drops items whose URL is in publishedUrls', () => {
    const result = dedupeItems(base, new Set(['https://example.com/b']), new Set());
    expect(result.map((i) => i.title)).toEqual(['Alpha', 'Gamma']);
  });

  it('drops items whose normalized title matches existingTitles', () => {
    const result = dedupeItems(base, new Set(), new Set(['alpha']));
    expect(result.map((i) => i.title)).toEqual(['Beta', 'Gamma']);
  });

  it('title match is case-insensitive and trims whitespace', () => {
    const itemWithSpaces: FeedItem[] = [
      { source: 'S', title: '  ALPHA  ', url: 'https://new.com', publishedAt: null, summary: null },
    ];
    const result = dedupeItems(itemWithSpaces, new Set(), new Set(['alpha']));
    expect(result).toHaveLength(0);
  });

  it('drops by URL before checking title (both match → still dropped once)', () => {
    const result = dedupeItems(
      base,
      new Set(['https://example.com/a']),
      new Set(['alpha']),
    );
    expect(result.map((i) => i.title)).toEqual(['Beta', 'Gamma']);
  });

  it('keeps fresh items that appear in neither set', () => {
    const result = dedupeItems(
      base,
      new Set(['https://example.com/a']),
      new Set(['beta']),
    );
    expect(result.map((i) => i.title)).toEqual(['Gamma']);
  });
});
```

- [ ] **Step 3.2: Run the test — expect RED (module not found)**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
npm test -- --testPathPattern=news-feed --no-coverage 2>&1 | tail -20
```

Expected failure: `Cannot find module '@/lib/news-feed'`.

---

## Task 4: Implement `src/lib/news-feed.ts` (GREEN)

**Files:**
- Create: `src/lib/news-feed.ts`

- [ ] **Step 4.1: Create the library file**

Create `/Users/Young/Desktop/claude-workspace/teamY/ai-guide/src/lib/news-feed.ts`:

```typescript
import { XMLParser } from 'fast-xml-parser';

// ─── Public types ───────────────────────────────────────────────────────────

export type FeedItem = {
  source: string;
  title: string;
  url: string;
  publishedAt: string | null;
  summary: string | null;
};

// ─── Internal types ─────────────────────────────────────────────────────────

type XmlNode = Record<string, unknown>;

// ─── XML parser (shared instance) ───────────────────────────────────────────

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  // Force item/entry to arrays even when there's only one child.
  isArray: (name: string) => name === 'item' || name === 'entry',
});

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Coerces an unknown XML node value to a trimmed string, or null. */
function toStr(v: unknown): string | null {
  if (typeof v === 'string') return v.trim() || null;
  if (v !== null && typeof v === 'object') {
    const node = v as XmlNode;
    const text = node['#text'];
    if (typeof text === 'string') return text.trim() || null;
  }
  return null;
}

/**
 * Extracts the href from an Atom `<link>` value.
 * Handles: string, single object `{@_href}`, array of objects (picks `rel=alternate` or first).
 */
function extractAtomLink(linkVal: unknown): string | null {
  if (typeof linkVal === 'string') return linkVal.trim() || null;

  if (Array.isArray(linkVal)) {
    // Prefer rel="alternate"; fall back to first entry with an href.
    const preferred = (linkVal as XmlNode[]).find(
      (l) => l['@_rel'] === 'alternate' || !l['@_rel'],
    );
    const candidate = preferred ?? (linkVal[0] as XmlNode | undefined);
    return candidate ? toStr(candidate['@_href']) : null;
  }

  if (linkVal !== null && typeof linkVal === 'object') {
    return toStr((linkVal as XmlNode)['@_href']);
  }

  return null;
}

// ─── Public functions ────────────────────────────────────────────────────────

/**
 * Parses an RSS 2.0 or Atom feed XML string into `FeedItem[]`.
 * Returns `[]` on any parse error or unrecognised feed format (fail-open).
 */
export function parseFeed(xml: string, sourceName: string): FeedItem[] {
  if (!xml.trim()) return [];

  let parsed: unknown;
  try {
    parsed = xmlParser.parse(xml);
  } catch {
    return [];
  }

  const root = parsed as XmlNode;

  // ── RSS 2.0 ──────────────────────────────────────────────────────────────
  const rssRoot = root['rss'] as XmlNode | undefined;
  const channel = rssRoot?.['channel'] as XmlNode | undefined;
  if (channel) {
    const rawItems = (channel['item'] ?? []) as XmlNode[];
    return rawItems
      .map((item): FeedItem => ({
        source: sourceName,
        title: toStr(item['title']) ?? '',
        url: toStr(item['link']) ?? '',
        publishedAt: toStr(item['pubDate']),
        summary: toStr(item['description']),
      }))
      .filter((i) => i.title !== '' && i.url !== '');
  }

  // ── Atom ─────────────────────────────────────────────────────────────────
  const atomFeed = root['feed'] as XmlNode | undefined;
  if (atomFeed) {
    const rawEntries = (atomFeed['entry'] ?? []) as XmlNode[];
    return rawEntries
      .map((entry): FeedItem => ({
        source: sourceName,
        title: toStr(entry['title']) ?? '',
        url: extractAtomLink(entry['link']) ?? '',
        publishedAt: toStr(entry['updated']),
        summary: toStr(entry['summary']),
      }))
      .filter((i) => i.title !== '' && i.url !== '');
  }

  return [];
}

/**
 * Filters `items` to those not already published.
 * - Drops items whose `url` is in `publishedUrls`.
 * - Drops items whose title (lowercased, trimmed) is in `existingTitles`.
 */
export function dedupeItems(
  items: FeedItem[],
  publishedUrls: Set<string>,
  existingTitles: Set<string>,
): FeedItem[] {
  return items.filter((item) => {
    if (publishedUrls.has(item.url)) return false;
    if (existingTitles.has(item.title.toLowerCase().trim())) return false;
    return true;
  });
}
```

- [ ] **Step 4.2: Run the tests — expect GREEN**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
npm test -- --testPathPattern=news-feed --no-coverage 2>&1 | tail -25
```

Expected: all tests pass. Look for `Tests: X passed, X total`.

- [ ] **Step 4.3: Commit RED→GREEN**

```bash
git add src/lib/news-feed.ts src/lib/__tests__/news-feed.test.ts
git commit -m "feat: news-feed lib — parseFeed (RSS+Atom) + dedupeItems (TDD)"
```

---

## Task 5: Update `.gitignore` + commit `_published.json` seed

**Files:**
- Modify: `.gitignore`
- Create: `scripts/_published.json`

- [ ] **Step 5.1: Add worklist.json to .gitignore**

Append to `/Users/Young/Desktop/claude-workspace/teamY/ai-guide/.gitignore`:

```
# news pipeline runtime output
scripts/worklist.json
```

- [ ] **Step 5.2: Create the seed published state**

Create `/Users/Young/Desktop/claude-workspace/teamY/ai-guide/scripts/_published.json`:

```json
{"urls":[]}
```

`_published.json` IS committed (tracks dedup state across runs). `worklist.json` is NOT committed (ephemeral output).

- [ ] **Step 5.3: Commit**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
git add .gitignore scripts/_published.json
git commit -m "chore: gitignore worklist output, seed published state"
```

---

## Task 6: Implement `scripts/fetch-llm-news.ts`

**Files:**
- Create: `scripts/fetch-llm-news.ts`

This script uses **relative imports** (`../src/lib/...`) rather than `@/` aliases to avoid any tsx path-resolution issues.

- [ ] **Step 6.1: Create the runner script**

Create `/Users/Young/Desktop/claude-workspace/teamY/ai-guide/scripts/fetch-llm-news.ts`:

```typescript
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { getAllNews } from '../src/lib/news';
import { parseFeed, dedupeItems } from '../src/lib/news-feed';
import type { FeedItem } from '../src/lib/news-feed';

// ─── Types ───────────────────────────────────────────────────────────────────

type FeedConfig = { name: string; url: string };
type PublishedState = { urls: string[] };
type Worklist = { generatedAt: string; items: FeedItem[] };

const MAX_ITEMS = 8;
const ROOT = join(__dirname, '..');

// ─── Load static config ───────────────────────────────────────────────────────

const feeds = JSON.parse(
  readFileSync(join(ROOT, 'scripts', 'feeds.json'), 'utf-8'),
) as FeedConfig[];

// ─── Build dedup sets from _published.json + existing articles ────────────────

const publishedPath = join(ROOT, 'scripts', '_published.json');
const publishedState: PublishedState = existsSync(publishedPath)
  ? (JSON.parse(readFileSync(publishedPath, 'utf-8')) as PublishedState)
  : { urls: [] };

const publishedUrls = new Set<string>(publishedState.urls);
const existingTitles = new Set<string>();

for (const lang of ['ko', 'en'] as const) {
  for (const article of getAllNews(lang)) {
    // Mark all source URLs as already seen
    for (const source of article.sources) {
      publishedUrls.add(source.url);
    }
    // Mark titles (normalized) as already seen
    existingTitles.add(article.title.toLowerCase().trim());
  }
}

// ─── Fetch feeds (fail-open per feed) ────────────────────────────────────────

async function fetchFeed(feed: FeedConfig): Promise<FeedItem[]> {
  try {
    const response = await fetch(feed.url, {
      headers: { 'User-Agent': 'ai-guide-news-fetcher/1.0' },
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) {
      console.warn(`[WARN] ${feed.name}: HTTP ${response.status} — skipped`);
      return [];
    }
    const xml = await response.text();
    const items = parseFeed(xml, feed.name);
    console.log(`  ${feed.name}: ${items.length} items`);
    return items;
  } catch (err) {
    console.warn(`[WARN] ${feed.name}: ${(err as Error).message} — skipped`);
    return [];
  }
}

async function main(): Promise<void> {
  console.log(`Fetching ${feeds.length} feeds…`);

  const results = await Promise.all(feeds.map(fetchFeed));
  const allItems = results.flat();

  // Dedup against published + existing articles
  const freshItems = dedupeItems(allItems, publishedUrls, existingTitles);

  // Sort newest-first (nulls last), cap to MAX_ITEMS
  const sorted = freshItems
    .slice()
    .sort((a, b) => {
      if (!a.publishedAt && !b.publishedAt) return 0;
      if (!a.publishedAt) return 1;
      if (!b.publishedAt) return -1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    })
    .slice(0, MAX_ITEMS);

  // Write worklist.json
  const worklist: Worklist = {
    generatedAt: new Date().toISOString(),
    items: sorted,
  };
  const worklistPath = join(ROOT, 'scripts', 'worklist.json');
  writeFileSync(worklistPath, JSON.stringify(worklist, null, 2) + '\n');

  console.log(`\n${sorted.length} new item(s) → scripts/worklist.json`);
}

main().catch((err: unknown) => {
  console.error('[ERROR]', err);
  process.exit(1);
});
```

- [ ] **Step 6.2: Commit the runner**

```bash
git add scripts/fetch-llm-news.ts
git commit -m "feat: news feed runner script (fetch → parse → dedup → worklist)"
```

---

## Task 7: Wire npm script + final package.json update

**Files:**
- Modify: `package.json`

- [ ] **Step 7.1: Add `fetch-news` to package.json scripts**

In `/Users/Young/Desktop/claude-workspace/teamY/ai-guide/package.json`, add to the `"scripts"` block:

```json
"fetch-news": "tsx scripts/fetch-llm-news.ts"
```

The full scripts block should look like:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "type-check": "tsc --noEmit",
  "test": "jest",
  "test:watch": "jest --watch",
  "fetch-news": "tsx scripts/fetch-llm-news.ts"
},
```

- [ ] **Step 7.2: Commit package.json changes**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
git add package.json package-lock.json
git commit -m "chore: add fetch-news npm script (tsx runner)"
```

---

## Task 8: Verification gate — tsc + lint + test + build + real run

**Files:** (no changes — verification only)

- [ ] **Step 8.1: TypeScript check**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
npx tsc --noEmit 2>&1
```

Expected: zero errors (exit 0).

- [ ] **Step 8.2: ESLint**

```bash
npm run lint 2>&1 | tail -10
```

Expected: `✔ No ESLint warnings or errors` (or zero errors).

- [ ] **Step 8.3: Full test suite (all tests must pass)**

```bash
npm test -- --no-coverage 2>&1 | tail -20
```

Expected: all test suites pass including the new `news-feed.test.ts`.

- [ ] **Step 8.4: Next.js build**

```bash
npm run build 2>&1 | tail -15
```

Expected: `✓ Compiled successfully` or equivalent.

- [ ] **Step 8.5: Real network run**

```bash
npm run fetch-news 2>&1
```

Expected output format:
```
Fetching 5 feeds…
  OpenAI Blog: N items
  Google AI Blog: N items
  Hugging Face Blog: N items
  MIT Tech Review AI: N items
  VentureBeat AI: N items

N new item(s) → scripts/worklist.json
```

Note: some feeds may print `[WARN] ...: HTTP 4xx — skipped` if the URL is unreachable from your machine. This is intentional fail-open behaviour — record the actual counts in the commit message.

- [ ] **Step 8.6: Inspect the worklist**

```bash
cat /Users/Young/Desktop/claude-workspace/teamY/ai-guide/scripts/worklist.json | head -40
```

Verify `generatedAt` is a valid ISO timestamp and `items` is an array of `FeedItem` objects.

- [ ] **Step 8.7: Confirm worklist.json is gitignored**

```bash
git -C /Users/Young/Desktop/claude-workspace/teamY/ai-guide status scripts/
```

Expected: `scripts/worklist.json` does NOT appear (gitignored). `scripts/feeds.json`, `scripts/_published.json`, `scripts/fetch-llm-news.ts` DO appear as tracked.

- [ ] **Step 8.8: Final commit**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
git add -A
git commit -m "feat: LLM news RSS collection script (fetch+dedup→worklist)"
```

---

## Self-Review Checklist

### Spec coverage
| Spec Requirement | Task |
|---|---|
| `scripts/feeds.json` with 5+ real feeds | Task 2 |
| `FeedItem` type exported from `news-feed.ts` | Task 4 |
| `parseFeed(xml, sourceName)` — RSS + Atom | Task 4 |
| `dedupeItems(items, publishedUrls, existingTitles)` | Task 4 |
| Build `publishedUrls` from `_published.json` ∪ existing articles | Task 6 |
| Build `existingTitles` from existing article titles | Task 6 |
| Fetch each feed fail-open | Task 6 |
| Cap to 8 newest items | Task 6 |
| Write `scripts/worklist.json` | Task 6 |
| `"fetch-news"` npm script | Task 7 |
| `scripts/worklist.json` gitignored | Task 5 |
| `scripts/_published.json` committed as seed | Task 5 |
| `tsc + lint + test + build` all pass | Task 8 |
| Real run with actual item count reported | Task 8 |
| No `any` types | Task 4 — uses `unknown` / explicit types |
| No LLM calls | All tasks — pure fetch+parse+dedup |

### Type consistency check
- `FeedItem` defined once in `news-feed.ts`, imported in `fetch-llm-news.ts` and test — consistent.
- `parseFeed` and `dedupeItems` signatures in test imports match implementation — verified.
- `getAllNews` called with `('ko')` and `('en')` — matches `news.ts` signature `getAllNews(lang: NewsLang, root?: string)`.

### No placeholders — confirmed
No TBD/TODO/similar phrases in any code block.

---

## Concerns & Notes

1. **`__dirname` in tsx**: The script uses `__dirname` (CJS-style). Since `package.json` has no `"type": "module"`, tsx compiles in CJS mode and `__dirname` is available. If `"type": "module"` is ever added, replace with `new URL('.', import.meta.url).pathname`.

2. **Feed URL stability**: OpenAI's blog RSS has changed URLs over time (`/blog/rss.xml` is now `/news/rss/`). If the real run shows a 404 for OpenAI, update the URL in `feeds.json`.

3. **`tsc --noEmit` and scripts/**: The root `tsconfig.json` includes `**/*.ts`, so `scripts/fetch-llm-news.ts` is included. Because it uses `__dirname` (CJS global), this is fine under the current config. The `moduleResolution: "bundler"` setting may flag some node: imports — watch for TS errors in Step 8.1 and adjust if needed.

4. **jest environment**: Tests run in `jsdom` (the project default). `fast-xml-parser` has no DOM dependencies, so jsdom/node both work. If future tests need Node builtins, add `@jest-environment node` docblock to the test file.

5. **Rate limiting on public feeds**: The real run fetches 5 feeds once. No throttling needed for a one-shot script. For a cron-scheduled version, add delays between requests.
