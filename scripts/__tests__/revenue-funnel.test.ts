import { completedKstWindow, readFunnelRows, summarizeFunnel } from '../revenue-funnel-report';

const aiwire = { day: '2026-10-20', site: 'aiwire', humans: 414, bots: 101, outclicks: 0, click_rate_pct: 0 };

describe('aiwire revenue funnel report', () => {
  it('uses exactly seven completed KST days across the UTC date boundary', () => {
    expect(completedKstWindow(7, new Date('2026-10-20T15:55:38Z'))).toEqual({
      since: '2026-10-14', until: '2026-10-21', days: 7,
    });
    expect(completedKstWindow(7, new Date('2026-10-20T14:59:59Z'))).toEqual({
      since: '2026-10-13', until: '2026-10-20', days: 7,
    });
  });

  it.each([0, -1, 1.5, NaN, Infinity])('rejects invalid days %s', (days) => {
    expect(() => completedKstWindow(days)).toThrow('positive integer');
  });

  it('does not combine another tenant, today, or an older day into aiwire totals', () => {
    const window = completedKstWindow(7, new Date('2026-10-20T15:55:38Z'));
    const result = summarizeFunnel([
      aiwire,
      { ...aiwire, day: '2026-10-14', humans: 1238 },
      { ...aiwire, site: 'hottrend', humans: 174, outclicks: 9 },
      { ...aiwire, day: '2026-10-21', humans: 20 },
      { ...aiwire, day: '2026-10-13', humans: 44 },
    ], window);
    expect(result).toEqual({
      rows: [{ ...aiwire, day: '2026-10-14', humans: 1238 }, aiwire],
      humans: 1652, outclicks: 0, observedDays: 2, missingDays: 5,
    });
  });

  it('distinguishes absent measurement days from observed zeros', () => {
    const window = completedKstWindow(1, new Date('2026-10-20T15:55:38Z'));
    expect(summarizeFunnel([], window).missingDays).toBe(1);
    expect(summarizeFunnel([{ ...aiwire, humans: 0 }], window).missingDays).toBe(0);
  });

  it('reads beyond the response cap, including a final empty page for exact multiples', async () => {
    const fetchPage = jest.fn()
      .mockResolvedValueOnce([aiwire, { ...aiwire, day: '2026-10-19' }])
      .mockResolvedValueOnce([]);
    expect(await readFunnelRows(fetchPage, 2)).toHaveLength(2);
    expect(fetchPage.mock.calls).toEqual([[0, 1], [2, 3]]);
  });

  it('fails instead of returning partial totals when a later page fails', async () => {
    const fetchPage = jest.fn().mockResolvedValueOnce([aiwire]).mockRejectedValueOnce(new Error('db unavailable'));
    await expect(readFunnelRows(fetchPage, 1)).rejects.toThrow('db unavailable');
  });
});
