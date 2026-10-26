import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseFeed } from '../src/lib/news-feed';
import { countSourceSubstanceBySource } from '../src/lib/news-source';

type FeedConfig = { name: string; url: string };

const ROOT = join(__dirname, '..');
const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'application/rss+xml,application/xml;q=0.9,*/*;q=0.8',
};

/** 읽은 항목 수와 원문 통과 수. 요청이 실패하면 사유를 돌려준다 (통과 0과 구분). */
async function auditFeed(feed: FeedConfig): Promise<string> {
  try {
    const response = await fetch(feed.url, { headers: HEADERS, signal: AbortSignal.timeout(20_000) });
    if (!response.ok) return `HTTP ${response.status}`;
    const items = parseFeed(await response.text(), feed.name);
    const [count] = countSourceSubstanceBySource(items);
    return count ? `${count.passing}/${count.total}` : '0/0 (파싱 0)';
  } catch (err) {
    return `실패: ${(err as Error).message}`;
  }
}

async function main(): Promise<void> {
  const feeds = JSON.parse(readFileSync(join(ROOT, 'scripts', 'feeds.json'), 'utf-8')) as FeedConfig[];
  const results = await Promise.all(feeds.map(auditFeed));
  console.log('| 피드 | 원문 통과/전체 |\n|---|---|');
  feeds.forEach((feed, index) => console.log(`| ${feed.name} | ${results[index]} |`));
}

main().catch((err: unknown) => {
  console.error('[ERROR]', err);
  process.exit(1);
});
