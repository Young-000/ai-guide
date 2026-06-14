import path from 'node:path';
import { getAllNews, getNewsBySlug, getNewsSlugs } from '@/lib/news';

const FIXTURES = path.join(__dirname, 'fixtures', 'news');
const BAD_SLUG_FIXTURES = path.join(__dirname, 'fixtures', 'bad-news-slug');
const BAD_LANG_FIXTURES = path.join(__dirname, 'fixtures', 'bad-news-lang');

describe('news loader', () => {
  it('getAllNews는 날짜 내림차순으로 정렬해 반환한다', () => {
    const items = getAllNews('ko', FIXTURES);
    expect(items.map((i) => i.slug)).toEqual(['gamma', 'beta', 'alpha']);
  });

  it('getAllNews는 frontmatter를 파싱한다', () => {
    const items = getAllNews('ko', FIXTURES);
    const beta = items.find((i) => i.slug === 'beta');
    expect(beta?.title).toBe('베타 기사');
    expect(beta?.tags).toEqual(['OpenAI', 'LLM']);
    expect(beta?.sources[0]).toEqual({ title: '출처 B', url: 'https://example.com/b' });
  });

  it('따옴표 없는 date(YAML이 Date로 파싱)도 YYYY-MM-DD 문자열로 정규화한다', () => {
    const gamma = getAllNews('ko', FIXTURES).find((i) => i.slug === 'gamma');
    expect(gamma?.date).toBe('2026-03-01');
    expect(typeof gamma?.date).toBe('string');
  });

  it('getNewsBySlug는 본문 포함 기사를 반환한다', () => {
    const article = getNewsBySlug('ko', 'alpha', FIXTURES);
    expect(article).not.toBeNull();
    expect(article?.title).toBe('알파 기사');
    expect(article?.body.trim()).toBe('알파 본문입니다.');
  });

  it('getNewsBySlug는 없는 slug면 null을 반환한다', () => {
    expect(getNewsBySlug('ko', 'nope', FIXTURES)).toBeNull();
  });

  it('getNewsSlugs는 해당 언어의 frontmatter slug 목록을 반환한다', () => {
    expect(getNewsSlugs('ko', FIXTURES).sort()).toEqual(['alpha', 'beta', 'gamma']);
    expect(getNewsSlugs('en', FIXTURES)).toEqual(['alpha']);
  });

  it('없는 언어 디렉토리는 빈 배열을 반환한다 (throw 안 함)', () => {
    expect(getAllNews('en', path.join(FIXTURES, '__missing__'))).toEqual([]);
  });

  it('필수 필드(slug)가 없으면 throw 한다', () => {
    expect(() => getAllNews('ko', BAD_SLUG_FIXTURES)).toThrow(
      "news frontmatter: 'slug' must be a string",
    );
  });

  it('lang이 ko/en이 아니면 throw 한다', () => {
    expect(() => getAllNews('ko', BAD_LANG_FIXTURES)).toThrow(
      "news frontmatter: invalid lang 'fr'",
    );
  });
});
