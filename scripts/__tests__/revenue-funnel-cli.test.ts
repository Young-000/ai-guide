/** @jest-environment node */
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join } from 'node:path';
import { completedKstWindow } from '../revenue-funnel-report';

type Fixture = { observedDays: number; directPerDay: number; googlePerDay: number };
type Run = {
  stdout: string;
  requests: URL[];
  websocketUpgrades: number;
  requestHeaders: { apikey?: string | string[]; authorization?: string; schema?: string | string[]; method?: string }[];
};

const window = completedKstWindow(7);
const dayAt = (index: number): string => new Date(Date.parse(window.since) + index * 86_400_000).toISOString().slice(0, 10);

function responseFor(pathname: string, fixture: Fixture): unknown[] {
  const days = Array.from({ length: fixture.observedDays }, (_, index) => dayAt(index));
  if (pathname === '/rest/v1/v_revenue_funnel') {
    return days.map((day) => ({ day, site: 'aiwire', humans: 414, bots: 101, outclicks: 0, click_rate_pct: 0 }));
  }
  if (pathname === '/rest/v1/site_visits') {
    return days.flatMap((day) => [
      { day, site: 'aiwire', source: 'direct', medium: 'none', is_bot: false, visits: fixture.directPerDay },
      { day, site: 'aiwire', source: 'google', medium: 'organic', is_bot: false, visits: fixture.googlePerDay },
    ]);
  }
  throw new Error(`unexpected path ${pathname}`);
}

async function runFunnel(fixture: Fixture): Promise<Run> {
  const run: Omit<Run, 'stdout'> = { requests: [], websocketUpgrades: 0, requestHeaders: [] };
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? '/', 'http://localhost');
    run.requests.push(url);
    run.requestHeaders.push({ apikey: request.headers.apikey, authorization: request.headers.authorization, schema: request.headers['accept-profile'], method: request.method });
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(responseFor(url.pathname, fixture)));
  });
  server.on('upgrade', (_request, socket) => {
    run.websocketUpgrades += 1;
    socket.destroy();
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Missing server port');
    const { stdout } = await promisify(execFile)(process.execPath, ['--no-experimental-websocket', '--import', require.resolve('tsx'), join(__dirname, '../revenue-funnel.ts')], {
      env: { ...process.env, SUPABASE_URL: `http://127.0.0.1:${address.port}`, SUPABASE_SERVICE_ROLE_KEY: 'local-test-key' },
    });
    return { ...run, stdout };
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

it.each([1, 7])('queries scoped KST counts with %i observed days and preserves the metric-reader contract', async (observedDays) => {
  const { stdout, requests, requestHeaders, websocketUpgrades } = await runFunnel({ observedDays, directPerDay: 408, googlePerDay: 6 });
  expect(requests.map((url) => url.pathname)).toEqual(['/rest/v1/v_revenue_funnel', '/rest/v1/site_visits']);
  expect(websocketUpgrades).toBe(0);
  expect(requestHeaders).toEqual(Array(2).fill({ apikey: 'local-test-key', authorization: 'Bearer local-test-key', schema: 'search_trends', method: 'GET' }));
  const [funnel, visits] = requests;
  expect(funnel.searchParams.get('site')).toBe('eq.aiwire');
  expect(funnel.searchParams.getAll('day')).toEqual([`gte.${window.since}`, `lt.${window.until}`]);
  expect(funnel.searchParams.get('order')).toBe('day.asc,site.asc');
  expect(funnel.searchParams.get('limit')).toBe('500');
  expect(visits.searchParams.get('select')).toBe('day,site,source,medium,is_bot,visits');
  expect(visits.searchParams.get('site')).toBe('eq.aiwire');
  expect(visits.searchParams.get('is_bot')).toBe('eq.false');
  expect(visits.searchParams.getAll('day')).toEqual([`gte.${window.since}`, `lt.${window.until}`]);
  expect(visits.searchParams.get('limit')).toBe('500');
  expect(stdout).toContain('Scope: site=aiwire; KST completed days');
  expect(stdout).toContain(`humans=${414 * observedDays}; outclicks=0`);
  if (observedDays === 7) {
    expect(stdout).toMatch(/합계 7일: 사람 2898명 · 아웃클릭 0회/);
    expect(stdout).toMatch(/하루 평균 사람 414명/);
    expect(stdout).toMatch(/^검색 리퍼러 방문 7일: 42회$/m);
    expect(stdout).toMatch(/^direct 비율 7일: 98\.6%$/m);
    expect(stdout).toContain('Search referrers (organic) by engine: google=42');
  } else {
    expect(stdout).toContain('Average withheld.');
    expect(stdout).not.toMatch(/합계 7일: 사람/);
    expect(stdout).not.toContain('Daily average recorded human visits:');
    expect(stdout).not.toMatch(/검색 리퍼러 방문 7일|direct 비율 7일/);
  }
});

it('withholds the source lines when site_visits does not add up to the funnel humans', async () => {
  const { stdout } = await runFunnel({ observedDays: 7, directPerDay: 400, googlePerDay: 6 });
  expect(stdout).toMatch(/합계 7일: 사람 2898명/);
  expect(stdout).toContain('Visit sources withheld: site_visits humans=2842 but funnel humans=2898.');
  expect(stdout).not.toMatch(/검색 리퍼러 방문 7일|direct 비율 7일/);
});
