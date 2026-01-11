import {
  searchSituations,
  getPopularSituations,
  getSituationsByCategory,
} from '../search';
import type { Situation } from '@/types';

const mockSituations: Situation[] = [
  {
    slug: 'pdf-summary',
    title: 'PDF 문서 빠르게 요약하기',
    subtitle: '100페이지 보고서도 10분 만에 핵심만 파악',
    icon: '📄',
    category: 'work',
    difficulty: 'easy',
    timeToComplete: '5-10분',
    problem: '긴 PDF 문서를 읽을 시간이 없는데, 핵심 내용은 파악해야 할 때',
    searchKeywords: ['pdf', '요약', '문서', '보고서'],
    naturalQueries: ['PDF 요약하고 싶어요', '문서 요약해줘'],
    priority: 1,
    recommendedTools: [],
    steps: [],
    prompts: [],
    expectedResult: '',
  },
  {
    slug: 'code-debug',
    title: '코드 에러 해결하기',
    subtitle: '에러 메시지 복붙하면 해결책이 바로',
    icon: '🐛',
    category: 'coding',
    difficulty: 'medium',
    timeToComplete: '5-15분',
    problem: '코드에서 에러가 나는데 원인을 모르겠을 때',
    searchKeywords: ['코드', '에러', '버그', '디버그'],
    naturalQueries: ['코드 에러 해결해줘', '버그 수정'],
    priority: 2,
    recommendedTools: [],
    steps: [],
    prompts: [],
    expectedResult: '',
  },
  {
    slug: 'email-writing',
    title: '비즈니스 이메일 작성하기',
    subtitle: '상황에 맞는 격식있는 이메일을 빠르게',
    icon: '📧',
    category: 'work',
    difficulty: 'easy',
    timeToComplete: '5-10분',
    problem: '영어나 한국어로 격식 있는 이메일을 작성해야 할 때',
    searchKeywords: ['이메일', '메일', '영어', '작성'],
    naturalQueries: ['이메일 작성해줘', '영어 이메일'],
    priority: 3,
    recommendedTools: [],
    steps: [],
    prompts: [],
    expectedResult: '',
  },
];

describe('searchSituations', () => {
  it('검색어가 없으면 priority 순으로 모든 결과 반환', () => {
    const results = searchSituations('', mockSituations);
    expect(results).toHaveLength(3);
    expect(results[0].situation.slug).toBe('pdf-summary');
    expect(results[1].situation.slug).toBe('code-debug');
    expect(results[2].situation.slug).toBe('email-writing');
  });

  it('제목에 매칭되는 검색어로 결과 반환', () => {
    const results = searchSituations('PDF', mockSituations);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].situation.slug).toBe('pdf-summary');
  });

  it('검색 키워드에 매칭되는 결과 반환', () => {
    const results = searchSituations('요약', mockSituations);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].situation.slug).toBe('pdf-summary');
  });

  it('카테고리 필터 적용', () => {
    const results = searchSituations('', mockSituations, 'work');
    expect(results).toHaveLength(2);
    results.forEach(r => {
      expect(r.situation.category).toBe('work');
    });
  });

  it('검색어와 카테고리 필터 동시 적용', () => {
    const results = searchSituations('이메일', mockSituations, 'work');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].situation.slug).toBe('email-writing');
  });

  it('매칭되는 결과가 없으면 빈 배열 반환', () => {
    const results = searchSituations('존재하지않는검색어xyz', mockSituations);
    expect(results).toHaveLength(0);
  });
});

describe('getPopularSituations', () => {
  it('priority 순으로 상위 N개 반환', () => {
    const results = getPopularSituations(mockSituations, 2);
    expect(results).toHaveLength(2);
    expect(results[0].slug).toBe('pdf-summary');
    expect(results[1].slug).toBe('code-debug');
  });

  it('limit보다 적은 데이터면 전체 반환', () => {
    const results = getPopularSituations(mockSituations, 10);
    expect(results).toHaveLength(3);
  });
});

describe('getSituationsByCategory', () => {
  it('해당 카테고리의 상황만 반환', () => {
    const results = getSituationsByCategory(mockSituations, 'coding');
    expect(results).toHaveLength(1);
    expect(results[0].slug).toBe('code-debug');
  });

  it('해당 카테고리가 없으면 빈 배열 반환', () => {
    const results = getSituationsByCategory(mockSituations, '없는카테고리');
    expect(results).toHaveLength(0);
  });
});
