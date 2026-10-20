import fs from 'node:fs';
import path from 'node:path';

export type ExpectedGroups = Record<string, string[]>;

export type GroupResult = {
  name: string;
  expected: number;
  found: number;
  missing: string[];
};

export type AuditReport = {
  ok: boolean;
  sitemapCount: number;
  groups: GroupResult[];
  unexpected: string[];
  duplicates: string[];
};

/**
 * `page.tsx` 가 있는 디렉터리를 URL 경로로 바꾼다. 동적 세그먼트(`[slug]`)가 낀 경로는
 * 데이터에서 따로 펼치므로 제외하고, 라우트 그룹 `(site)` 는 기준 디렉터리로 잘라낸다.
 */
export function discoverStaticRoutes(baseDir: string): string[] {
  const routes: string[] = [];
  const walk = (dir: string, segments: string[]): void => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('[')) walk(path.join(dir, entry.name), [...segments, entry.name]);
      } else if (entry.name === 'page.tsx') {
        routes.push(segments.length ? `/${segments.join('/')}` : '');
      }
    }
  };
  walk(baseDir, []);
  return routes.sort();
}

export function auditSitemap(sitemapUrls: string[], expected: ExpectedGroups): AuditReport {
  const present = new Set(sitemapUrls);
  const claimed = new Set<string>();

  const groups = Object.entries(expected).map(([name, urls]): GroupResult => {
    urls.forEach((url) => claimed.add(url));
    const missing = urls.filter((url) => !present.has(url));
    return { name, expected: urls.length, found: urls.length - missing.length, missing };
  });

  const unexpected = Array.from(present).filter((url) => !claimed.has(url));
  const duplicates = sitemapUrls.filter((url, index) => sitemapUrls.indexOf(url) !== index);
  const ok =
    groups.every((group) => group.missing.length === 0) &&
    unexpected.length === 0 &&
    duplicates.length === 0;

  return { ok, sitemapCount: sitemapUrls.length, groups, unexpected, duplicates };
}

export function formatAuditReport(report: AuditReport): string {
  const lines = ['sitemap URL 수: ' + report.sitemapCount];
  for (const group of report.groups) {
    lines.push(`  ${group.name.padEnd(10)} ${group.found}/${group.expected}`);
  }
  for (const group of report.groups) {
    group.missing.forEach((url) => lines.push(`WARN missing ${group.name}: ${url}`));
  }
  report.unexpected.forEach((url) => lines.push(`WARN unexpected (실제 페이지 없음): ${url}`));
  report.duplicates.forEach((url) => lines.push(`WARN duplicate: ${url}`));
  lines.push(report.ok ? 'SITEMAP AUDIT: OK' : 'SITEMAP AUDIT: FAIL');
  return lines.join('\n');
}
