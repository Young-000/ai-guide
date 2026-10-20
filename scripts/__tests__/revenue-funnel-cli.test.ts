/** @jest-environment node */
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join } from 'node:path';
import { completedKstWindow } from '../revenue-funnel-report';

it.each([1, 7])('queries scoped KST counts with %i observed days and preserves the metric-reader contract', async (observedDays) => {
  const window = completedKstWindow(7);
  const requests: URL[] = [];
  let websocketUpgrades = 0;
  const requestHeaders: { apikey?: string | string[]; authorization?: string; schema?: string | string[]; method?: string }[] = [];
  const server = createServer((request, response) => {
    requests.push(new URL(request.url ?? '/', 'http://localhost'));
    requestHeaders.push({ apikey: request.headers.apikey, authorization: request.headers.authorization, schema: request.headers['accept-profile'], method: request.method });
    response.setHeader('Content-Type', 'application/json');
    const rows = Array.from({ length: observedDays }, (_, index) => ({
      day: new Date(Date.parse(window.since) + index * 86_400_000).toISOString().slice(0, 10),
      site: 'aiwire', humans: 414, bots: 101, outclicks: 0, click_rate_pct: 0,
    }));
    response.end(JSON.stringify(rows));
  });
  server.on('upgrade', (_request, socket) => {
    websocketUpgrades += 1;
    socket.destroy();
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Missing server port');
    const { stdout } = await promisify(execFile)(process.execPath, ['--no-experimental-websocket', '--import', require.resolve('tsx'), join(__dirname, '../revenue-funnel.ts')], {
      env: { ...process.env, SUPABASE_URL: `http://127.0.0.1:${address.port}`, SUPABASE_SERVICE_ROLE_KEY: 'local-test-key' },
    });
    expect(requests).toHaveLength(1);
    expect(websocketUpgrades).toBe(0);
    expect(requests[0].pathname).toBe('/rest/v1/v_revenue_funnel');
    expect(requestHeaders).toEqual([{ apikey: 'local-test-key', authorization: 'Bearer local-test-key', schema: 'search_trends', method: 'GET' }]);
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
