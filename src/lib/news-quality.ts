import matter from 'gray-matter';
import type { NewsLang } from '../types/news';

/**
 * 발행 품질 문턱 (2026-11-02, AdSense "가치가 별로 없는 콘텐츠" 대응).
 *
 * 근거(2026-11-02 실측): 최근 7일 발행 27건(하루 평균 3.9건, 최대 9건)은 전부 출처 1개였고, 한국어 본문(공백 제외,
 * 출처 목록 제외) 중앙값 329자, 영어 본문 중앙값 146단어였다. 문턱은 이 중앙값의 두 배 이상으로 잡았다.
 * - dailyLimit 2: 출처 2개 이상 + 장문 조건을 통과하는 사건은 하루 한두 건이 한계이고, 광고 검수는 양이 아니라
 *   "지속적인 큐레이션"을 본다. 환경변수 NEWS_DAILY_LIMIT 로 바꾼다(0 = 발행 중지).
 * - runLimit 2: 한 회차 상한. 하루 상한이 먼저 닿는다.
 */
export const NEWS_QUALITY = {
  dailyLimit: 2,
  runLimit: 2,
  minSources: 2,
  minKoBodyChars: 800,
  minEnWords: 350,
} as const;

export type QualityVerdict = { ok: true } | { ok: false; reason: string };

export type QualityRules = {
  /** 모델에 넘긴 출처 URL. 이 밖의 URL 을 인용한 기사는 거절한다. */
  allowedSourceUrls: string[];
  minSources?: number;
  minKoBodyChars?: number;
  minEnWords?: number;
};

const SOURCE_SECTION = /^###\s*(?:더 보기|(?:Read more|More|Sources)\b)[\s\S]*$/m;

export function resolveDailyLimit(env: Record<string, string | undefined> = process.env): number {
  const raw = env.NEWS_DAILY_LIMIT;
  if (raw === undefined || !/^\d+$/.test(raw.trim())) return NEWS_QUALITY.dailyLimit;
  return Number(raw.trim());
}

/** 본문(프론트매터와 출처 목록 제외). */
function bodyOf(markdown: string): string {
  return matter(markdown, {}).content.replace(SOURCE_SECTION, '');
}

export function koBodyChars(markdown: string): number {
  return bodyOf(markdown).replace(/\s+/g, '').length;
}

export function enBodyWords(markdown: string): number {
  return bodyOf(markdown).split(/\s+/).filter(Boolean).length;
}

function citedUrls(markdown: string): string[] {
  const sources = matter(markdown, {}).data.sources;
  if (!Array.isArray(sources)) return [];
  return sources
    .map((source) => (source as { url?: unknown } | null)?.url)
    .filter((url): url is string => typeof url === 'string');
}

function checkSources(lang: NewsLang, markdown: string, rules: Required<QualityRules>): QualityVerdict {
  const urls = citedUrls(markdown);
  const unsupplied = urls.find((url) => !rules.allowedSourceUrls.includes(url));
  if (unsupplied) return { ok: false, reason: `${lang}: source url was not supplied: ${unsupplied}` };
  const distinct = new Set(urls).size;
  if (distinct < rules.minSources) {
    return { ok: false, reason: `${lang}: cites ${distinct} distinct source(s), needs ${rules.minSources}` };
  }
  return { ok: true };
}

function checkLength(lang: NewsLang, markdown: string, rules: Required<QualityRules>): QualityVerdict {
  if (lang === 'ko') {
    const chars = koBodyChars(markdown);
    if (chars < rules.minKoBodyChars) {
      return { ok: false, reason: `ko: body is ${chars} chars, below the ${rules.minKoBodyChars} minimum` };
    }
    return { ok: true };
  }
  const words = enBodyWords(markdown);
  if (words < rules.minEnWords) {
    return { ok: false, reason: `en: body is ${words} words, below the ${rules.minEnWords} minimum` };
  }
  return { ok: true };
}

/** 생성 직후 검사: 본문 최소 분량과 출처(2개 이상, 모델에 준 것만). 모든 조건은 ko·en 양쪽에 적용한다. */
export function checkArticleQuality(pair: { ko: string; en: string }, rules: QualityRules): QualityVerdict {
  const resolved: Required<QualityRules> = {
    minSources: NEWS_QUALITY.minSources,
    minKoBodyChars: NEWS_QUALITY.minKoBodyChars,
    minEnWords: NEWS_QUALITY.minEnWords,
    ...rules,
  };
  for (const lang of ['ko', 'en'] as const) {
    const verdict = [checkSources, checkLength]
      .map((check) => check(lang, pair[lang], resolved))
      .find((result) => !result.ok);
    if (verdict) return verdict;
  }
  return { ok: true };
}
