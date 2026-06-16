import {
  selectLatestKrTop,
  isAiRelatedKeyword,
  hottrendKeywordUrl,
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

describe('hottrendKeywordUrl', () => {
  it('builds an encoded hottrend.news URL with geo=KR', () => {
    expect(hottrendKeywordUrl('AI 그림')).toBe(
      'https://hottrend.news/keyword/AI%20%EA%B7%B8%EB%A6%BC?geo=KR',
    );
  });
});
