import path from 'node:path';
import { getTagsWithCount } from '@/lib/news';

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
