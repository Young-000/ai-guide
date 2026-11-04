import { completedKstWindow, formatVisitSourceLines, summarizeVisitSources, type VisitSourceRow } from '../revenue-funnel-report';

const window = completedKstWindow(7, new Date('2026-11-04T01:00:00Z'));
const row = (overrides: Partial<VisitSourceRow>): VisitSourceRow => ({
  day: '2026-10-30', site: 'aiwire', source: 'direct', medium: 'none', is_bot: false, visits: 0, ...overrides,
});

describe('search referrer and direct share of aiwire visits', () => {
  it('counts organic search referrers and the direct share of human visits only', () => {
    const summary = summarizeVisitSources([
      row({ visits: 1866 }),
      row({ medium: 'unknown', visits: 2 }),
      row({ source: 'bing', medium: 'organic', visits: 10 }),
      row({ source: 'duckduckgo', medium: 'organic', visits: 8 }),
      row({ source: 'google', medium: 'organic', visits: 4 }),
      row({ source: 'yahoo', medium: 'organic', visits: 1 }),
      row({ source: 'chatgpt.com', medium: 'unknown', visits: 1 }),
      // not visits: bots, outclicks, another tenant, outside the completed window
      row({ is_bot: true, visits: 500 }),
      row({ source: 'coupang', medium: 'banner', visits: 3 }),
      row({ source: 'tool', medium: 'card', visits: 2 }),
      row({ site: 'hottrend', source: 'google', medium: 'organic', visits: 40 }),
      row({ day: '2026-11-04', source: 'google', medium: 'organic', visits: 9 }),
      row({ day: '2026-10-27', visits: 99 }),
    ], window);
    expect(summary).toEqual({
      humans: 1892, direct: 1868, search: 23,
      searchByEngine: [['bing', 10], ['duckduckgo', 8], ['google', 4], ['yahoo', 1]],
    });
  });

  it('prints the two machine-read lines with the direct share rounded from the unrounded ratio', () => {
    const summary = { humans: 1892, direct: 1868, search: 23, searchByEngine: [['bing', 10]] as [string, number][] };
    expect(formatVisitSourceLines(summary, 7)).toEqual([
      '검색 리퍼러 방문 7일: 23회',
      'direct 비율 7일: 98.7%',
    ]);
  });

  it('withholds the direct share instead of printing 0% or NaN when there are no human visits', () => {
    expect(formatVisitSourceLines({ humans: 0, direct: 0, search: 0, searchByEngine: [] }, 7)).toEqual([
      '검색 리퍼러 방문 7일: 0회',
      'direct share unknown: no human visits in the window.',
    ]);
  });
});
