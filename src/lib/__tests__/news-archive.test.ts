import path from 'node:path';
import { getNewsByYearMonth, getArchiveMonths } from '@/lib/news';

const FIXTURES = path.join(__dirname, 'fixtures', 'news');

describe('getNewsByYearMonth', () => {
  it('해당 월의 기사만 반환한다', () => {
    const items = getNewsByYearMonth('ko', '2026', '01', FIXTURES);
    expect(items.map((i) => i.slug)).toEqual(['alpha']);
  });

  it('2월 기사만 반환한다', () => {
    const items = getNewsByYearMonth('ko', '2026', '02', FIXTURES);
    expect(items.map((i) => i.slug)).toEqual(['beta']);
  });

  it('기사가 없는 월은 빈 배열을 반환한다', () => {
    const items = getNewsByYearMonth('ko', '2026', '12', FIXTURES);
    expect(items).toEqual([]);
  });

  it('없는 연도는 빈 배열을 반환한다', () => {
    const items = getNewsByYearMonth('ko', '2099', '01', FIXTURES);
    expect(items).toEqual([]);
  });
});

describe('getArchiveMonths', () => {
  it('기사가 있는 연월 목록을 최신순으로 반환한다', () => {
    const months = getArchiveMonths('ko', FIXTURES);
    expect(months).toEqual([
      { year: '2026', month: '03' },
      { year: '2026', month: '02' },
      { year: '2026', month: '01' },
    ]);
  });

  it('빈 디렉토리는 빈 배열을 반환한다', () => {
    const months = getArchiveMonths('en', path.join(FIXTURES, '__missing__'));
    expect(months).toEqual([]);
  });

  it('중복 연월은 한 번만 포함된다', () => {
    const months = getArchiveMonths('ko', FIXTURES);
    const keys = months.map((m) => `${m.year}-${m.month}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
