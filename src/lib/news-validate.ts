import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { toFrontmatter } from './news';
import type { NewsFrontmatter, NewsLang } from '../types/news';

const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const LANGS: NewsLang[] = ['ko', 'en'];

export type ValidationResult =
  | { ok: true; frontmatter: NewsFrontmatter }
  | { ok: false; reason: string };

export type QuarantineEntry = { file: string; reason: string };

export type QuarantineReport = { quarantined: QuarantineEntry[]; kept: number };

export type QuarantineOptions = {
  newsRoot: string;
  quarantineRoot: string;
  now?: () => Date;
};

export type RunCounts = { written: number; failed: number; skipped: number };

export type RunVerdict = {
  exitCode: 0 | 1 | 2;
  label: 'ok' | 'nothing-new' | 'generation-failed';
};

/** The slug becomes a file name, so it must not be able to carry a path. */
export function isSafeSlug(slug: string): boolean {
  return SAFE_SLUG.test(slug);
}

function firstLine(message: string): string {
  return message.split('\n')[0];
}

/**
 * Checks an article with the same rules the site build applies, so a file that passes
 * here cannot break `next build`. gray-matter (js-yaml) already rejects duplicated
 * mapping keys, which is what poisoned the build on 2026-09-28. The empty options object
 * bypasses gray-matter's content cache, which would otherwise hand back data={} for a
 * second parse of the same broken text instead of throwing again.
 */
export function validateNewsMarkdown(raw: string, expectedLang?: NewsLang): ValidationResult {
  if (!raw.trimStart().startsWith('---')) {
    return { ok: false, reason: 'no frontmatter block' };
  }
  try {
    const data = matter(raw, {}).data as Record<string, unknown>;
    if (Object.keys(data).length === 0) return { ok: false, reason: 'empty frontmatter' };
    const frontmatter = toFrontmatter(data);
    if (expectedLang && frontmatter.lang !== expectedLang) {
      return {
        ok: false,
        reason: `lang '${frontmatter.lang}' does not match directory '${expectedLang}'`,
      };
    }
    return { ok: true, frontmatter };
  } catch (err) {
    return { ok: false, reason: firstLine(err instanceof Error ? err.message : String(err)) };
  }
}

export type GeneratedPair = { slug: string; ko: string; en: string };

/**
 * 제목만 보고 쓴 기사는 본문이 스스로 그렇게 말한다 (2026-10-25 실측: "현재 확인 가능한 정보는 보도 제목과
 * 요약 수준이며", "원문에서 확인이 필요하다"). 원문을 읽지 않고 다시 쓴 페이지라 AdSense 가 "가치가 별로 없는
 * 콘텐츠"로 보는 바로 그 형태다. 생성 단계에서만 막는다 — 이미 발행된 기사의 처리는 조정자 결정(docs/BACKLOG.md).
 */
const HEADLINE_ONLY_ADMISSION: Record<NewsLang, RegExp> = {
  ko: /보도 제목(과|만)|제목과 요약 수준|원문에서 (세부 내용을 |추가로? )?확인이 필요/,
  en: /(beyond|than) the headline|only the headline|headline and (a )?(brief )?summary/i,
};

export type PairVerdict = { ok: true } | { ok: false; reason: string };

/**
 * Gate for the generator: nothing is written to disk unless both sides pass the build's
 * own rules, so a poisoned file can never be created in the first place.
 */
export function validateGeneratedPair(pair: GeneratedPair): PairVerdict {
  if (!isSafeSlug(pair.slug)) return { ok: false, reason: `unsafe slug '${pair.slug}'` };
  for (const lang of LANGS) {
    const result = validateNewsMarkdown(pair[lang], lang);
    if (!result.ok) return { ok: false, reason: `${lang}: ${result.reason}` };
    if (HEADLINE_ONLY_ADMISSION[lang].test(pair[lang])) {
      return { ok: false, reason: `${lang}: body says it was written from the headline only` };
    }
    if (result.frontmatter.slug !== pair.slug) {
      return {
        ok: false,
        reason: `${lang}: frontmatter slug '${result.frontmatter.slug}' does not match '${pair.slug}'`,
      };
    }
  }
  return { ok: true };
}

function langOf(file: string): NewsLang | null {
  const dirName = path.basename(path.dirname(file));
  return LANGS.find((lang) => lang === dirName) ?? null;
}

function otherLang(lang: NewsLang): NewsLang {
  return lang === 'ko' ? 'en' : 'ko';
}

function uniqueDestination(dir: string, name: string): string {
  const target = path.join(dir, name);
  if (!fs.existsSync(target)) return target;
  return path.join(dir, `${Date.now()}-${name}`);
}

function moveFile(source: string, target: string): void {
  try {
    fs.renameSync(source, target);
  } catch {
    // rename fails across devices; copy + unlink keeps the move semantic.
    fs.copyFileSync(source, target);
    fs.unlinkSync(source);
  }
}

function findInvalid(files: string[]): Map<string, string> {
  const invalid = new Map<string, string>();
  for (const file of files) {
    const lang = langOf(file);
    if (!lang) {
      invalid.set(file, 'file is not under a ko/ or en/ directory');
      continue;
    }
    const result = validateNewsMarkdown(fs.readFileSync(file, 'utf8'), lang);
    if (!result.ok) invalid.set(file, result.reason);
  }
  return invalid;
}

function addPartners(invalid: Map<string, string>, candidates: string[]): void {
  const candidateSet = new Set(candidates);
  for (const file of Array.from(invalid.keys())) {
    const lang = langOf(file);
    if (!lang) continue;
    const partner = path.join(path.dirname(path.dirname(file)), otherLang(lang), path.basename(file));
    if (candidateSet.has(partner) && !invalid.has(partner) && fs.existsSync(partner)) {
      invalid.set(partner, `translation partner of ${lang}/${path.basename(file)}`);
    }
  }
}

/**
 * Moves every invalid candidate (plus its translation partner, so hreflang pairs never
 * split) out of the content tree into the quarantine directory. Nothing is deleted.
 * Candidates are only the files a publish run just produced, never the published tree.
 */
export function quarantineInvalidArticles(
  files: string[],
  options: QuarantineOptions,
): QuarantineReport {
  const invalid = findInvalid(files);
  addPartners(invalid, files);

  const quarantined: QuarantineEntry[] = [];
  const now = (options.now ?? (() => new Date()))().toISOString();
  for (const [file, reason] of Array.from(invalid.entries())) {
    const lang = langOf(file) ?? 'ko';
    const dir = path.join(options.quarantineRoot, lang);
    fs.mkdirSync(dir, { recursive: true });
    moveFile(file, uniqueDestination(dir, path.basename(file)));
    const id = `${lang}/${path.basename(file)}`;
    fs.appendFileSync(path.join(options.quarantineRoot, 'QUARANTINE.log'), `${now}\t${id}\t${reason}\n`);
    quarantined.push({ file: id, reason });
  }
  return { quarantined, kept: files.length - quarantined.length };
}

/**
 * Separates "no news today" from "every generation attempt failed". The 10/5-10/8 break
 * exited 0 with "nothing to publish" while the claude CLI was erroring on every item.
 */
export function classifyGenerationRun(counts: RunCounts): RunVerdict {
  if (counts.written > 0) return { exitCode: 0, label: 'ok' };
  if (counts.failed > 0) return { exitCode: 2, label: 'generation-failed' };
  return { exitCode: 1, label: 'nothing-new' };
}
