import { truncateTitle, resolveFrontmatterImage } from '@/lib/og';

describe('truncateTitle', () => {
  it('keeps short titles unchanged', () => {
    expect(truncateTitle('짧은 제목')).toBe('짧은 제목');
  });

  it('collapses internal whitespace', () => {
    expect(truncateTitle('AI   뉴스\n속보')).toBe('AI 뉴스 속보');
  });

  it('appends an ellipsis when over the limit', () => {
    const long = 'a'.repeat(80);
    const result = truncateTitle(long, 70);
    expect(result).toHaveLength(70);
    expect(result.endsWith('…')).toBe(true);
  });

  it('does not truncate exactly at the boundary', () => {
    const exact = 'b'.repeat(70);
    expect(truncateTitle(exact, 70)).toBe(exact);
  });
});

describe('resolveFrontmatterImage', () => {
  it('returns null when no image is provided', () => {
    expect(resolveFrontmatterImage(undefined)).toBeNull();
  });

  it('passes through absolute URLs', () => {
    expect(resolveFrontmatterImage('https://cdn.example.com/a.png')).toBe(
      'https://cdn.example.com/a.png',
    );
  });

  it('prefixes BASE_URL for root-relative paths', () => {
    expect(resolveFrontmatterImage('/images/a.png')).toBe('https://aiwire.news/images/a.png');
  });

  it('prefixes BASE_URL with a slash for bare relative paths', () => {
    expect(resolveFrontmatterImage('images/a.png')).toBe('https://aiwire.news/images/a.png');
  });
});
