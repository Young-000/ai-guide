import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { getAllNews } from '../src/lib/news';
import { parseFeed, dedupeItems } from '../src/lib/news-feed';
import type { FeedItem } from '../src/lib/news-feed';
import {
  fetchTrendingKeywords,
  isAiRelatedKeyword,
} from '../src/lib/trending';

// ─── Types ────────────────────────────────────────────────────────────────────

type FeedConfig = { name: string; url: string };
type PublishedState = { urls: string[] };
type TrendingSeed = { keyword: string; rank: number };
type Worklist = {
  generatedAt: string;
  items: FeedItem[];
  trendingSeeds: TrendingSeed[];
};

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
    for (const source of article.sources) {
      publishedUrls.add(source.url);
    }
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

// ─── Trending seeds (optional, fail-open) ─────────────────────────────────────
//
// Pulls the latest KR trending search keywords from the shared search_trends DB
// and keeps only AI-related ones as article-topic candidates. Never blocks the
// pipeline: any failure (missing SUPABASE_* env, DB down) yields [].
async function fetchTrendingSeeds(): Promise<TrendingSeed[]> {
  try {
    const keywords = await fetchTrendingKeywords(20);
    return keywords
      .filter((k) => isAiRelatedKeyword(k.keyword))
      .map((k) => ({ keyword: k.keyword, rank: k.rank }));
  } catch (err) {
    console.warn(`[WARN] trending seeds skipped: ${(err as Error).message}`);
    return [];
  }
}

async function main(): Promise<void> {
  console.log(`Fetching ${feeds.length} feeds…`);

  const results = await Promise.all(feeds.map(fetchFeed));
  const allItems = results.flat();

  const trendingSeeds = await fetchTrendingSeeds();
  if (trendingSeeds.length > 0) {
    console.log(`  trending seeds (AI-related): ${trendingSeeds.length}`);
  }

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
    trendingSeeds,
  };
  const worklistPath = join(ROOT, 'scripts', 'worklist.json');
  writeFileSync(worklistPath, JSON.stringify(worklist, null, 2) + '\n');

  console.log(`\n${sorted.length} new item(s) → scripts/worklist.json`);
}

main().catch((err: unknown) => {
  console.error('[ERROR]', err);
  process.exit(1);
});
