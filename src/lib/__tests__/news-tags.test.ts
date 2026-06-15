import path from 'node:path';
import { getAllTags, getNewsByTag } from '@/lib/news';

const FIXTURES = path.join(__dirname, 'fixtures', 'news');

describe('getAllTags', () => {
  it('returns sorted unique tags from all ko articles', () => {
    // ko fixtures: alpha=['LLM'], beta=['OpenAI','LLM'], gamma=['LLM']
    // unique sorted: ['LLM', 'OpenAI']
    expect(getAllTags('ko', FIXTURES)).toEqual(['LLM', 'OpenAI']);
  });

  it('returns empty array when no articles exist', () => {
    expect(getAllTags('ko', path.join(FIXTURES, '__missing__'))).toEqual([]);
  });

  it('returns tags only for the requested lang', () => {
    // en fixture only has alpha with tag 'LLM'
    expect(getAllTags('en', FIXTURES)).toEqual(['LLM']);
  });
});

describe('getNewsByTag', () => {
  it('returns only articles that include the tag', () => {
    const items = getNewsByTag('ko', 'OpenAI', FIXTURES);
    expect(items).toHaveLength(1);
    expect(items[0]?.slug).toBe('beta');
  });

  it('returns all articles when multiple have the same tag', () => {
    const items = getNewsByTag('ko', 'LLM', FIXTURES);
    // alpha, beta, gamma all have LLM — sorted by date desc: gamma, beta, alpha
    expect(items.map((i) => i.slug)).toEqual(['gamma', 'beta', 'alpha']);
  });

  it('returns empty array for a tag that does not exist', () => {
    expect(getNewsByTag('ko', 'nope', FIXTURES)).toEqual([]);
  });
});
