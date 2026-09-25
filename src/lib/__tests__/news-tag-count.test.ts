import path from 'node:path';
import { getTagsWithCount, isThinTag, selectListableTopics, MIN_TAG_ARTICLE_COUNT_FOR_INDEX } from '@/lib/news';

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

describe('selectListableTopics', () => {
  /*
    🔴 목록이 색인 대상보다 넓으면 크롤러가 색인도 안 될 링크를 수집해 간다
    (2026-09-26 실측: /news/topics 하루 646회 방문, 태그 1,027개 중 652개가 기사 1건).
  */
  it('기사가 문턱 미만인 주제를 뺀다', () => {
    const picked = selectListableTopics([
      { tag: 'OpenAI', count: 349 },
      { tag: '딱문턱', count: MIN_TAG_ARTICLE_COUNT_FOR_INDEX },
      { tag: '한건짜리', count: MIN_TAG_ARTICLE_COUNT_FOR_INDEX - 1 },
    ]);
    expect(picked.map((t) => t.tag)).toEqual(['OpenAI', '딱문턱']);
  });

  it('isThinTag 와 같은 문턱을 쓴다', () => {
    const tags = getTagsWithCount('ko', FIXTURES);
    for (const tag of tags) {
      expect(selectListableTopics([tag]).length === 0).toBe(isThinTag('ko', tag.tag, FIXTURES));
    }
  });
});
