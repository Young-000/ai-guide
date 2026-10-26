/**
 * @jest-environment node
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { FeedItem } from '@/lib/news-feed';
import {
  MIN_SOURCE_CHARS,
  countSourceSubstanceBySource,
  hasSourceSubstance,
  sourceSubstance,
} from '@/lib/news-source';

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

// Real Google News RSS shapes (scripts/worklist.json, 2026-10-25). The <title> ends with " - <outlet>", the <a> text does not.
const GOOGLE_SINGLE = item({
  title: 'OpenAI Is Now Keeping Its Frontier Models off the Internet During Training - PCMag Middle East',
  summary:
    '<a href="https://news.google.com/rss/articles/CBMiqgFBVV95cUxQ?oc=5" target="_blank">OpenAI Is Now Keeping Its Frontier Models off the Internet During Training</a>&nbsp;&nbsp;<font color="#6f6f6f">PCMag Middle East</font>',
});
const GOOGLE_LONG_TITLE = item({
  title:
    'Just Two Characters Planted in an LLM Can Make a Robot Turn a Blade Toward a New Target, US University Demonstrates Attack Method - Interesting Engineering',
  summary:
    '<a href="https://news.google.com/rss/articles/CBMiZZZ?oc=5" target="_blank">Just Two Characters Planted in an LLM Can Make a Robot Turn a Blade Toward a New Target, US University Demonstrates Attack Method</a>&nbsp;&nbsp;<font color="#6f6f6f">Interesting Engineering</font>',
});
const GOOGLE_CLUSTER = item({
  title: 'An OpenAI Model Spent Ethereum Without Permission - Yahoo Finance',
  summary:
    '<ol><li><a href="https://news.google.com/rss/articles/AAA?oc=5" target="_blank">An OpenAI Model Spent Ethereum Without Permission</a>&nbsp;&nbsp;<font color="#6f6f6f">Yahoo Finance</font></li><li><a href="https://news.google.com/rss/articles/BBB?oc=5" target="_blank">OpenAI agent moved crypto from a test wallet, researchers say, raising questions about permissions</a>&nbsp;&nbsp;<font color="#6f6f6f">The Motley Fool</font></li></ol>',
});

describe('sourceSubstance', () => {
  it('Google News 단건: 제목 끝의 " - 매체명"이 있어도 남는 텍스트가 없다', () => {
    expect(hasSourceSubstance(GOOGLE_SINGLE)).toBe(false);
  });

  /* 리뷰 #50 CRITICAL: 제목이 120자를 넘는 Google 항목은 indexOf 가 -1 이라 제목 전체가 "원문"으로 통과했다. */
  it('Google News 단건: 제목이 길어도 통과하지 않는다', () => {
    expect(hasSourceSubstance(GOOGLE_LONG_TITLE)).toBe(false);
  });

  it('Google News 묶음(다른 매체 헤드라인 목록)도 원문이 아니다', () => {
    expect(hasSourceSubstance(GOOGLE_CLUSTER)).toBe(false);
  });

  it('제목 끝 " - 매체명"을 떼고 비교한다 — 다른 피드에서도', () => {
    const other = item({
      source: 'VentureBeat AI',
      title: 'A short headline about agents - VentureBeat',
      summary: 'A short headline about agents',
    });
    expect(sourceSubstance(other)).toBe('');
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
    expect(hasSourceSubstance(verge)).toBe(true);
  });
});

describe('generate-news wiring', () => {
  it('filters headline-only items before taking the per-run cap', () => {
    const script = readFileSync(join(process.cwd(), 'scripts', 'generate-news.ts'), 'utf8');

    expect(script).toMatch(/worklist\.items\.filter\(hasSourceSubstance\)/);
    expect(script.indexOf('filter(hasSourceSubstance)')).toBeLessThan(script.indexOf('.slice(0, MAX_ARTICLES)'));
  });

  /* 리뷰 #50: 0쌍을 쓰고 exit 0 이면 조용히 멈춘다. publish-local.sh 는 요약 줄이 있는 exit 1 을 "새 글 없음"으로 읽는다. */
  it('headline-only 로 전부 걸러지면 요약 줄을 찍고 exit 1', () => {
    const script = readFileSync(join(process.cwd(), 'scripts', 'generate-news.ts'), 'utf8');
    const block = script.slice(script.indexOf('if (items.length === 0)'), script.indexOf('const generationGuide'));

    expect(block).toMatch(/article pair\(s\) written/);
    expect(block).toMatch(/process\.exit\(headlineOnly > 0 \? 1 : 0\)/);
  });
});

describe('fetch-llm-news wiring', () => {
  /* 리뷰 #50 CRITICAL: 최신 8건을 먼저 자르면 원문 있는 첫 항목(10/25 실측 12번째)이 worklist 에 오지 못한다. */
  it('filters headline-only items before the MAX_ITEMS cap', () => {
    const script = readFileSync(join(process.cwd(), 'scripts', 'fetch-llm-news.ts'), 'utf8');
    const filterAt = script.indexOf('.filter(hasSourceSubstance)');

    expect(filterAt).toBeGreaterThan(-1);
    expect(filterAt).toBeLessThan(script.indexOf('.slice(0, MAX_ITEMS)'));
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

describe('countSourceSubstanceBySource', () => {
  it('피드 이름별로 전체 수와 원문 통과 수를 센다', () => {
    const long = 'x'.repeat(MIN_SOURCE_CHARS + 10);
    const items = [
      item({ source: 'A', url: 'https://a/1', title: 'a1', summary: long }),
      item({ source: 'A', url: 'https://a/2', title: 'a2', summary: null }),
      item({ source: 'B', url: 'https://b/1', title: 'b1', summary: null }),
    ];
    expect(countSourceSubstanceBySource(items)).toEqual([
      { source: 'A', passing: 1, total: 2 },
      { source: 'B', passing: 0, total: 1 },
    ]);
  });
});
