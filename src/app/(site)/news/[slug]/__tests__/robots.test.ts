/**
 * @jest-environment node
 */
// 페이지가 끌어오는 react-markdown(ESM)은 메타데이터와 무관하다 — jest 가 변환하지 못하므로 뷰를 비운다.
jest.mock('@/components/news/NewsArticleView', () => ({ __esModule: true, default: () => null }));

import { generateMetadata as generateKoMetadata } from '../page';
import { generateMetadata as generateEnMetadata } from '../../../en/news/[slug]/page';
import { getAllNews, getThinArticleSlugs } from '@/lib/news';

const thinSlug = Array.from(getThinArticleSlugs()).find((slug) =>
  getAllNews('ko').some((n) => n.slug === slug),
);
const solidSlug = getAllNews('ko').find((n) => !getThinArticleSlugs().has(n.slug))?.slug;

describe('article page robots — headline-only articles', () => {
  it('has both a headline-only and a solid article to test against (sanity check)', () => {
    expect(thinSlug).toBeDefined();
    expect(solidSlug).toBeDefined();
  });

  it('marks the ko page noindex,follow', () => {
    expect(generateKoMetadata({ params: { slug: thinSlug! } }).robots).toEqual({ index: false, follow: true });
  });

  it('marks the en page noindex,follow when the pair is thin', () => {
    const hasEn = getAllNews('en').some((n) => n.slug === thinSlug);
    if (!hasEn) return;
    expect(generateEnMetadata({ params: { slug: thinSlug! } }).robots).toEqual({ index: false, follow: true });
  });

  it('leaves a solid article indexable (no robots override)', () => {
    expect(generateKoMetadata({ params: { slug: solidSlug! } }).robots).toBeUndefined();
    expect(generateEnMetadata({ params: { slug: solidSlug! } }).robots).toBeUndefined();
  });
});
