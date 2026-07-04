/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from '../route';

const insertMock = jest.fn(async () => ({ error: null }));

jest.mock('@/lib/supabase', () => ({
  getServiceClient: () => ({
    from: () => ({ insert: insertMock }),
  }),
}));

function makeRequest(email: unknown, ip = '10.0.0.1'): NextRequest {
  return new NextRequest('http://localhost/api/subscribe', {
    method: 'POST',
    headers: { 'x-forwarded-for': ip, 'content-type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}

beforeEach(() => {
  insertMock.mockClear();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => jest.restoreAllMocks());

describe('POST /api/subscribe — email normalization', () => {
  it('inserts a lowercased, trimmed email even when given mixed case + whitespace', async () => {
    const res = await POST(makeRequest('  TEST@Example.COM  ', '10.0.0.11'));
    expect(res.status).toBe(200);
    expect(insertMock).toHaveBeenCalledWith({ site: 'aiwire', email: 'test@example.com' });
  });
});

describe('POST /api/subscribe — rate limiting', () => {
  it('allows repeated requests from the same IP up to the limit, then rejects with 429', async () => {
    const ip = '10.0.0.22';
    const results: number[] = [];

    // One IP can retry endlessly in a loop — make sure it eventually gets cut off.
    for (let i = 0; i < 20; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const res = await POST(makeRequest(`user${i}@example.com`, ip));
      results.push(res.status);
    }

    expect(results).toContain(429);
  });

  it('does not rate-limit a different IP after another IP is exhausted', async () => {
    const exhaustedIp = '10.0.0.33';
    for (let i = 0; i < 20; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await POST(makeRequest(`spam${i}@example.com`, exhaustedIp));
    }

    const res = await POST(makeRequest('fresh@example.com', '10.0.0.44'));
    expect(res.status).toBe(200);
  });
});
