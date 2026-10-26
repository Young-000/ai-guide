/**
 * @jest-environment node
 */
import path from 'node:path';
import { getThinArticleSlugs, isThinArticle } from '@/lib/news';
import { admitsHeadlineOnly } from '@/lib/news-thin';

const FIXTURES = path.join(__dirname, 'fixtures', 'thin-news');

describe('admitsHeadlineOnly', () => {
  it('flags a Korean body that says it only saw the headline', () => {
    expect(admitsHeadlineOnly('ko', '정보는 보도 제목과 요약 수준이며')).toBe(true);
  });

  it('flags an English admission but not a comparison to a headline number', () => {
    expect(admitsHeadlineOnly('en', 'Details beyond the headline are not available.')).toBe(true);
    expect(admitsHeadlineOnly('en', 'more than the headline number')).toBe(false);
  });
});

describe('getThinArticleSlugs', () => {
  it('collects a slug when either language body admits it was written from the headline', () => {
    expect(Array.from(getThinArticleSlugs(FIXTURES)).sort()).toEqual(['en-admits', 'ko-admits']);
  });

  it('returns an empty set when the content root does not exist', () => {
    expect(getThinArticleSlugs(path.join(FIXTURES, '__missing__')).size).toBe(0);
  });
});

describe('isThinArticle', () => {
  it('is true for both sides of a pair whose one side admits the headline-only source', () => {
    expect(isThinArticle('ko-admits', FIXTURES)).toBe(true);
    expect(isThinArticle('en-admits', FIXTURES)).toBe(true);
  });

  it('is false for a solid article and for an unknown slug', () => {
    expect(isThinArticle('solid', FIXTURES)).toBe(false);
    expect(isThinArticle('comparison', FIXTURES)).toBe(false);
    expect(isThinArticle('nope', FIXTURES)).toBe(false);
  });
});
