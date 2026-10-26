/**
 * @jest-environment node
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

type FeedConfig = { name: string; url: string };

const feeds = JSON.parse(
  readFileSync(join(__dirname, '..', '..', '..', 'scripts', 'feeds.json'), 'utf-8'),
) as FeedConfig[];

// 2026-10-26 피드 정리: 원문 통과 0 이던 네 피드(Google News 검색·Ars·Hugging Face·VentureBeat)를 뺐다.
// 요약 한 줄이거나 설명이 없거나 429 로 막혀, 기사로 쓸 수 있는 항목이 한 건도 없었다.
const NO_SOURCE_TEXT_FEEDS = ['AI News (Google)', 'ArsTechnica AI', 'Hugging Face Blog', 'VentureBeat AI'];

describe('scripts/feeds.json', () => {
  it('원문을 주지 않는 것으로 실측된 피드를 다시 넣지 않는다', () => {
    const names = feeds.map((feed) => feed.name);
    expect(names.filter((name) => NO_SOURCE_TEXT_FEEDS.includes(name))).toEqual([]);
  });

  it('이름과 주소가 겹치지 않고 주소는 https 다', () => {
    expect(new Set(feeds.map((feed) => feed.name)).size).toBe(feeds.length);
    expect(new Set(feeds.map((feed) => feed.url)).size).toBe(feeds.length);
    expect(feeds.every((feed) => feed.url.startsWith('https://'))).toBe(true);
  });
});
