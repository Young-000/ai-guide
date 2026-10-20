/**
 * sitemap.xml 커버리지 감사: sitemap.ts 가 내놓는 URL 을 "실제 페이지"와 대조한다.
 *
 *   tsx scripts/verify-sitemap.ts      # npm run verify:sitemap
 *
 * 기대 URL 은 sitemap.ts 와 별개로 구한다 — 정적 페이지는 app 디렉터리의 page.tsx 에서,
 * 나머지는 콘텐츠(JSON·기사 파일)에서. 누락·유령 URL·중복이 하나라도 있으면 exit 1.
 */
import fs from 'node:fs';
import path from 'node:path';
import situationsData from '../src/data/situations.json';
import toolsData from '../src/data/tools.json';
import useCasesData from '../src/data/use-cases.json';
import tipsData from '../src/data/tips.json';
import sitemap from '../src/app/sitemap';
import { getAllNews, getArchiveMonths, getTagsWithCount, MIN_TAG_ARTICLE_COUNT_FOR_INDEX } from '../src/lib/news';
import { SECTION_IDS } from '../src/lib/news-sections';
import { BASE_URL } from '../src/lib/site';
import {
  auditSitemap,
  discoverStaticRoutes,
  formatAuditReport,
  type ExpectedGroups,
} from '../src/lib/sitemap-audit';

const ROOT = path.resolve(__dirname, '..');
const SITE_DIR = path.join(ROOT, 'src', 'app', '(site)');
const NEWS_ROOT = path.join(ROOT, 'src', 'content', 'news');

// 방문자별 상태로만 의미가 있는 페이지 — 색인할 고유 내용이 없어 sitemap 에서 의도적으로 뺀다.
const SITEMAP_EXEMPT_ROUTES = new Set(['/my-progress', '/onboarding/result']);

function slugUrls(prefix: string, items: { slug: string }[]): string[] {
  return items.map((item) => `${BASE_URL}${prefix}/${item.slug}`);
}

function buildExpected(): ExpectedGroups {
  const staticRoutes = discoverStaticRoutes(SITE_DIR)
    .filter((route) => !SITEMAP_EXEMPT_ROUTES.has(route))
    .map((route) => `${BASE_URL}${route}`);

  return {
    static: staticRoutes,
    situations: slugUrls('/situations', situationsData.situations),
    tools: slugUrls('/tools', toolsData.tools),
    useCases: slugUrls('/use-cases', useCasesData.useCases),
    tips: slugUrls('/tips', tipsData.tips),
    newsKo: getAllNews('ko').map((n) => `${BASE_URL}/news/${n.slug}`),
    newsEn: getAllNews('en').map((n) => `${BASE_URL}/en/news/${n.slug}`),
    sections: SECTION_IDS.flatMap((id) => [
      `${BASE_URL}/news/section/${id}`,
      `${BASE_URL}/en/news/section/${id}`,
    ]),
    topics: getTagsWithCount('ko')
      .filter((t) => t.count >= MIN_TAG_ARTICLE_COUNT_FOR_INDEX)
      .map((t) => `${BASE_URL}/news/topic/${encodeURIComponent(t.tag)}`),
    archive: getArchiveMonths('ko').map(({ year, month }) => `${BASE_URL}/news/archive/${year}/${month}`),
  };
}

// 기사 파일 수 ≠ 파싱된 기사 수면, 깨진 frontmatter 때문에 조용히 빠진 기사가 있다는 뜻이다.
function articleFileMismatches(): string[] {
  return (['ko', 'en'] as const).flatMap((lang) => {
    const files = fs.readdirSync(path.join(NEWS_ROOT, lang)).filter((f) => f.endsWith('.md')).length;
    const parsed = getAllNews(lang).length;
    return files === parsed ? [] : [`WARN ${lang} 기사 파일 ${files}개 중 ${parsed}개만 파싱됨 (sitemap 누락 위험)`];
  });
}

// 같은 slug 를 쓴 기사 파일: 페이지는 하나뿐이라 나머지는 가려진다 (실패로 치지 않고 알린다).
function duplicateSlugWarnings(): string[] {
  return (['ko', 'en'] as const).flatMap((lang) => {
    const slugs = getAllNews(lang).map((n) => n.slug);
    const dupes = Array.from(new Set(slugs.filter((s, i) => slugs.indexOf(s) !== i)));
    return dupes.length ? [`NOTE ${lang} 중복 slug ${dupes.length}개 (가려진 기사 있음): ${dupes.join(', ')}`] : [];
  });
}

const report = auditSitemap(
  sitemap().map((entry) => entry.url),
  buildExpected(),
);
const mismatches = articleFileMismatches();

console.log(formatAuditReport(report));
mismatches.forEach((line) => console.log(line));
duplicateSlugWarnings().forEach((line) => console.log(line));
process.exit(report.ok && mismatches.length === 0 ? 0 : 1);
