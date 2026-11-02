/**
 * @jest-environment node
 */
import type { FeedItem } from '@/lib/news-feed';
import { buildStories, planGeneration, storySources } from '@/lib/news-plan';
import type { Story } from '@/lib/news-plan';

// Padding made only of stopwords: it counts as source text but adds no keywords, so items stay distinct.
const FILLER =
  'and the of to in for with from that this these those into onto over under after before about than then them they their there here '.repeat(2);

function feed(title: string, url: string, summary: string | null = FILLER): FeedItem {
  return { source: 'Feed', title, url, publishedAt: '2026-11-02T01:00:00Z', summary };
}

const WIRED = feed(
  'Meta’s Muse Could Upend All Kinds of Businesses. It Hasn’t Yet',
  'https://www.wired.com/story/muse',
  'Companies told investors that Meta’s Muse and other AI agents are more opportunity than threat. ' + FILLER,
);
const VERGE = feed(
  'I built an AI Tamagotchi before Meta could',
  'https://www.theverge.com/muse-charm',
  'Meta plans to sell its Muse Charm pocket AI companion this holiday season. ' + FILLER,
);
const LONE = feed('Anthropic changes how Claude Code usage is billed', 'https://example.com/billing');
const PROMO = feed('4 days left: TechCrunch Founder Summit passes', 'https://techcrunch.com/summit');
const TITLE_ONLY = feed('Some model ships', 'https://example.com/title-only', null);

describe('buildStories', () => {
  it('turns two outlets covering one event into one story with the second as related', () => {
    const stories = buildStories([WIRED, LONE, VERGE], { minSources: 2 });

    expect(stories).toHaveLength(1);
    expect(stories[0].url).toBe(WIRED.url);
    expect(stories[0].related).toEqual([VERGE]);
  });

  it('drops promotions, headline-only items and stories with too few sources', () => {
    expect(buildStories([PROMO, TITLE_ONLY, LONE], { minSources: 2 })).toEqual([]);
  });

  it('does not count two URLs from the same host as two sources', () => {
    const sameHost = feed('Meta Muse could upend businesses, Wired says', 'https://www.wired.com/story/muse-2', WIRED.summary);

    expect(buildStories([WIRED, sameHost], { minSources: 2 })).toEqual([]);
  });

  it('keeps single-source stories when one source is enough', () => {
    expect(buildStories([LONE], { minSources: 1 })).toHaveLength(1);
  });
});

describe('storySources', () => {
  it('lists the lead first, then related items, once per URL', () => {
    const story: Story = { ...WIRED, related: [VERGE, { ...VERGE }] };

    expect(storySources(story).map((source) => source.url)).toEqual([WIRED.url, VERGE.url]);
  });
});

describe('planGeneration', () => {
  const base = { publishedToday: 0, dailyLimit: 2, runLimit: 3, minSources: 2, todaysArticles: [] };
  const muse: Story = { ...WIRED, related: [VERGE] };
  const second: Story = { ...feed('Nvidia opens a Texas plant', 'https://a.example/nv'), related: [feed('Nvidia Texas plant opens', 'https://b.example/nv')] };
  const third: Story = { ...feed('Mistral raises money', 'https://a.example/mi'), related: [feed('Mistral funding round', 'https://b.example/mi')] };

  it('selects stories up to the remaining daily budget', () => {
    const plan = planGeneration({ ...base, publishedToday: 1, stories: [muse, second, third] });

    expect(plan.selected).toEqual([muse]);
    expect(plan.skipped.map((entry) => entry.reason)).toEqual(['daily-limit', 'daily-limit']);
  });

  it('stops at the run limit even when the day has budget left', () => {
    const plan = planGeneration({ ...base, dailyLimit: 10, runLimit: 1, stories: [muse, second] });

    expect(plan.selected).toEqual([muse]);
    expect(plan.skipped[0].reason).toBe('run-limit');
  });

  it('selects nothing once the daily limit is reached', () => {
    const plan = planGeneration({ ...base, publishedToday: 2, stories: [muse] });

    expect(plan.selected).toEqual([]);
    expect(plan.skipped[0].reason).toBe('daily-limit');
  });

  it('skips a story with too few sources before spending a model call', () => {
    const plan = planGeneration({ ...base, stories: [LONE] });

    expect(plan.selected).toEqual([]);
    expect(plan.skipped[0].reason).toBe('too-few-sources');
  });

  it('skips a story about an event already published today', () => {
    const today = [{
      title: 'Meta’s Muse Could Disrupt Many Businesses, but Hasn’t Yet',
      summary: 'Companies have spent weeks telling investors that Meta’s Muse and other AI agents are more opportunity than threat.',
      sources: [{ title: 'Meta’s Muse Could Upend All Kinds of Businesses. It Hasn’t Yet', url: WIRED.url }],
    }];
    const plan = planGeneration({ ...base, stories: [{ ...VERGE, related: [WIRED] }, second], todaysArticles: today });

    expect(plan.selected).toEqual([second]);
    expect(plan.skipped[0].reason).toBe('same-event-published-today');
  });

  it('does not let a skipped item use up the budget, so a later qualifying story still gets the slot', () => {
    const plan = planGeneration({ ...base, dailyLimit: 1, stories: [{ ...TITLE_ONLY, related: [LONE] }, muse] });

    expect(plan.selected).toEqual([muse]);
    expect(plan.skipped.map((entry) => entry.reason)).toEqual(['headline-only']);
  });

  it('skips promotions and headline-only items that reach the planner from an old worklist', () => {
    const plan = planGeneration({ ...base, stories: [{ ...PROMO, related: [LONE] }, { ...TITLE_ONLY, related: [LONE] }] });

    expect(plan.selected).toEqual([]);
    expect(plan.skipped.map((entry) => entry.reason)).toEqual(['promotional', 'headline-only']);
  });
});
