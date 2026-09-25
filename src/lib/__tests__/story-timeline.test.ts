import { buildStoryTimeline, MAX_TIMELINE_ITEMS } from '../story-timeline';
import type { NewsMeta } from '@/types/news';

const article = (slug: string, date: string, tags: string[], title = slug): NewsMeta =>
  ({ slug, date, tags, title, lang: 'ko', summary: '' }) as NewsMeta;

/**
 * 🔴 왜 이 기능이 필요한가 (2026-09-26).
 *
 * 기사 본문 중앙값이 785자다 — 외신 1건을 요약한 분량이라 원문에 없는 가치가 없다.
 * AdSense 는 9/12부터 "준비 중"이고 지적사항은 비어 있는데, 승인 기준 중 우리가
 * 미달하는 항목은 "고유하고 가치 있는 콘텐츠" 하나뿐이다.
 *
 * 우리에게는 955건의 아카이브가 있다. 외신은 개별 사건만 전하지만 우리는 그 사건이
 * 어떤 흐름 위에 있는지 보여줄 수 있다 — 짧은 브리핑이라는 성격을 지키면서 더하는
 * 유일한 고유 가치다.
 */
describe('buildStoryTimeline', () => {
  const all = [
    article('now', '2026-09-26', ['Anthropic', 'Claude']),
    article('past-1', '2026-09-01', ['Anthropic', '규제']),
    article('past-2', '2026-08-01', ['Anthropic']),
    article('other', '2026-09-10', ['OpenAI']),
    article('future', '2026-09-30', ['Anthropic']),
  ];

  it('같은 주제의 과거 기사를 최신순으로 준다', () => {
    const line = buildStoryTimeline(all, all[0]);
    expect(line.map((a) => a.slug)).toEqual(['past-1', 'past-2']);
  });

  it('자기 자신은 넣지 않는다', () => {
    expect(buildStoryTimeline(all, all[0]).some((a) => a.slug === 'now')).toBe(false);
  });

  /* 앞으로 올 기사는 흐름이 아니다 — 과거만 본다. */
  it('현재 기사보다 나중 것은 넣지 않는다', () => {
    expect(buildStoryTimeline(all, all[0]).some((a) => a.slug === 'future')).toBe(false);
  });

  it('주제가 겹치지 않으면 비운다', () => {
    expect(buildStoryTimeline(all, article('lonely', '2026-09-26', ['양자컴퓨팅']))).toEqual([]);
  });

  /*
    태그가 흔할수록 흐름과 무관해진다 — 'AI' 는 955건 중 136건에 붙어 있어
    아무 기사나 끌어온다. 드문 태그를 우선한다.
  */
  it('흔한 태그보다 드문 태그로 잇는다', () => {
    const many = [
      article('now2', '2026-09-26', ['AI', '효소발견']),
      ...Array.from({ length: 20 }, (_, i) => article(`ai-${i}`, `2026-09-${String(i + 1).padStart(2, '0')}`, ['AI'])),
      article('enzyme-past', '2026-09-05', ['AI', '효소발견']),
    ];
    expect(buildStoryTimeline(many, many[0])[0].slug).toBe('enzyme-past');
  });

  it('너무 많이 싣지 않는다', () => {
    const many = [
      article('head', '2026-09-26', ['Anthropic']),
      ...Array.from({ length: 30 }, (_, i) => article(`p${i}`, '2026-09-01', ['Anthropic'])),
    ];
    expect(buildStoryTimeline(many, many[0]).length).toBeLessThanOrEqual(MAX_TIMELINE_ITEMS);
  });
});
