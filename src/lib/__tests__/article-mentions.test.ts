import { findMentions, MAX_MENTIONS } from '../article-mentions';
import type { NewsMeta } from '@/types/news';

const article = (title: string, tags: string[]): NewsMeta =>
  ({ slug: 's', date: '2026-09-26', title, tags, lang: 'ko', summary: '' }) as NewsMeta;

const TOOLS = [
  { slug: 'claude', name: 'Claude', tagline: '앤트로픽의 AI 어시스턴트' },
  { slug: 'chatgpt', name: 'ChatGPT', tagline: '오픈AI의 대화형 AI' },
  { slug: 'cursor', name: 'Cursor', tagline: 'AI 코드 에디터' },
];
const TERMS = [
  { slug: 'llm', term: 'LLM', definition: '대규모 언어 모델' },
  { slug: 'token', term: '토큰', definition: '모델이 글을 나누는 단위' },
];

/**
 * 🔴 왜 (2026-09-26): 기사 본문이 785자(중앙값)라 원문에 없는 가치가 없다. 우리에겐
 * 도구 21개·용어 18개의 가이드가 이미 있는데 기사와 이어져 있지 않았다. 이으면
 * 독자에게는 "그게 뭔데?"의 답이 되고(ux-baseline 원칙 4), 955건 전부에 즉시 적용된다.
 */
describe('findMentions', () => {
  it('제목에서 도구를 찾는다', () => {
    const found = findMentions(article('Claude가 새 효소를 발견', []), TOOLS, TERMS);
    expect(found.tools.map((t) => t.slug)).toEqual(['claude']);
  });

  it('태그에서도 찾는다', () => {
    const found = findMentions(article('무관한 제목', ['Cursor', 'LLM']), TOOLS, TERMS);
    expect(found.tools.map((t) => t.slug)).toEqual(['cursor']);
    expect(found.terms.map((t) => t.slug)).toEqual(['llm']);
  });

  it('대소문자를 가리지 않는다', () => {
    expect(findMentions(article('chatgpt 신기능', []), TOOLS, TERMS).tools[0].slug).toBe('chatgpt');
  });

  /*
    단어 중간에 우연히 들어간 것은 언급이 아니다 — '토큰'을 찾다가 '토큰나이저'를
    잡으면 엉뚱한 설명이 붙는다. 한국어는 조사가 붙으므로 경계를 글자 종류로 본다.
  */
  it('다른 낱말 속의 우연한 일치는 세지 않는다', () => {
    expect(findMentions(article('Claudette 출시', []), TOOLS, TERMS).tools).toEqual([]);
  });

  it('한국어 조사가 붙어도 찾는다', () => {
    expect(findMentions(article('토큰을 아끼는 법', []), TOOLS, TERMS).terms[0].slug).toBe('token');
  });

  it('같은 것을 두 번 넣지 않는다', () => {
    const found = findMentions(article('Claude 소식', ['Claude']), TOOLS, TERMS);
    expect(found.tools).toHaveLength(1);
  });

  it('너무 많이 싣지 않는다', () => {
    const many = Array.from({ length: 30 }, (_, i) => ({ slug: `t${i}`, name: `Tool${i}`, tagline: '' }));
    const found = findMentions(article(many.map((t) => t.name).join(' '), []), many, TERMS);
    expect(found.tools.length).toBeLessThanOrEqual(MAX_MENTIONS);
  });

  it('아무것도 없으면 빈 결과다', () => {
    expect(findMentions(article('날씨 이야기', []), TOOLS, TERMS)).toEqual({ tools: [], terms: [] });
  });
});
