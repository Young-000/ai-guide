/**
 * @jest-environment node
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  auditSitemap,
  discoverStaticRoutes,
  formatAuditReport,
  type ExpectedGroups,
} from '../sitemap-audit';

describe('discoverStaticRoutes', () => {
  let appDir: string;

  beforeEach(() => {
    appDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sitemap-audit-'));
    const touch = (rel: string): void => {
      const file = path.join(appDir, rel);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, '');
    };
    touch('(site)/page.tsx');
    touch('(site)/about/page.tsx');
    touch('(site)/onboarding/result/page.tsx');
    touch('(site)/tools/page.tsx');
    touch('(site)/tools/[slug]/page.tsx');
    touch('(site)/news/archive/[year]/[month]/page.tsx');
    touch('api/health/route.ts');
    touch('embed/ai-news/page.tsx');
  });

  afterEach(() => {
    if (appDir.startsWith(os.tmpdir())) fs.rmSync(appDir, { recursive: true, force: true });
  });

  it('collects page.tsx paths under (site) as URL paths, skipping dynamic segments', () => {
    expect(discoverStaticRoutes(path.join(appDir, '(site)'))).toEqual([
      '',
      '/about',
      '/onboarding/result',
      '/tools',
    ]);
  });
});

describe('auditSitemap', () => {
  const expected: ExpectedGroups = {
    static: ['https://x.test/a', 'https://x.test/b'],
    news: ['https://x.test/news/1'],
  };

  it('passes when every expected URL is present and nothing extra', () => {
    const report = auditSitemap(
      ['https://x.test/a', 'https://x.test/b', 'https://x.test/news/1'],
      expected,
    );
    expect(report.ok).toBe(true);
    expect(report.groups.map((g) => [g.name, g.expected, g.found])).toEqual([
      ['static', 2, 2],
      ['news', 1, 1],
    ]);
  });

  it('reports missing URLs per group and fails', () => {
    const report = auditSitemap(['https://x.test/a', 'https://x.test/news/1'], expected);
    expect(report.ok).toBe(false);
    expect(report.groups[0].missing).toEqual(['https://x.test/b']);
    expect(report.groups[1].missing).toEqual([]);
  });

  it('reports sitemap URLs that no group expects, and duplicates', () => {
    const report = auditSitemap(
      ['https://x.test/a', 'https://x.test/b', 'https://x.test/news/1', 'https://x.test/ghost', 'https://x.test/a'],
      expected,
    );
    expect(report.ok).toBe(false);
    expect(report.unexpected).toEqual(['https://x.test/ghost']);
    expect(report.duplicates).toEqual(['https://x.test/a']);
  });

  it('formats a report with counts and a warning line for each missing URL', () => {
    const text = formatAuditReport(auditSitemap(['https://x.test/a'], expected));
    expect(text).toContain('static');
    expect(text).toContain('1/2');
    expect(text).toContain('WARN missing static: https://x.test/b');
    expect(text).toContain('SITEMAP AUDIT: FAIL');
  });
});
