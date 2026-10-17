/**
 * @jest-environment node
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  classifyGenerationRun,
  validateGeneratedPair,
  quarantineInvalidArticles,
  validateNewsMarkdown,
} from '@/lib/news-validate';

const VALID_KO = `---
title: "유효한 기사"
lang: ko
date: 2026-09-28
slug: valid-article
summary: "요약"
tags: ["AI"]
sources:
  - title: "출처"
    url: https://example.com/a
---
본문입니다.
`;

const VALID_EN = VALID_KO.replace('lang: ko', 'lang: en').replace('유효한 기사', 'Valid article');

const DUPLICATED_URL = `---
title: "깨진 기사"
lang: ko
date: 2026-09-28
slug: broken-article
summary: "요약"
tags: ["AI"]
sources:
  - title: "출처"
    url: https://example.com/a
    url: https://example.com/b
---
본문입니다.
`;

describe('validateNewsMarkdown', () => {
  it('accepts a well-formed article', () => {
    const result = validateNewsMarkdown(VALID_KO);
    expect(result.ok).toBe(true);
  });

  it('rejects frontmatter with a duplicated url key (the 2026-09-28 incident)', () => {
    const result = validateNewsMarkdown(DUPLICATED_URL);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/duplicated mapping key/i);
  });

  it('rejects a missing lang with the same error the build would throw', () => {
    const result = validateNewsMarkdown(VALID_KO.replace('lang: ko\n', ''));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/'lang' must be a string/);
  });

  it('rejects a file with no frontmatter block', () => {
    expect(validateNewsMarkdown('just text').ok).toBe(false);
  });

  it('rejects a source entry that has no url', () => {
    const result = validateNewsMarkdown(VALID_KO.replace('    url: https://example.com/a\n', ''));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/'sources\[\]\.url' must be a string/);
  });

  it('tolerates an extra, harmless key on a source entry (4 published articles carry one)', () => {
    const extra = VALID_KO.replace('    url: https://example.com/a', '    url: https://example.com/a\n    source: example.com');
    expect(validateNewsMarkdown(extra).ok).toBe(true);
  });

  it('rejects when the declared lang differs from the expected one', () => {
    const result = validateNewsMarkdown(VALID_KO, 'en');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/lang 'ko' does not match directory 'en'/);
  });
});

describe('quarantineInvalidArticles', () => {
  let tmp: string;
  let newsRoot: string;
  let quarantineRoot: string;

  const write = (lang: string, name: string, body: string): string => {
    const dir = path.join(newsRoot, lang);
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, name);
    fs.writeFileSync(file, body);
    return file;
  };

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-guide-quarantine-'));
    newsRoot = path.join(tmp, 'news');
    quarantineRoot = path.join(tmp, '_quarantine');
  });

  afterEach(() => {
    if (tmp.startsWith(os.tmpdir())) fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('moves only invalid files and leaves the rest in place', () => {
    const good = write('ko', '2026-09-28-valid-article.md', VALID_KO);
    const goodEn = write('en', '2026-09-28-valid-article.md', VALID_EN);
    const bad = write('ko', '2026-09-28-broken-article.md', DUPLICATED_URL);

    const report = quarantineInvalidArticles([good, goodEn, bad], { newsRoot, quarantineRoot });

    expect(report.quarantined.map((q) => q.file)).toEqual(['ko/2026-09-28-broken-article.md']);
    expect(fs.existsSync(bad)).toBe(false);
    expect(fs.existsSync(path.join(quarantineRoot, 'ko', '2026-09-28-broken-article.md'))).toBe(true);
    expect(fs.existsSync(good)).toBe(true);
    expect(fs.existsSync(goodEn)).toBe(true);
    expect(report.kept).toBe(2);
  });

  it('takes the translation partner along so hreflang pairs never split', () => {
    const bad = write('ko', '2026-09-28-pair.md', DUPLICATED_URL);
    const partner = write('en', '2026-09-28-pair.md', VALID_EN);

    const report = quarantineInvalidArticles([bad, partner], { newsRoot, quarantineRoot });

    expect(report.quarantined.map((q) => q.file).sort()).toEqual([
      'en/2026-09-28-pair.md',
      'ko/2026-09-28-pair.md',
    ]);
    expect(fs.existsSync(partner)).toBe(false);
  });

  it('records the reason so a quarantined file can be repaired later', () => {
    const bad = write('ko', '2026-09-28-broken-article.md', DUPLICATED_URL);
    quarantineInvalidArticles([bad], { newsRoot, quarantineRoot });
    const log = fs.readFileSync(path.join(quarantineRoot, 'QUARANTINE.log'), 'utf8');
    expect(log).toMatch(/ko\/2026-09-28-broken-article\.md\t.*duplicated mapping key/i);
  });

  it('is a no-op for an empty candidate list', () => {
    const report = quarantineInvalidArticles([], { newsRoot, quarantineRoot });
    expect(report).toEqual({ quarantined: [], kept: 0 });
  });
});

describe('classifyGenerationRun', () => {
  it('is ok when at least one pair was written', () => {
    expect(classifyGenerationRun({ written: 2, failed: 1, skipped: 0 })).toEqual({
      exitCode: 0,
      label: 'ok',
    });
  });

  it('is "nothing new" (exit 1) when everything was a duplicate', () => {
    expect(classifyGenerationRun({ written: 0, failed: 0, skipped: 3 })).toEqual({
      exitCode: 1,
      label: 'nothing-new',
    });
  });

  it('is "failed" (exit 2) when items were attempted but none could be written', () => {
    expect(classifyGenerationRun({ written: 0, failed: 3, skipped: 0 })).toEqual({
      exitCode: 2,
      label: 'generation-failed',
    });
  });
});

describe('validateGeneratedPair', () => {
  const pair = { slug: 'valid-article', ko: VALID_KO, en: VALID_EN };

  it('accepts a matching ko/en pair', () => {
    expect(validateGeneratedPair(pair)).toEqual({ ok: true });
  });

  it('rejects a pair whose ko side has a duplicated url (nothing may be written)', () => {
    const result = validateGeneratedPair({ ...pair, ko: DUPLICATED_URL.replace('broken-article', 'valid-article') });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/^ko: .*duplicated mapping key/i);
  });

  it('rejects when the en side is broken', () => {
    const result = validateGeneratedPair({ ...pair, en: 'no frontmatter' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/^en: /);
  });

  it('rejects a slug that could escape the content directory', () => {
    const result = validateGeneratedPair({ ...pair, slug: '../../evil' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/unsafe slug/);
  });

  it('rejects when the frontmatter slug differs from the file slug (hreflang key)', () => {
    const result = validateGeneratedPair({ ...pair, slug: 'other-slug' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/frontmatter slug 'valid-article' does not match 'other-slug'/);
  });
});
