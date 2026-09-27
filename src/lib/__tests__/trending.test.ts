import {
  selectLatestKrTop,
  isAiRelatedKeyword,
  isFreshSnapshot,
  type TrendSnapshotRow,
} from '@/lib/trending';

function row(partial: Partial<TrendSnapshotRow>): TrendSnapshotRow {
  return {
    source: 'google',
    geo: 'KR',
    captured_at: '2026-06-17T00:00:00.000Z',
    rank: 1,
    keyword: 'sample',
    traffic: null,
    ...partial,
  };
}

describe('selectLatestKrTop', () => {
  it('returns [] for empty input', () => {
    expect(selectLatestKrTop([], 8)).toEqual([]);
  });

  it('keeps only the latest captured_at snapshot', () => {
    const rows: TrendSnapshotRow[] = [
      row({ captured_at: '2026-06-16T00:00:00.000Z', rank: 1, keyword: 'old' }),
      row({ captured_at: '2026-06-17T00:00:00.000Z', rank: 1, keyword: 'new' }),
    ];
    const result = selectLatestKrTop(rows, 8);
    expect(result.map((r) => r.keyword)).toEqual(['new']);
  });

  it('sorts by rank ascending and caps to limit', () => {
    const rows: TrendSnapshotRow[] = [
      row({ rank: 3, keyword: 'c' }),
      row({ rank: 1, keyword: 'a' }),
      row({ rank: 2, keyword: 'b' }),
      row({ rank: 4, keyword: 'd' }),
    ];
    const result = selectLatestKrTop(rows, 3);
    expect(result.map((r) => r.keyword)).toEqual(['a', 'b', 'c']);
  });

  it('drops rows with empty keyword', () => {
    const rows: TrendSnapshotRow[] = [
      row({ rank: 1, keyword: '' }),
      row({ rank: 2, keyword: '  ' }),
      row({ rank: 3, keyword: 'valid' }),
    ];
    expect(selectLatestKrTop(rows, 8).map((r) => r.keyword)).toEqual(['valid']);
  });

  it('dedupes repeated keywords keeping the best (lowest) rank', () => {
    const rows: TrendSnapshotRow[] = [
      row({ rank: 5, keyword: 'dup' }),
      row({ rank: 2, keyword: 'dup' }),
      row({ rank: 3, keyword: 'other' }),
    ];
    const result = selectLatestKrTop(rows, 8);
    expect(result.map((r) => r.keyword)).toEqual(['dup', 'other']);
  });
});

describe('isAiRelatedKeyword', () => {
  it.each([
    'ChatGPT',
    'AI 그림',
    '인공지능 주가',
    'LLM 모델',
    '챗봇 추천',
    'Gemini',
    '클로드 사용법',
    'Sora 영상',
  ])('flags AI-related keyword: %s', (kw) => {
    expect(isAiRelatedKeyword(kw)).toBe(true);
  });

  it.each(['손흥민', '날씨', '로또 당첨번호', '주말 드라마'])(
    'rejects non-AI keyword: %s',
    (kw) => {
      expect(isAiRelatedKeyword(kw)).toBe(false);
    },
  );
});

describe('isFreshSnapshot', () => {
  const now = new Date('2026-09-27T09:00:00.000Z');

  it('accepts a snapshot from within the last 3 days', () => {
    expect(isFreshSnapshot('2026-09-25T09:00:00.000Z', now)).toBe(true);
  });

  it('rejects a snapshot older than 3 days (feed stopped)', () => {
    expect(isFreshSnapshot('2026-08-04T18:16:00.165Z', now)).toBe(false);
  });

  it('rejects an unparseable timestamp', () => {
    expect(isFreshSnapshot('not-a-date', now)).toBe(false);
  });
});
