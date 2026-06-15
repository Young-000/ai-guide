import { buildNewsGraph } from '@/lib/graph';
import type { GraphLink } from '@/lib/graph';

// Override getAllNews to read from fixtures (same fixtures as news.test.ts).
// buildNewsGraph calls getAllNews(lang) with the default content root, so we
// mock the module to redirect it at the fixtures directory.
jest.mock('@/lib/news', () => {
  const actual = jest.requireActual<typeof import('@/lib/news')>('@/lib/news');
  const path = jest.requireActual<typeof import('node:path')>('node:path');
  const fixtures = path.join(__dirname, 'fixtures', 'news');
  return {
    ...actual,
    getAllNews: (lang: 'ko' | 'en') => actual.getAllNews(lang, fixtures),
  };
});

describe('buildNewsGraph', () => {
  it('builds article nodes with id a:<slug>, type article, url /news/<slug>, val 3', () => {
    const { nodes } = buildNewsGraph('ko');
    const articleNodes = nodes.filter((n) => n.type === 'article');
    expect(articleNodes).toHaveLength(3);

    const alpha = articleNodes.find((n) => n.id === 'a:alpha');
    expect(alpha).toBeDefined();
    expect(alpha?.label).toBe('알파 기사');
    expect(alpha?.url).toBe('/news/alpha');
    expect(alpha?.val).toBe(3);
  });

  it('builds tag nodes with id t:<tag>, type tag, url /news/topic/<tag>', () => {
    const { nodes } = buildNewsGraph('ko');
    const tagNodes = nodes.filter((n) => n.type === 'tag');
    const tagIds = tagNodes.map((n) => n.id).sort();
    expect(tagIds).toEqual(['t:LLM', 't:OpenAI']);

    const llm = tagNodes.find((n) => n.id === 't:LLM');
    expect(llm?.url).toBe('/news/topic/LLM');
    expect(llm?.label).toBe('LLM');
  });

  it('sizes tag nodes by article count (val = count)', () => {
    const { nodes } = buildNewsGraph('ko');
    const llm = nodes.find((n) => n.id === 't:LLM');
    const openai = nodes.find((n) => n.id === 't:OpenAI');
    // LLM appears in alpha, beta, gamma → val 3
    expect(llm?.val).toBe(3);
    // OpenAI appears only in beta → val 1
    expect(openai?.val).toBe(1);
  });

  it('builds one link per article-tag pair', () => {
    const { links } = buildNewsGraph('ko');
    // alpha→LLM, beta→OpenAI, beta→LLM, gamma→LLM = 4 links
    expect(links).toHaveLength(4);
    expect(links).toContainEqual<GraphLink>({ source: 'a:alpha', target: 't:LLM' });
    expect(links).toContainEqual<GraphLink>({ source: 'a:beta', target: 't:OpenAI' });
    expect(links).toContainEqual<GraphLink>({ source: 'a:beta', target: 't:LLM' });
    expect(links).toContainEqual<GraphLink>({ source: 'a:gamma', target: 't:LLM' });
  });

  it('always returns node and link arrays (no throw)', () => {
    const { nodes, links } = buildNewsGraph('en');
    expect(Array.isArray(nodes)).toBe(true);
    expect(Array.isArray(links)).toBe(true);
  });

  it('every link source refers to an article node present in the graph', () => {
    const { nodes, links } = buildNewsGraph('ko');
    const articleIds = new Set(nodes.filter((n) => n.type === 'article').map((n) => n.id));
    for (const link of links) {
      expect(articleIds.has(link.source)).toBe(true);
    }
  });
});
