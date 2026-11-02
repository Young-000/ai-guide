/**
 * @jest-environment node
 */
import type { FeedItem } from '@/lib/news-feed';
import { groupSameEvent, isSameEvent } from '@/lib/news-dedupe';

/**
 * 같은 날 같은 사건이 기사 두 편이 되는 문제 (2026-11-01 Meta Muse: Wired 의 사업 영향 기사 + Verge 의 Muse Charm 기사).
 * 제목에 겹치는 말이 "Meta" 하나뿐이라, 제목+요약의 고유명사(Muse)까지 봐야 한다.
 * 반대로 같은 날 OpenAI·Anthropic 이 둘 다 나온다고 같은 사건은 아니다.
 */
function feed(title: string, summary: string, url: string, source = 'Feed'): FeedItem {
  return { source, title, url, publishedAt: '2026-11-01T01:00:00Z', summary };
}

const WIRED = feed(
  'Meta’s Muse Could Upend All Kinds of Businesses. It Hasn’t Yet',
  'Companies have spent weeks telling investors that Meta’s Muse and other AI agents are more opportunity than threat.',
  'https://www.wired.com/story/metas-muse-could-upend-all-kinds-of-businesses-it-hasnt-yet/',
  'Wired',
);
const VERGE = feed(
  'I built an AI Tamagotchi before Meta could',
  'Meta plans to sell its Muse Charm pocket AI companion this holiday season. A Verge writer built a DIY version with an ESP32 first.',
  'https://www.theverge.com/gadgets/1013375/muse-charm-gadgets-preview',
  'The Verge',
);
const OPENAI_PRICING = feed(
  'OpenAI changes ChatGPT Business pricing for seats',
  'OpenAI said Business seats now cost less when an organization buys more than 50. Anthropic did not comment.',
  'https://example.com/openai-pricing',
);
const ANTHROPIC_COMPUTE = feed(
  'Anthropic signs a compute lease with a Texas data center operator',
  'Anthropic will rent 300 MW of capacity. OpenAI already leases a larger campus nearby.',
  'https://example.com/anthropic-compute',
);

describe('isSameEvent', () => {
  it('treats two articles about Meta Muse as one event even though the titles share one word', () => {
    expect(isSameEvent(WIRED, VERGE)).toBe(true);
  });

  it('does not merge different stories that only name the same big companies', () => {
    expect(isSameEvent(OPENAI_PRICING, ANTHROPIC_COMPUTE)).toBe(false);
  });

  it('merges outlets that rewrite the same headline', () => {
    const a = feed('Anthropic signs $35B cloud deal with Nvidia-backed provider', '', 'https://a.example/1');
    const b = feed('Anthropic Reportedly Strikes $35B Cloud Deal With Nvidia-Backed Provider', '', 'https://b.example/1');
    expect(isSameEvent(a, b)).toBe(true);
  });

  it('is symmetric', () => {
    expect(isSameEvent(VERGE, WIRED)).toBe(isSameEvent(WIRED, VERGE));
  });

  it('ignores generic words such as AI and says', () => {
    const a = feed('AI says new model is better', 'The AI says it is better.', 'https://a.example/2');
    const b = feed('AI says new tool is cheaper', 'The AI says it is cheaper.', 'https://b.example/2');
    expect(isSameEvent(a, b)).toBe(false);
  });
});

describe('groupSameEvent', () => {
  it('groups related items and keeps the first as the lead', () => {
    const groups = groupSameEvent([WIRED, OPENAI_PRICING, VERGE, ANTHROPIC_COMPUTE]);

    expect(groups).toHaveLength(3);
    expect(groups[0]).toEqual([WIRED, VERGE]);
    expect(groups[1]).toEqual([OPENAI_PRICING]);
    expect(groups[2]).toEqual([ANTHROPIC_COMPUTE]);
  });

  it('returns nothing for nothing', () => {
    expect(groupSameEvent([])).toEqual([]);
  });
});
