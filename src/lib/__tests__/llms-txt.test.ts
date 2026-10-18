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

describe('buildLlmsTxt — site facts block', () => {
  it('puts the facts block before the section links', () => {
    const result = buildLlmsTxt([], BASE);
    const factsAt = result.indexOf('## Site Facts');
    expect(factsAt).toBeGreaterThan(-1);
    expect(factsAt).toBeLessThan(result.indexOf('## Key Sections'));
  });

  it('states coverage, update cadence, languages and operator', () => {
    const result = buildLlmsTxt([], BASE);
    expect(result).toContain('- Coverage:');
    expect(result).toContain('- Update cadence:');
    expect(result).toContain('- Languages: Korean (ko), English (en)');
    expect(result).toContain('- Operator: 팀와이(TeamY)');
    expect(result).toContain('- Contact:');
  });

  it('discloses AI-assisted drafting honestly', () => {
    expect(buildLlmsTxt([], BASE)).toContain('AI-assisted');
    expect(buildLlmsTxt([], BASE)).not.toContain('human-curated');
  });
});

describe('buildLlmsTxt — snapshot', () => {
  it('keeps the document layout stable', () => {
    const articles: NewsMeta[] = [
      {
        slug: 'sample',
        title: 'Sample',
        lang: 'ko',
        date: '2026-10-17',
        summary: 'Sample summary.',
        tags: ['AI'],
        sources: [],
      },
    ];
    expect(buildLlmsTxt(['AI'], BASE, articles)).toMatchSnapshot();
  });
});

describe('buildLlmsTxt — article list', () => {
  const article = (slug: string, lang: 'ko' | 'en', date: string): NewsMeta => ({
    slug,
    title: `Title ${slug}`,
    lang,
    date,
    summary: `Summary ${slug}.`,
    tags: [],
    sources: [],
  });

  it('lists Korean canonical URLs with date and summary', () => {
    const result = buildLlmsTxt([], BASE, [article('a', 'ko', '2026-10-17')]);
    expect(result).toContain('## Recent Articles');
    expect(result).toContain(`- [Title a](${BASE}/news/a) — 2026-10-17 — Summary a.`);
  });

  it('skips English entries and caps the list at the limit', () => {
    const articles = [
      article('en-one', 'en', '2026-10-17'),
      article('k1', 'ko', '2026-10-16'),
      article('k2', 'ko', '2026-10-15'),
    ];
    const result = buildLlmsTxt([], BASE, articles, 1);
    expect(result).not.toContain('/en/news/en-one');
    expect(result).toContain(`${BASE}/news/k1`);
    expect(result).not.toContain(`${BASE}/news/k2`);
  });

  it('points to llms-full.txt and omits the section when empty', () => {
    expect(buildLlmsTxt([], BASE)).not.toContain('## Recent Articles');
    expect(buildLlmsTxt([], BASE)).toContain(`${BASE}/llms-full.txt`);
  });

  it('flattens newlines in summaries so each entry stays one line', () => {
    const a = { ...article('x', 'ko', '2026-10-17'), summary: 'line1\nline2' };
    expect(buildLlmsTxt([], BASE, [a])).toContain('line1 line2');
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
