import { groupSameEvent, isSameEvent } from './news-dedupe';
import type { FeedItem } from './news-feed';
import { hasSourceSubstance, isPromotionalItem, isWritableSource } from './news-source';

/** 기사 한 편의 재료: 대표 원문 + 같은 사건을 다룬 다른 매체 원문. */
export type Story = FeedItem & { related?: FeedItem[] };

export type SkipReason =
  | 'headline-only'
  | 'promotional'
  | 'too-few-sources'
  | 'same-event-published-today'
  | 'daily-limit'
  | 'run-limit';

export type PlanInput = {
  stories: Story[];
  publishedToday: number;
  dailyLimit: number;
  runLimit: number;
  minSources: number;
  /** 오늘 날짜로 이미 발행된 기사(영어판)의 제목·요약·출처. */
  todaysArticles: { title: string; summary: string; sources: { title: string; url: string }[] }[];
};

export type Plan = {
  selected: Story[];
  skipped: { story: Story; reason: SkipReason }[];
};

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** 대표 원문 + 관련 원문, URL 중복 제거. */
export function storySources(story: Story): FeedItem[] {
  const { related, ...lead } = story;
  const seen = new Set<string>();
  return [lead as FeedItem, ...(related ?? [])].filter((source) => {
    if (seen.has(source.url)) return false;
    seen.add(source.url);
    return true;
  });
}

function distinctHosts(story: Story): number {
  return new Set(storySources(story).map((source) => hostOf(source.url))).size;
}

/**
 * 수집 단계: 기사로 쓸 수 있는 원문만 남기고, 같은 사건끼리 묶고, 출처 매체가 minSources 곳 이상인 묶음만 돌려준다.
 * 입력 순서(최신순)를 지킨다. 출처가 모자란 사건은 버리지 않고 이번엔 넘긴다 — 원장(_published.json)에 넣지 않으므로
 * 다음 회차에 다른 매체가 같은 사건을 다루면 그때 묶인다.
 */
export function buildStories(items: FeedItem[], options: { minSources: number }): Story[] {
  const writable = items.filter(isWritableSource);
  return groupSameEvent(writable)
    .map(([lead, ...related]): Story => ({ ...lead, ...(related.length > 0 ? { related } : {}) }))
    .filter((story) => distinctHosts(story) >= options.minSources);
}

/** 오늘 이미 발행된 기사와 같은 사건인가 (같은 출처 URL이거나 제목·요약이 같은 사건). */
export function isCoveredToday(story: Story, todaysArticles: PlanInput['todaysArticles']): boolean {
  return todaysArticles.some((article) =>
    storySources(story).some(
      (source) =>
        isSameEvent(source, article) ||
        article.sources.some((cited) => cited.url === source.url || isSameEvent(source, { title: cited.title, summary: null })),
    ),
  );
}

function skipReason(story: Story, input: PlanInput): SkipReason | null {
  if (isPromotionalItem(story)) return 'promotional';
  if (!hasSourceSubstance(story)) return 'headline-only';
  if (distinctHosts(story) < input.minSources) return 'too-few-sources';
  return isCoveredToday(story, input.todaysArticles) ? 'same-event-published-today' : null;
}

/** 생성 단계: 하루·회차 상한과 사전 검사를 적용해 모델 호출 대상을 정한다. 호출 전에 걸러 한도를 아낀다. */
export function planGeneration(input: PlanInput): Plan {
  const remainingToday = Math.max(0, input.dailyLimit - input.publishedToday);
  const budget = Math.min(remainingToday, input.runLimit);
  const plan: Plan = { selected: [], skipped: [] };
  for (const story of input.stories) {
    const reason = skipReason(story, input);
    if (reason) plan.skipped.push({ story, reason });
    else if (plan.selected.length >= budget) {
      plan.skipped.push({ story, reason: remainingToday <= plan.selected.length ? 'daily-limit' : 'run-limit' });
    } else plan.selected.push(story);
  }
  return plan;
}
