import { completedKstWindow } from '../revenue-funnel-report';
import { rankTopPages, readViewRows, sanitizePathForDisplay } from '../top-pages-report';

describe('top pages report', () => {
  it('ranks by human hits and keeps total traffic alongside', () => {
    const human = [
      { path: '/news/a', day: '2026-10-20', count: 5 },
      { path: '/news/a', day: '2026-10-21', count: 3 },
      { path: '/news/b', day: '2026-10-20', count: 9 },
    ];
    const total = [
      { path: '/news/a', day: '2026-10-20', count: 50 },
      { path: '/news/b', day: '2026-10-20', count: 10 },
      { path: '/news/topics', day: '2026-10-20', count: 700 },
    ];
    expect(rankTopPages(human, total, 2)).toEqual([
      { path: '/news/b', human: 9, total: 10 },
      { path: '/news/a', human: 8, total: 50 },
    ]);
  });

  it('breaks ties by path and includes paths with zero human hits', () => {
    const total = [{ path: '/news/z', day: 'd', count: 4 }];
    const human = [{ path: '/news/y', day: 'd', count: 1 }, { path: '/news/x', day: 'd', count: 1 }];
    expect(rankTopPages(human, total, 5).map((r) => r.path)).toEqual(['/news/x', '/news/y', '/news/z']);
  });

  it('pages past the response cap and fails on a later page error', async () => {
    const row = { path: '/p', day: 'd', count: 1 };
    const ok = jest.fn().mockResolvedValueOnce([row, row]).mockResolvedValueOnce([]);
    expect(await readViewRows(ok, 2)).toHaveLength(2);
    const bad = jest.fn().mockResolvedValueOnce([row]).mockRejectedValueOnce(new Error('down'));
    await expect(readViewRows(bad, 1)).rejects.toThrow('down');
  });

  it('reuses completed KST windows', () => {
    expect(completedKstWindow(30, new Date('2026-10-25T00:00:00Z')).until).toBe('2026-10-25');
  });

  it('escapes terminal control sequences in attacker-controlled paths', () => {
    const hostile = '/a\u001b[2J\u001b]0;pwned\u0007\r\nFAKE  999  999  /admin\u009b\u202e\u2028';
    const shown = sanitizePathForDisplay(hostile);
    expect(shown).not.toMatch(/[\u0000-\u001f\u007f-\u009f\u2028\u2029\u202a-\u202e\u2066-\u2069]/);
    expect(shown).toContain('\\x1b');
    expect(shown).toContain('\\n');
    expect(sanitizePathForDisplay('/news/한글-기사?a=1')).toBe('/news/한글-기사?a=1');
  });
});
