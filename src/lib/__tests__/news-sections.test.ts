import path from 'node:path';
import {
  SECTIONS,
  SECTION_IDS,
  getArticleSection,
  getNewsBySection,
  getSection,
  getSectionsWithCounts,
} from '@/lib/news-sections';
import type { NewsMeta } from '@/types/news';

const FIXTURES = path.join(__dirname, 'fixtures', 'news');

function makeMeta(overrides: Partial<NewsMeta>): NewsMeta {
  return {
    title: '제목',
    lang: 'ko',
    date: '2026-06-15',
    slug: 'slug',
    summary: '요약',
    tags: [],
    sources: [],
    ...overrides,
  };
}

describe('getArticleSection', () => {
  it('모델 출시 기사는 models로 분류한다', () => {
    const article = makeMeta({ tags: ['GPT-5.6', '모델출시'], title: 'GPT-5.6 출시' });
    expect(getArticleSection(article)).toBe('models');
  });

  it('오픈소스 모델 기사는 models로 분류한다', () => {
    expect(getArticleSection(makeMeta({ tags: ['오픈소스', 'Qwen'] }))).toBe('models');
  });

  it('개발 도구/제품 기사는 products로 분류한다', () => {
    const article = makeMeta({ tags: ['Copilot', '개발도구', 'AI 코딩'], title: 'GitHub Copilot 종량제 전환' });
    expect(getArticleSection(article)).toBe('products');
  });

  it('펀딩/매출 기사는 모델 키워드가 있어도 business가 우선한다', () => {
    const article = makeMeta({ tags: ['Anthropic', 'Claude', 'ARR', '기업성장'], title: '앤트로픽 ARR 300억 달러 돌파' });
    expect(getArticleSection(article)).toBe('business');
  });

  it('IPO 기사는 business로 분류한다', () => {
    expect(getArticleSection(makeMeta({ tags: ['IPO', 'OpenAI'] }))).toBe('business');
  });

  it('보안/규제 기사는 모델 키워드가 있어도 policy가 우선한다', () => {
    const article = makeMeta({ tags: ['Anthropic', 'Claude', '사이버보안', '보안'], title: 'Claude 악용 사이버 공격' });
    expect(getArticleSection(article)).toBe('policy');
  });

  it('수출규제는 투자 키워드보다 policy가 우선한다 (policy > business)', () => {
    expect(getArticleSection(makeMeta({ tags: ['수출규제', '투자'] }))).toBe('policy');
  });

  it('영문 태그(export controls/regulation)도 policy로 분류한다', () => {
    expect(getArticleSection(makeMeta({ lang: 'en', tags: ['export controls', 'NVIDIA'] }))).toBe('policy');
  });

  it('매칭되는 키워드가 없으면 culture로 폴백한다', () => {
    expect(getArticleSection(makeMeta({ tags: ['인재', '한국'], title: 'AI 연구자 이직 동향' }))).toBe('culture');
  });

  it('태그가 없고 중립 제목이면 culture로 폴백한다', () => {
    expect(getArticleSection(makeMeta({ tags: [], title: '오늘의 소식' }))).toBe('culture');
  });

  it('ascii 키워드는 단어 경계로 매칭한다 (api가 단어 내부면 오탐하지 않음)', () => {
    // 'therapidly'는 'api'를 부분 문자열로 포함하지만 단어가 아니므로 products가 아니다.
    expect(getArticleSection(makeMeta({ tags: [], title: 'something therapidly happens' }))).toBe('culture');
  });

  it('복수형 ascii 키워드도 매칭한다 (agent → agents)', () => {
    expect(getArticleSection(makeMeta({ tags: ['AI Agents'], lang: 'en' }))).toBe('products');
  });
});

describe('SECTIONS / getSection', () => {
  it('5개 섹션을 정의하고 모든 id가 고유하다', () => {
    expect(SECTIONS).toHaveLength(5);
    expect(new Set(SECTION_IDS).size).toBe(5);
  });

  it('getSection은 id로 섹션 메타를 반환하고, 없으면 undefined', () => {
    expect(getSection('models')?.labelKo).toBeTruthy();
    expect(getSection('models')?.labelEn).toBeTruthy();
    expect(getSection('nope')).toBeUndefined();
  });
});

describe('getNewsBySection / getSectionsWithCounts (fixtures)', () => {
  it('LLM 태그 기사들은 models 섹션으로 모인다', () => {
    // ko fixtures: alpha/beta/gamma 모두 LLM 태그 → 전부 models
    const items = getNewsBySection('models', 'ko', FIXTURES);
    expect(items.map((i) => i.slug)).toEqual(['gamma', 'beta', 'alpha']);
  });

  it('다른 섹션은 비어 있다', () => {
    expect(getNewsBySection('business', 'ko', FIXTURES)).toEqual([]);
  });

  it('getSectionsWithCounts는 전 섹션을 표시순으로 반환하고 카운트를 채운다', () => {
    const counts = getSectionsWithCounts('ko', FIXTURES);
    expect(counts).toHaveLength(5);
    const models = counts.find((c) => c.section.id === 'models');
    expect(models?.count).toBe(3);
    const business = counts.find((c) => c.section.id === 'business');
    expect(business?.count).toBe(0);
    // 표시순 첫 번째는 models
    expect(counts[0]?.section.id).toBe('models');
  });
});
