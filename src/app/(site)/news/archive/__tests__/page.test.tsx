import { generateMetadata } from '../page';

describe('archive index generateMetadata', () => {
  it('제목에 아카이브 키워드가 포함된다', () => {
    const metadata = generateMetadata();
    expect(String(metadata.title)).toContain('아카이브');
  });

  it('canonical URL이 /news/archive로 설정된다', () => {
    const metadata = generateMetadata();
    expect((metadata.alternates as { canonical: string }).canonical).toMatch(/\/news\/archive$/);
  });

  it('description이 존재한다', () => {
    const metadata = generateMetadata();
    expect(metadata.description).toBeTruthy();
  });
});
