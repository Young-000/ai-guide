/**
 * @jest-environment node
 */
import type { FeedItem } from '@/lib/news-feed';
import { isPromotionalItem, isWritableSource } from '@/lib/news-source';

/**
 * 행사·홍보 글은 뉴스가 아니다 (2026-11-02 점검: 11/01 기사 5건 중 2건이 TechCrunch Founder Summit 등록 안내).
 * 제목은 실제 발행 기사의 출처 제목이다 (src/content/news/en, 2026-09-14~11-01).
 */
const LONG_TEXT = 'The company said the update changes how developers pay for usage and what limits apply. '.repeat(4);

function item(title: string, summary: string | null = LONG_TEXT): FeedItem {
  return { source: 'TechCrunch AI', title, url: `https://example.com/${encodeURIComponent(title)}`, publishedAt: null, summary };
}

describe('isPromotionalItem', () => {
  it.each([
    '4 days left: How TechCrunch Founder Summit helps you make more useful connections to scale',
    'Skip the small talk: Make game-changing connections at TechCrunch Founder Summit with Braindate',
    '48 hours to TechCrunch Disrupt 2026 — hear directly from the people building what’s next',
    'Learn how to build lasting AI defensibility at Disrupt 2026',
    'Last chance: save up to $400 on your pass before prices rise',
    'Register now for our AI agents webinar',
    'Early bird tickets end tonight',
  ])('flags an event or ticket promotion: %s', (title) => {
    expect(isPromotionalItem(item(title))).toBe(true);
  });

  it.each([
    'Anthropic signs $35B cloud deal with Nvidia-backed provider',
    'OpenAI Testing Sponsored Agents For ChatGPT Ads',
    'Caltech students organized a Mathathon sponsored by Anthropic and OpenAI. Then came the backlash',
    'Meta’s Muse Could Upend All Kinds of Businesses. It Hasn’t Yet',
    'EU AI Act News 2026: The Revised Timeline, August Enforcement & Omnibus Deal Explained',
  ])('keeps real news that only shares a word with a promotion: %s', (title) => {
    expect(isPromotionalItem(item(title))).toBe(false);
  });

  it('flags a body that is marked as sponsored content', () => {
    expect(isPromotionalItem(item('A new AI notetaker', 'Sponsored content: ' + LONG_TEXT))).toBe(true);
  });
});

describe('isWritableSource', () => {
  it('rejects a promotion even when it has enough source text', () => {
    expect(isWritableSource(item('4 days left: Founder Summit passes'))).toBe(false);
  });

  it('rejects a headline-only item', () => {
    expect(isWritableSource(item('Anthropic ships a new model', null))).toBe(false);
  });

  it('accepts real news with source text', () => {
    expect(isWritableSource(item('Anthropic changes how Claude Code usage is billed'))).toBe(true);
  });
});
