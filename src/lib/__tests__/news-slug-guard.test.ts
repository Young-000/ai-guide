import path from 'node:path';
import { isSlugTaken } from '@/lib/news-slug-guard';

const FIXTURES = path.join(__dirname, 'fixtures', 'news');

describe('isSlugTaken', () => {
  it('returns true when the slug already exists in ko', () => {
    expect(isSlugTaken('beta', FIXTURES)).toBe(true);
  });

  it('returns true when the slug already exists in en only', () => {
    // 'alpha' exists in both ko and en fixtures — still must be caught.
    expect(isSlugTaken('alpha', FIXTURES)).toBe(true);
  });

  it('returns false for a slug that does not exist in either lang', () => {
    expect(isSlugTaken('brand-new-slug', FIXTURES)).toBe(false);
  });
});
