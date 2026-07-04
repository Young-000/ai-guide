import { buildLlmsTxt, buildLlmsFullTxt } from '@/lib/llms-txt';
import type { NewsMeta } from '@/types/news';

const BASE = 'https://example.com';

describe('buildLlmsTxt', () => {
  it('includes the site name and bilingual purpose line', () => {
    const result = buildLlmsTxt([], BASE);
    expect(result).toContain('# AIWire');
    expect(result).toContain('AI·LLM');
  });

  it('includes key section links using the given base URL', () => {
    const result = buildLlmsTxt([], BASE);
    expect(result).toContain(`${BASE}/news`);
    expect(result).toContain(`${BASE}/en/news`);
    expect(result).toContain(`${BASE}/about`);
    expect(result).toContain(`${BASE}/feed.xml`);
  });

  it('lists each tag as a markdown link to /news/topic/<tag>', () => {
    const result = buildLlmsTxt(['OpenAI', 'Claude'], BASE);
    expect(result).toContain(`[OpenAI](${BASE}/news/topic/OpenAI)`);
    expect(result).toContain(`[Claude](${BASE}/news/topic/Claude)`);
  });

  it('URL-encodes tags that contain spaces or special characters', () => {
    const result = buildLlmsTxt(['AI 뉴스'], BASE);
    expect(result).toContain('[AI 뉴스]');
    expect(result).toContain(encodeURIComponent('AI 뉴스'));
  });

  it('falls back to a placeholder when no tags are provided', () => {
    const result = buildLlmsTxt([], BASE);
    expect(result).toContain('(no tags yet)');
  });
});

describe('buildLlmsFullTxt', () => {
  const articles: NewsMeta[] = [
    {
      slug: 'article-one',
      title: 'Article One',
      lang: 'ko',
      date: '2026-06-15',
      summary: 'Summary for article one.',
      tags: ['AI'],
      sources: [],
    },
    {
      slug: 'article-two',
      title: 'Article Two',
      lang: 'ko',
      date: '2026-06-14',
      summary: 'Summary for article two.',
      tags: [],
      sources: [],
    },
  ];

  it('includes a header and site attribution', () => {
    const result = buildLlmsFullTxt(articles, BASE);
    expect(result).toContain('# AIWire');
    expect(result).toContain('aiwire.news');
  });

  it('includes article titles and summaries', () => {
    const result = buildLlmsFullTxt(articles, BASE);
    expect(result).toContain('## Article One');
    expect(result).toContain('Summary for article one.');
  });

  it('includes correct article URLs with the given base URL', () => {
    const result = buildLlmsFullTxt(articles, BASE);
    expect(result).toContain(`${BASE}/news/article-one`);
    expect(result).toContain(`${BASE}/news/article-two`);
  });

  it('includes article dates', () => {
    const result = buildLlmsFullTxt(articles, BASE);
    expect(result).toContain('2026-06-15');
  });

  it('respects the limit parameter and omits articles beyond it', () => {
    const result = buildLlmsFullTxt(articles, BASE, 1);
    expect(result).toContain('Article One');
    expect(result).not.toContain('Article Two');
  });

  it('returns all articles when limit exceeds article count', () => {
    const result = buildLlmsFullTxt(articles, BASE, 100);
    expect(result).toContain('Article One');
    expect(result).toContain('Article Two');
  });

  it('links an English article under /en/news/<slug>, not /news/<slug>', () => {
    const enArticle: NewsMeta = {
      slug: 'article-en',
      title: 'Article EN',
      lang: 'en',
      date: '2026-06-16',
      summary: 'English summary.',
      tags: [],
      sources: [],
    };
    const result = buildLlmsFullTxt([enArticle], BASE);
    expect(result).toContain(`${BASE}/en/news/article-en`);
    expect(result).not.toContain(`${BASE}/news/article-en`);
  });
});
