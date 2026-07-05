/**
 * @jest-environment node
 */
import { GET, POST } from '../route';

const submitUrlsMock = jest.fn(async () => ({ ok: true, submitted: 1, status: 200 }));

jest.mock('@/lib/indexnow', () => ({
  submitUrls: (): unknown => submitUrlsMock(),
}));

function makeRequest(ip: string): Request {
  return new Request('http://localhost/api/indexnow', {
    headers: { 'x-forwarded-for': ip },
  });
}

beforeEach(() => {
  submitUrlsMock.mockClear();
  delete process.env.CRON_SECRET;
});

describe('GET /api/indexnow — rate limiting', () => {
  it('allows repeated requests from the same IP up to the limit, then rejects with 429', async () => {
    const ip = '10.1.0.10';
    const results: number[] = [];

    for (let i = 0; i < 20; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const res = await GET(makeRequest(ip));
      results.push(res.status);
    }

    expect(results).toContain(429);
  });

  it('does not rate-limit a different IP after another IP is exhausted', async () => {
    const exhaustedIp = '10.1.0.11';
    for (let i = 0; i < 20; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await GET(makeRequest(exhaustedIp));
    }

    const res = await GET(makeRequest('10.1.0.12'));
    expect(res.status).not.toBe(429);
  });

  it('shares the rate-limit bucket between GET and POST for the same IP', async () => {
    const ip = '10.1.0.13';
    const results: number[] = [];

    for (let i = 0; i < 20; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const res = i % 2 === 0 ? await GET(makeRequest(ip)) : await POST(makeRequest(ip));
      results.push(res.status);
    }

    expect(results).toContain(429);
  });

  it('never calls submitUrls once the rate limit has been hit', async () => {
    const ip = '10.1.0.14';
    for (let i = 0; i < 20; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await GET(makeRequest(ip));
    }
    const callsAtLimit = submitUrlsMock.mock.calls.length;

    await GET(makeRequest(ip));
    await GET(makeRequest(ip));

    expect(submitUrlsMock.mock.calls.length).toBe(callsAtLimit);
  });
});
