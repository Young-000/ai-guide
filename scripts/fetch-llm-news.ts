import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { getAllNews } from '../src/lib/news';
import { parseFeed, dedupeItems } from '../src/lib/news-feed';
import type { FeedItem } from '../src/lib/news-feed';
import {
  fetchTrendingKeywords,
  isAiRelatedKeyword,
} from '../src/lib/trending';
import { withRetry, isRetryableStatus } from '../src/lib/retry';

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

// 소스 하나당 재시도 예산. 일시적 5xx·타임아웃·연결 끊김이 그 소스를 통째로
// 날려버리던 것이 간헐적 수집 실패의 주원인이었다.
const FETCH_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 1_000;

// RSS 수집분이 이 수에 못 미치면 스크래핑으로 보강한다. 예전에는 "전부 0"일 때만
// 폴백해서, 피드 8개 중 1개만 살아남아도 빈약한 결과로 그냥 진행됐다.
const MIN_ITEMS_BEFORE_SCRAPE = 5;

// Browser-like headers to avoid 403 blocks
const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8',
  'Cache-Control': 'no-cache',
};

// Sites to scrape when all RSS feeds fail
const SCRAPE_SITES: Array<{ name: string; url: string }> = [
  { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/' },
  { name: 'The Verge AI', url: 'https://www.theverge.com/ai-artificial-intelligence' },
  { name: 'ArsTechnica AI', url: 'https://arstechnica.com/ai/' },
  { name: 'Wired AI', url: 'https://www.wired.com/tag/artificial-intelligence/' },
];

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

/** HTTP 상태를 그대로 실어 던져, 재시도할지 여부를 호출측이 판단할 수 있게 한다. */
class HttpStatusError extends Error {
  constructor(readonly status: number) {
    super(`HTTP ${status}`);
    this.name = 'HttpStatusError';
  }
}

/** 4xx(404·403 등)는 재시도해도 그대로다. 5xx·429·네트워크 오류만 다시 시도한다. */
function isTransient(error: unknown): boolean {
  if (error instanceof HttpStatusError) return isRetryableStatus(error.status);
  return true; // 타임아웃·연결 끊김 등 fetch 자체가 던진 오류
}

async function fetchText(url: string, timeoutMs: number, label: string): Promise<string> {
  return withRetry(
    async () => {
      const response = await fetch(url, {
        headers: BROWSER_HEADERS,
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!response.ok) throw new HttpStatusError(response.status);
      return response.text();
    },
    {
      retries: FETCH_RETRIES,
      baseDelayMs: RETRY_BASE_DELAY_MS,
      shouldRetry: isTransient,
      onRetry: (error, attempt, delayMs) => {
        console.warn(
          `  [RETRY] ${label}: ${(error as Error).message} — ${delayMs}ms 후 재시도 (${attempt + 1}/${FETCH_RETRIES})`,
        );
      },
    },
  );
}

async function fetchFeed(feed: FeedConfig): Promise<FeedItem[]> {
  try {
    const xml = await fetchText(feed.url, 15_000, feed.name);
    const items = parseFeed(xml, feed.name);
    console.log(`  ${feed.name}: ${items.length} items`);
    return items;
  } catch (err) {
    console.warn(`[WARN] ${feed.name}: ${(err as Error).message} — skipped`);
    return [];
  }
}

/** Extracts article links from an HTML page when RSS feeds are unavailable. */
function extractLinksFromHtml(html: string, sourceName: string, baseUrl: string): FeedItem[] {
  const items: FeedItem[] = [];
  const seen = new Set<string>();
  const base = new URL(baseUrl);

  // Match <a href="...">visible text</a> — title must be 15~200 chars
  const linkRegex = /<a[^>]+href="([^"#?][^"]*)"[^>]*>\s*([^<]{15,200}?)\s*<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(html)) !== null) {
    let href = match[1].trim();
    const title = match[2].trim().replace(/\s+/g, ' ');

    if (!title || title.length < 15) continue;

    // Resolve relative URLs
    if (href.startsWith('/')) href = `${base.origin}${href}`;
    if (!href.startsWith('http')) continue;

    // Only keep URLs that look like dated articles (contain /20YY/)
    if (!/\/20\d{2}\//.test(href)) continue;

    // Skip pagination, category, and asset URLs
    if (/\.(jpg|png|gif|css|js|svg|webp)$/i.test(href)) continue;
    if (/\/page\/\d+/.test(href)) continue;

    if (seen.has(href)) continue;
    seen.add(href);

    items.push({
      source: sourceName,
      title,
      url: href,
      publishedAt: null,
      summary: null,
    });
  }

  return items;
}

async function scrapeSite(site: { name: string; url: string }): Promise<FeedItem[]> {
  try {
    const html = await fetchText(site.url, 20_000, `${site.name} (scrape)`);
    const items = extractLinksFromHtml(html, site.name, site.url);
    console.log(`  ${site.name} (scrape): ${items.length} links`);
    return items;
  } catch (err) {
    console.warn(`[WARN] ${site.name} (scrape): ${(err as Error).message} — skipped`);
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
  let allItems = results.flat();

  // 소스별 성패를 집계해 남긴다. 예전에는 개별 [WARN]만 흩어져 있어서
  // "8개 중 7개가 죽은 채 근근이 도는 상태"가 로그상 정상처럼 보였다.
  const deadFeeds = results.filter((items) => items.length === 0).length;
  if (deadFeeds > 0) {
    console.warn(`[WARN] RSS 소스 ${feeds.length}개 중 ${deadFeeds}개 실패 (수집 ${allItems.length}건)`);
  }

  // 폴백: RSS 수집분이 임계치에 못 미치면 HTML 스크래핑으로 보강한다.
  if (allItems.length < MIN_ITEMS_BEFORE_SCRAPE) {
    console.log(
      `\nRSS 수집 ${allItems.length}건 < 임계치 ${MIN_ITEMS_BEFORE_SCRAPE} — HTML 스크래핑으로 보강…`,
    );
    const scrapeResults = await Promise.all(SCRAPE_SITES.map(scrapeSite));
    allItems = allItems.concat(scrapeResults.flat());
  }

  // 모든 경로가 죽었으면 조용히 0건으로 끝내지 않는다 — 워크플로가 실패로 알아채야 한다.
  if (allItems.length === 0) {
    throw new Error('RSS·스크래핑 전 경로에서 0건 수집 — 수집 계층 전면 장애');
  }

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
