import { selectRelatedArticles, MAX_RELATED_ITEMS } from '../related-articles';
import type { NewsMeta } from '@/types/news';

const article = (
  slug: string,
  date: string,
  tags: string[],
  title = slug,
  summary = '',
): NewsMeta => ({ slug, date, tags, title, lang: 'ko', summary, sources: [] }) as NewsMeta;

/**
 * 왜 (2026-10-19): 기존 관련 기사는 첫 태그 하나로만 골랐다. 태그 1,027개 중 64%가
 * 기사 1건짜리라, 첫 태그가 thin 이면 관련 기사가 0건이 되어 기사 페이지가 고립됐다.
 */
describe('selectRelatedArticles', () => {
  it('자기 자신은 넣지 않는다', () => {
    const current = article('now', '2026-10-19', ['Anthropic']);
    const all = [current, article('a', '2026-10-18', ['Anthropic'])];
    expect(selectRelatedArticles(all, current).some((a) => a.slug === 'now')).toBe(false);
  });

  it('첫 태그가 기사 1건짜리여도 다른 태그로 관련 기사를 찾는다', () => {
    const current = article('now', '2026-10-19', ['희귀한태그', 'Claude']);
    const all = [
      current,
      article('a', '2026-10-18', ['Claude']),
      article('b', '2026-10-17', ['Claude']),
    ];
    expect(selectRelatedArticles(all, current).map((a) => a.slug)).toEqual(['a', 'b']);
  });

  it('공유 태그가 많은 기사를 먼저 준다', () => {
    const current = article('now', '2026-10-19', ['Claude', 'Anthropic']);
    const all = [
      current,
      article('one', '2026-10-18', ['Claude']),
      article('two', '2026-10-01', ['Claude', 'Anthropic']),
    ];
    expect(selectRelatedArticles(all, current).map((a) => a.slug)).toEqual(['two', 'one']);
  });

  it('태그가 겹치지 않으면 같은 섹션 최신 기사로 채운다', () => {
    const current = article('now', '2026-10-19', ['고립'], 'GPT-5 model launch');
    const all = [
      current,
      article('same', '2026-10-18', ['x'], 'New LLM model release'),
      article('other', '2026-10-17', ['y'], 'Funding round raises $1B'),
    ];
    expect(selectRelatedArticles(all, current).map((a) => a.slug)).toEqual(['same']);
  });

  it('최대 개수를 넘기지 않는다', () => {
    const current = article('now', '2026-10-19', ['Claude']);
    const all = [
      current,
      ...Array.from({ length: 10 }, (_, i) => article(`a${i}`, `2026-10-${10 + i}`, ['Claude'])),
    ];
    expect(selectRelatedArticles(all, current)).toHaveLength(MAX_RELATED_ITEMS);
  });

  it('제외 목록의 기사는 건너뛴다', () => {
    const current = article('now', '2026-10-19', ['Claude']);
    const all = [current, article('a', '2026-10-18', ['Claude']), article('b', '2026-10-17', ['Claude'])];
    expect(selectRelatedArticles(all, current, ['a']).map((a) => a.slug)).toEqual(['b']);
  });

  it('후보가 전혀 없으면 빈 배열이다', () => {
    const current = article('now', '2026-10-19', ['Claude']);
    expect(selectRelatedArticles([current], current)).toEqual([]);
  });
});
