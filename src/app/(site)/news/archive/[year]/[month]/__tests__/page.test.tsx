import { generateStaticParams, generateMetadata } from '../page';
import { getArchiveMonths } from '@/lib/news';

describe('[year]/[month] page generateStaticParams', () => {
  it('ko 뉴스의 연월 목록을 반환한다', () => {
    const params = generateStaticParams();
    const months = getArchiveMonths('ko');
    expect(params).toEqual(months);
  });

  it('각 항목에 year·month 문자열이 있다', () => {
    const params = generateStaticParams();
    expect(params.length).toBeGreaterThan(0);
    for (const { year, month } of params) {
      expect(year).toMatch(/^\d{4}$/);
      expect(month).toMatch(/^\d{2}$/);
    }
  });
});

describe('[year]/[month] page generateMetadata', () => {
  let year: string;
  let month: string;

  beforeAll(() => {
    const [first] = getArchiveMonths('ko');
    year = first.year;
    month = first.month;
  });

  it('제목에 연도·월이 포함된다', () => {
    const metadata = generateMetadata({ params: { year, month } });
    const title = String(metadata.title);
    expect(title).toContain(year);
    expect(title).toContain(`${parseInt(month, 10)}월`);
  });

  it('canonical URL이 /news/archive/{year}/{month} 형태다', () => {
    const metadata = generateMetadata({ params: { year, month } });
    const canonical = (metadata.alternates as { canonical: string }).canonical;
    expect(canonical).toMatch(new RegExp(`/news/archive/${year}/${month}$`));
  });

  it('description이 존재한다', () => {
    const metadata = generateMetadata({ params: { year, month } });
    expect(metadata.description).toBeTruthy();
  });
});
