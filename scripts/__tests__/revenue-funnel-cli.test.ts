/** @jest-environment node */
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join } from 'node:path';
import { completedKstWindow } from '../revenue-funnel-report';

it.each([1, 7])('queries scoped KST counts with %i observed days and preserves the metric-reader contract', async (observedDays) => {
  const window = completedKstWindow(7);
  const requests: URL[] = [];
  const server = createServer((request, response) => {
    requests.push(new URL(request.url ?? '/', 'http://localhost'));
    response.setHeader('Content-Type', 'application/json');
    const rows = Array.from({ length: observedDays }, (_, index) => ({
      day: new Date(Date.parse(window.since) + index * 86_400_000).toISOString().slice(0, 10),
      site: 'aiwire', humans: 414, bots: 101, outclicks: 0, click_rate_pct: 0,
    }));
    response.end(JSON.stringify(rows));
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Missing server port');
    const { stdout } = await promisify(execFile)(process.execPath, ['--import', require.resolve('tsx'), join(__dirname, '../revenue-funnel.ts')], {
      env: { ...process.env, SUPABASE_URL: `http://127.0.0.1:${address.port}`, SUPABASE_SERVICE_ROLE_KEY: 'local-test-key' },
    });
    expect(requests).toHaveLength(1);
    expect(requests[0].searchParams.get('site')).toBe('eq.aiwire');
    expect(requests[0].searchParams.getAll('day')).toEqual([`gte.${window.since}`, `lt.${window.until}`]);
    expect(requests[0].searchParams.get('order')).toBe('day.asc,site.asc');
    expect(requests[0].searchParams.get('limit')).toBe('500');
    expect(stdout).toContain('Scope: site=aiwire; KST completed days');
    expect(stdout).toContain(`humans=${414 * observedDays}; outclicks=0`);
    if (observedDays === 7) {
      expect(stdout).toMatch(/합계 7일: 사람 2898명 · 아웃클릭 0회/);
      expect(stdout).toMatch(/하루 평균 사람 414명/);
    } else {
      expect(stdout).toContain('Average withheld.');
      expect(stdout).not.toMatch(/합계 7일: 사람/);
      expect(stdout).not.toContain('Daily average recorded human visits:');
    }
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
