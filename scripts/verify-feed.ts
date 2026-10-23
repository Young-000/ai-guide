/**
 * RSS 피드 최신성 감사: buildRssXml 출력이 최근 발행 기사를 담고 있고 최신 pubDate 가 낡지 않았는지 본다.
 *
 *   node --import tsx scripts/verify-feed.ts      # npm run verify:feed
 *
 * 항목 수와 최신 pubDate 를 ko/en 각각 리포트한다. 하나라도 어긋나면 exit 1.
 */
import { getAllNews } from '../src/lib/news';
import { buildRssXml } from '../src/lib/rss';
import { auditFeed, formatFeedReport } from '../src/lib/feed-audit';

const RECENT_COUNT = 10;
const MAX_AGE_DAYS = 3;
const LANGS = ['ko', 'en'] as const;

const reports = LANGS.map((lang) => {
  const expectedSlugs = getAllNews(lang)
    .slice(0, RECENT_COUNT)
    .map((a) => a.slug);
  const report = auditFeed(buildRssXml(lang), expectedSlugs, {
    now: new Date(),
    maxAgeDays: MAX_AGE_DAYS,
  });
  console.log(formatFeedReport(lang, report));
  return report;
});

process.exit(reports.every((r) => r.ok) ? 0 : 1);
