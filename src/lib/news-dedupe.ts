import type { FeedItem } from './news-feed';

/**
 * 같은 사건을 다룬 글을 알아본다 (2026-11-02 점검: 11/01 에 Meta Muse 기사 두 편, Founder Summit 두 편).
 *
 * 기준은 제목과 요약 앞부분에서 뽑은 낱말의 겹침이다.
 * - 겹친 낱말이 둘 이상이고, 그중 하나는 "드문" 낱말(회사 이름이나 흔한 뉴스 단어가 아닌 것)이어야 한다.
 * - OpenAI·Anthropic·Google 같은 큰 회사 이름은 드문 낱말로 치지 않는다. 같은 날 두 회사가 둘 다 나온다고
 *   같은 사건이 아니다.
 * - 낱말 겹침 비율(작은 쪽 기준)이 0.3 이상이면 같은 사건이다. 비율이 낮아도(0.15 이상) 양쪽 요약이 문장 중간에서
 *   대문자로 쓴 고유명사(Muse, Hugging Face, Astra …)를 함께 말하면 같은 사건이다. Wired 제목과 Verge 제목은
 *   "Meta" 하나만 겹치지만(비율 0.17) 요약에서 둘 다 "Muse" 를 짚는다.
 * 기준은 2026-08~11 기사 936건의 같은 날 쌍으로 맞췄다(진짜 중복 다수, 비율 0.3 미만 구간은 대부분 우연한 겹침).
 */
export const MIN_SHARED_KEYWORDS = 2;
export const MIN_OVERLAP_RATIO = 0.3;
export const MIN_PROPER_NOUN_RATIO = 0.15;
const SUMMARY_SCAN_CHARS = 300;
const MIN_KEYWORD_LENGTH = 3;

const STOPWORDS = new Set((
  'the and for with from that this these those into onto over under after before about than then them they their there here ' +
  'are was were been being has have had having not but its his her our your you who whom what when where which while will would ' +
  'could should can may might must also just now still yet more most much many some any all one two out off per via vs how why ' +
  'says said say new now ahead amid announces announced announce launches launched launch reportedly report reports reported ' +
  'shows show showed gets get got makes make made takes take took plans plan planned set sets ' +
  'ai artificial intelligence model models tool tools company companies startup startups tech technology year years week weeks ' +
  'data center centre centers ceo cto ipo ' +
  'january february march april june july august september october november december ' +
  'day days time first latest big next best top may billion million trillion first how new ' +
  'hasn doesn isn wasn don didn won can won\'t'
).split(/\s+/));

/** 큰 회사·제품 이름: 같은 날 여러 기사에 나오므로 단독으로는 같은 사건의 증거가 못 된다. */
const COMMON_ENTITIES = new Set([
  'openai', 'anthropic', 'google', 'meta', 'microsoft', 'nvidia', 'apple', 'amazon', 'xai', 'deepmind',
  'chatgpt', 'claude', 'gemini', 'copilot', 'llama', 'gpt', 'samsung', 'tesla', 'spacex', 'intel', 'amd',
  // 자주 등장하는 인물: 같은 사람이 나온다고 같은 사건은 아니다.
  'sam', 'altman', 'elon', 'musk', 'trump', 'dario', 'amodei', 'zuckerberg', 'nadella', 'pichai', 'jensen', 'huang',
]);

export type EventText = Pick<FeedItem, 'title' | 'summary'>;

function plain(text: string): string {
  return text.replace(/<[^>]*>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ');
}

function stem(word: string): string {
  return word.length > 4 && word.endsWith('s') && !word.endsWith('ss') ? word.slice(0, -1) : word;
}

/** 제목과 요약 앞부분의 낱말 집합. 소문자, 불용어 제외, 복수형 단순화. */
export function eventKeywords(text: EventText): Set<string> {
  const source = `${plain(text.title)} ${plain(text.summary ?? '').slice(0, SUMMARY_SCAN_CHARS)}`;
  const keywords = new Set<string>();
  for (const raw of source.toLowerCase().split(/[^a-z0-9$]+/)) {
    const word = stem(raw);
    if (word.length < MIN_KEYWORD_LENGTH || STOPWORDS.has(word) || STOPWORDS.has(raw)) continue;
    keywords.add(word);
  }
  return keywords;
}

function isRare(keyword: string): boolean {
  return !COMMON_ENTITIES.has(keyword);
}

/** 요약에서 문장 첫 낱말이 아닌데 대문자로 시작하는 낱말. 제목은 제목체라 모든 낱말이 대문자여서 보지 않는다. */
function properNouns(text: EventText): Set<string> {
  const nouns = new Set<string>();
  const sentences = plain(text.summary ?? '').slice(0, SUMMARY_SCAN_CHARS).split(/[.!?]\s+/);
  for (const sentence of sentences) {
    for (const raw of sentence.split(/[^A-Za-z0-9$]+/).filter(Boolean).slice(1)) {
      if (/^[A-Z]/.test(raw)) nouns.add(stem(raw.toLowerCase()));
    }
  }
  return nouns;
}

export function isSameEvent(a: EventText, b: EventText): boolean {
  const left = eventKeywords(a);
  const right = eventKeywords(b);
  const shared = Array.from(left).filter((keyword) => right.has(keyword));
  if (shared.length < MIN_SHARED_KEYWORDS) return false;
  const rare = shared.filter(isRare);
  if (rare.length === 0) return false;
  const ratio = shared.length / Math.min(left.size, right.size);
  if (ratio >= MIN_OVERLAP_RATIO) return true;
  if (ratio < MIN_PROPER_NOUN_RATIO) return false;
  const leftNouns = properNouns(a);
  const rightNouns = properNouns(b);
  return rare.some((keyword) => leftNouns.has(keyword) && rightNouns.has(keyword));
}

/** 같은 사건끼리 묶는다. 입력 순서를 지키고, 각 묶음의 첫 항목이 대표(lead)다. */
export function groupSameEvent<T extends EventText>(items: T[]): T[][] {
  const groups: T[][] = [];
  for (const item of items) {
    const group = groups.find((members) => members.some((member) => isSameEvent(member, item)));
    if (group) group.push(item);
    else groups.push([item]);
  }
  return groups;
}
