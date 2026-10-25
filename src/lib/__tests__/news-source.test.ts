/**
 * @jest-environment node
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { FeedItem } from '@/lib/news-feed';
import { MIN_SOURCE_CHARS, hasSourceSubstance, sourceSubstance } from '@/lib/news-source';

/**
 * AdSense "가치가 별로 없는 콘텐츠" (aiwire.news, 2026-10-09~) 대응 — 2026-10-25.
 *
 * Google News RSS 의 description 은 기사 제목 + 매체명뿐이다. 생성기는 그 제목 한 줄로 기사를 써 왔고,
 * 기사 1,194건 중 810건의 출처가 news.google.com 이다. 본문에 "보도 제목과 요약 수준"이라고 스스로 적은 기사도 있다.
 * 구글 안내: 다른 출처를 가치 없이 다시 쓴 페이지, 사람 검토 없는 자동 생성 페이지에는 광고를 두지 않는다
 * (support.google.com/publisherpolicies/answer/11190248).
 * 그래서 원문 텍스트가 제목보다 충분히 길지 않은 항목은 쓰지 않는다.
 */
function item(overrides: Partial<FeedItem>): FeedItem {
  return {
    source: 'AI News (Google)',
    title: 'Claude Duet keeps working when your laptop is off, but uses your plan\'s limits',
    url: 'https://news.google.com/rss/articles/abc',
    publishedAt: null,
    summary: null,
    ...overrides,
  };
}

describe('sourceSubstance', () => {
  it('Google News 형식(제목 + 매체명)에서는 남는 텍스트가 거의 없다', () => {
    const googleNews = item({
      summary:
        '<a href="https://news.google.com/rss/articles/abc">Claude Duet keeps working when your laptop is off, but uses your plan\'s limits</a>&nbsp;&nbsp;<font color="#6f6f6f">MIXED Reality News</font>',
    });

    expect(sourceSubstance(googleNews).length).toBeLessThan(30);
  });

  it('요약이 없으면 빈 문자열', () => {
    expect(sourceSubstance(item({ summary: null }))).toBe('');
  });

  it('실제 요약 문단은 남는다', () => {
    const verge = item({
      source: 'The Verge AI',
      title: 'Blue Planet III is keeping the rough edges in the age of AI',
      summary:
        "BBC's Blue Planet III is looking to prove its authenticity by leaving in the less-than-perfect shots. Previous incarnations of the nature series were polished to a high sheen, but producers now say viewers want proof that footage is real.",
    });

    expect(sourceSubstance(verge)).toMatch(/authenticity/);
  });
});

describe('generate-news wiring', () => {
  it('filters headline-only items before taking the per-run cap', () => {
    const script = readFileSync(join(process.cwd(), 'scripts', 'generate-news.ts'), 'utf8');

    expect(script).toMatch(/worklist\.items\.filter\(hasSourceSubstance\)/);
    expect(script.indexOf('filter(hasSourceSubstance)')).toBeLessThan(script.indexOf('.slice(0, MAX_ARTICLES)'));
  });
});

describe('hasSourceSubstance', () => {
  it(`제목 말고 ${MIN_SOURCE_CHARS}자 이상 원문이 있어야 쓴다`, () => {
    const enough = item({ summary: 'x'.repeat(MIN_SOURCE_CHARS) });
    const short = item({ summary: 'x'.repeat(MIN_SOURCE_CHARS - 1) });

    expect(hasSourceSubstance(enough)).toBe(true);
    expect(hasSourceSubstance(short)).toBe(false);
  });

  it('제목만 있는 Google News 항목은 쓰지 않는다', () => {
    const googleNews = item({
      summary: "Claude Duet keeps working when your laptop is off, but uses your plan's limits &nbsp;&nbsp; MIXED Reality News",
    });

    expect(hasSourceSubstance(googleNews)).toBe(false);
  });
});
