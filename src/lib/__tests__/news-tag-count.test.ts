import path from 'node:path';
import { getTagsWithCount, isThinTag, MIN_TAG_ARTICLE_COUNT_FOR_INDEX } from '@/lib/news';

const FIXTURES = path.join(__dirname, 'fixtures', 'news');

describe('getTagsWithCount', () => {
  it('returns tags sorted by count descending', () => {
    // ko fixtures: alpha=['LLM'], beta=['OpenAI','LLM'], gamma=['LLM']
    // LLM appears 3 times, OpenAI 1 time => LLM first
    const result = getTagsWithCount('ko', FIXTURES);
    expect(result[0]).toEqual({ tag: 'LLM', count: 3 });
    expect(result[1]).toEqual({ tag: 'OpenAI', count: 1 });
  });

  it('breaks count ties alphabetically', () => {
    // Both LLM and OpenAI but LLM has higher count; checking order is stable
    const result = getTagsWithCount('ko', FIXTURES);
    expect(result.map((r) => r.tag)).toEqual(['LLM', 'OpenAI']);
  });

  it('returns empty array when no articles exist', () => {
    expect(getTagsWithCount('ko', path.join(FIXTURES, '__missing__'))).toEqual([]);
  });
});

describe('MIN_TAG_ARTICLE_COUNT_FOR_INDEX', () => {
  it('is 2 — a tag needs at least 2 articles to be considered non-thin', () => {
    expect(MIN_TAG_ARTICLE_COUNT_FOR_INDEX).toBe(2);
  });
});

describe('isThinTag', () => {
  it('is false for a tag whose article count meets the threshold', () => {
    // LLM has 3 articles (alpha, beta, gamma) — well above the threshold
    expect(isThinTag('ko', 'LLM', FIXTURES)).toBe(false);
  });

  it('is true for a tag with fewer than MIN_TAG_ARTICLE_COUNT_FOR_INDEX articles', () => {
    // OpenAI has exactly 1 article (beta) — below the threshold of 2
    expect(isThinTag('ko', 'OpenAI', FIXTURES)).toBe(true);
  });

  it('is true for a tag that does not exist at all (0 articles)', () => {
    expect(isThinTag('ko', 'nonexistent-tag', FIXTURES)).toBe(true);
  });
});
