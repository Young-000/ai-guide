/**
 * @jest-environment node
 */
import {
  NEWS_QUALITY,
  checkArticleQuality,
  enBodyWords,
  koBodyChars,
  resolveDailyLimit,
} from '@/lib/news-quality';

/**
 * 2026-11-02 점검: 최근 7일 발행 27건 전부 출처 1개, 한국어 본문(공백 제외, 출처 목록 제외) 중앙값 329자,
 * 영어 본문 중앙값 146단어. 한 편에 출처가 둘 이상이고 본문이 이 숫자의 두 배 이상이어야 발행한다.
 */
const URL_A = 'https://a.example/story';
const URL_B = 'https://b.example/story';

function article(lang: 'ko' | 'en', sources: string[], body: string): string {
  const list = sources.map((url, index) => `  - title: "Source ${index}"\n    url: ${url}`).join('\n');
  return `---\ntitle: "T"\nlang: ${lang}\ndate: 2026-11-02\nslug: s\nsummary: "s"\ntags: ["AI"]\nsources:\n${list}\n---\n\n${body}`;
}

const KO_LONG = '가'.repeat(NEWS_QUALITY.minKoBodyChars);
const EN_LONG = Array.from({ length: NEWS_QUALITY.minEnWords }, () => 'word').join(' ');
const KO_MORE = '\n\n### 더 보기\n- [원문](https://a.example/story) — A\n- [원문](https://b.example/story) — B';
const EN_MORE = '\n\n### Read more\n- [Source](https://a.example/story) — A';

const rules = { allowedSourceUrls: [URL_A, URL_B] };

function pair(overrides: { ko?: string; en?: string } = {}): { ko: string; en: string } {
  return {
    ko: overrides.ko ?? article('ko', [URL_A, URL_B], KO_LONG + KO_MORE),
    en: overrides.en ?? article('en', [URL_A, URL_B], EN_LONG + EN_MORE),
  };
}

describe('body measures', () => {
  it('counts Korean characters without whitespace, frontmatter or the source list', () => {
    expect(koBodyChars(article('ko', [URL_A], '가나 다\n라' + KO_MORE))).toBe(4);
  });

  it('counts English words without the source list', () => {
    expect(enBodyWords(article('en', [URL_A], 'one two three' + EN_MORE))).toBe(3);
  });
});

describe('checkArticleQuality', () => {
  it('accepts a long article that cites two supplied sources', () => {
    expect(checkArticleQuality(pair(), rules)).toEqual({ ok: true });
  });

  it('rejects a Korean body below the minimum and says how long it was', () => {
    const short = article('ko', [URL_A, URL_B], '가'.repeat(NEWS_QUALITY.minKoBodyChars - 1) + KO_MORE);
    const verdict = checkArticleQuality(pair({ ko: short }), rules);

    expect(verdict).toEqual({
      ok: false,
      reason: `ko: body is ${NEWS_QUALITY.minKoBodyChars - 1} chars, below the ${NEWS_QUALITY.minKoBodyChars} minimum`,
    });
  });

  it('rejects an English body below the minimum', () => {
    const short = article('en', [URL_A, URL_B], 'word '.repeat(10) + EN_MORE);
    const verdict = checkArticleQuality(pair({ en: short }), rules);

    expect(verdict.ok).toBe(false);
    expect(verdict.ok === false && verdict.reason).toMatch(/^en: body is 10 words/);
  });

  it('rejects an article that cites only one source', () => {
    const single = article('ko', [URL_A], KO_LONG + KO_MORE);
    const verdict = checkArticleQuality(pair({ ko: single }), rules);

    expect(verdict).toEqual({ ok: false, reason: `ko: cites 1 distinct source(s), needs ${NEWS_QUALITY.minSources}` });
  });

  it('counts the same URL once', () => {
    const repeated = article('en', [URL_A, URL_A], EN_LONG + EN_MORE);
    const verdict = checkArticleQuality(pair({ en: repeated }), rules);

    expect(verdict.ok).toBe(false);
  });

  it('rejects a source URL that was not supplied to the model', () => {
    const invented = article('ko', [URL_A, 'https://invented.example/x'], KO_LONG + KO_MORE);
    const verdict = checkArticleQuality(pair({ ko: invented }), rules);

    expect(verdict).toEqual({ ok: false, reason: 'ko: source url was not supplied: https://invented.example/x' });
  });
});

describe('resolveDailyLimit', () => {
  it('uses the configured default', () => {
    expect(resolveDailyLimit({})).toBe(NEWS_QUALITY.dailyLimit);
  });

  it('lets NEWS_DAILY_LIMIT override it, including 0 to pause publishing', () => {
    expect(resolveDailyLimit({ NEWS_DAILY_LIMIT: '5' })).toBe(5);
    expect(resolveDailyLimit({ NEWS_DAILY_LIMIT: '0' })).toBe(0);
  });

  it('ignores a value that is not a whole number', () => {
    expect(resolveDailyLimit({ NEWS_DAILY_LIMIT: 'many' })).toBe(NEWS_QUALITY.dailyLimit);
    expect(resolveDailyLimit({ NEWS_DAILY_LIMIT: '-1' })).toBe(NEWS_QUALITY.dailyLimit);
  });
});
