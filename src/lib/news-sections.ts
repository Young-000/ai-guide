import { getAllNews } from '@/lib/news';
import type { NewsLang, NewsMeta } from '@/types/news';

/**
 * TLDR AI 식 주제 섹션. 태그 기반 토픽 페이지(/news/topic/[tag])의 상위 묶음 레이어.
 * 한 기사 = 정확히 한 섹션 (rule-base, LLM 호출 없음).
 */
export const SECTION_IDS = ['models', 'products', 'business', 'policy', 'culture'] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export type NewsSection = {
  id: SectionId;
  labelKo: string;
  labelEn: string;
  descriptionKo: string;
  descriptionEn: string;
};

/**
 * 표시순(홈/내비). 분류 우선순위와는 별개다 (CLASSIFY_RULES 참고).
 */
export const SECTIONS: readonly NewsSection[] = [
  {
    id: 'models',
    labelKo: '모델·연구',
    labelEn: 'Models & Research',
    descriptionKo: '새 AI 모델 출시와 연구 동향',
    descriptionEn: 'New AI model releases and research',
  },
  {
    id: 'products',
    labelKo: '제품·도구',
    labelEn: 'Products & Tools',
    descriptionKo: 'AI 제품, 앱, 개발 도구 소식',
    descriptionEn: 'AI products, apps, and developer tools',
  },
  {
    id: 'business',
    labelKo: '비즈니스·투자',
    labelEn: 'Business & Funding',
    descriptionKo: '투자, 펀딩, 인수합병과 시장 동향',
    descriptionEn: 'Funding, M&A, and market moves',
  },
  {
    id: 'policy',
    labelKo: '정책·안전',
    labelEn: 'Policy & Safety',
    descriptionKo: 'AI 규제, 정책, 보안과 안전',
    descriptionEn: 'AI regulation, policy, security, and safety',
  },
  {
    id: 'culture',
    labelKo: '문화·사회',
    labelEn: 'Culture & Society',
    descriptionKo: 'AI가 바꾸는 사회, 사람, 일상',
    descriptionEn: 'How AI is reshaping society, people, and work',
  },
];

const SECTION_BY_ID: Readonly<Record<SectionId, NewsSection>> = Object.fromEntries(
  SECTIONS.map((s) => [s.id, s]),
) as Record<SectionId, NewsSection>;

export function getSection(id: string): NewsSection | undefined {
  return SECTION_BY_ID[id as SectionId];
}

export function isSectionId(id: string): id is SectionId {
  return Object.prototype.hasOwnProperty.call(SECTION_BY_ID, id);
}

type SectionRule = {
  id: SectionId;
  /** 한글/비-ASCII 키워드: 부분 문자열 매칭 */
  korean: readonly string[];
  /** ASCII 키워드: 단어 경계 + 복수형(s) 매칭 (제목 free-text 오탐 방지) */
  ascii: readonly string[];
};

/**
 * 분류 우선순위(위에서 아래로, 먼저 매칭되는 섹션이 이김):
 *   policy > business > models > products > (default) culture
 *
 * 근거:
 *  - 규제/보안 프레임은 어떤 모델 이야기든 정책 사안이므로 최우선.
 *  - 펀딩/M&A/매출은 모델·제품 프레임보다 비즈니스 사안이 본질.
 *  - 파운데이션 모델/연구는 응용 제품보다 우선(모델 출시가 핵심).
 *  - 회사명(Anthropic/OpenAI/Google)은 너무 흔해 섹션 신호로 쓰지 않는다.
 */
const CLASSIFY_RULES: readonly SectionRule[] = [
  {
    id: 'policy',
    korean: [
      '규제',
      '정책',
      '저작권',
      '안전',
      '보안',
      '수출규제',
      '수출통제',
      '수출 통제',
      '지정학',
      '백악관',
      '거버넌스',
      '행정명령',
      '국가안보',
      '개인정보',
      '감시',
    ],
    ascii: [
      'regulation',
      'policy',
      'governance',
      'safety',
      'security',
      'cybersecurity',
      'export control',
      'geopolitics',
      'white house',
      'lawsuit',
      'copyright',
      'privacy',
      'sanction',
      'five eyes',
      'antitrust',
    ],
  },
  {
    id: 'business',
    korean: [
      '투자',
      '펀딩',
      '인수',
      '합병',
      '매출',
      '기업가치',
      '유니콘',
      '상장',
      '자금조달',
      '비즈니스',
      '기업성장',
      '시장',
      '엔터프라이즈',
    ],
    ascii: [
      'funding',
      'invest',
      'investment',
      'investor',
      'ipo',
      'm&a',
      'acquisition',
      'merger',
      'revenue',
      'arr',
      'valuation',
      'unicorn',
      'startup',
      'enterprise',
      'billion',
      'market',
      'deal',
    ],
  },
  {
    id: 'models',
    korean: [
      '모델',
      '오픈소스',
      '오픈웨이트',
      '멀티모달',
      '추론',
      '세계모델',
      '온디바이스',
      '파라미터',
      '벤치마크',
      '사전학습',
      '미세조정',
    ],
    ascii: [
      'llm',
      'gpt',
      'claude',
      'gemini',
      'multimodal',
      'open-source',
      'open source',
      'open-weight',
      'moe',
      'world model',
      'reasoning',
      'fable',
      'qwen',
      'benchmark',
      'frontier model',
      'foundation model',
      'llama',
      'mistral',
    ],
  },
  {
    id: 'products',
    korean: [
      '앱',
      '출시',
      '도구',
      '개발도구',
      '코딩',
      '에이전트',
      '플랫폼',
      '기능',
      '업데이트',
      '서비스',
    ],
    ascii: [
      'api',
      'app',
      'copilot',
      'agent',
      'sdk',
      'platform',
      'tool',
      'coding',
      'plugin',
      'ide',
      'github',
      'chatbot',
      'assistant',
      'chatgpt',
      'browser',
    ],
  },
];

const DEFAULT_SECTION: SectionId = 'culture';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * ASCII 키워드를 단어 경계 + 선택적 복수형(s)으로 매칭.
 * 'agent'→'agents' 매칭, 'api'→'therapidly'(단어 내부) 오탐 방지.
 */
function asciiMatch(keyword: string, haystack: string): boolean {
  const re = new RegExp(`(?:^|[^a-z0-9])${escapeRegExp(keyword)}s?(?:[^a-z0-9]|$)`);
  return re.test(haystack);
}

function buildHaystack(article: NewsMeta): string {
  return [...article.tags, article.title].join(' ').toLowerCase();
}

function ruleMatches(rule: SectionRule, haystack: string): boolean {
  for (const kw of rule.korean) {
    if (haystack.includes(kw.toLowerCase())) return true;
  }
  for (const kw of rule.ascii) {
    if (asciiMatch(kw.toLowerCase(), haystack)) return true;
  }
  return false;
}

/**
 * 기사를 정확히 한 섹션에 매핑. 순수 함수 (입력만으로 결정, 부수효과 없음).
 */
export function getArticleSection(article: NewsMeta): SectionId {
  const haystack = buildHaystack(article);
  for (const rule of CLASSIFY_RULES) {
    if (ruleMatches(rule, haystack)) return rule.id;
  }
  return DEFAULT_SECTION;
}

/**
 * 해당 섹션의 기사 목록 (getAllNews가 날짜 내림차순 정렬을 보장).
 */
export function getNewsBySection(
  section: SectionId,
  lang: NewsLang,
  root?: string,
): NewsMeta[] {
  return getAllNews(lang, root).filter((article) => getArticleSection(article) === section);
}

/**
 * 전 섹션을 표시순으로, 각 섹션의 기사 수와 함께 반환 (카운트 0 포함).
 */
export function getSectionsWithCounts(
  lang: NewsLang,
  root?: string,
): { section: NewsSection; count: number }[] {
  const counts = new Map<SectionId, number>(SECTION_IDS.map((id) => [id, 0]));
  for (const article of getAllNews(lang, root)) {
    const id = getArticleSection(article);
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return SECTIONS.map((section) => ({ section, count: counts.get(section.id) ?? 0 }));
}
