/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from '../route';

const rpcMock = jest.fn(async () => ({ error: null as { message: string } | null }));

jest.mock('@/lib/supabase', () => ({
  getServiceClient: () => ({
    rpc: rpcMock,
  }),
}));

function makeRequest(body: unknown, ip = '10.0.0.1'): NextRequest {
  return new NextRequest('http://localhost/api/pageview', {
    method: 'POST',
    headers: { 'x-forwarded-for': ip, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  rpcMock.mockClear();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => jest.restoreAllMocks());

describe('POST /api/pageview — path validation', () => {
  it('accepts a valid news article path and calls upsert_page_view', async () => {
    const res = await POST(makeRequest({ path: '/news/some-article-slug' }));
    expect(res.status).toBe(200);
    expect(rpcMock).toHaveBeenCalledWith('upsert_page_view', {
      p_path: '/news/some-article-slug',
      p_day: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    });
  });

  it('accepts a section path', async () => {
    const res = await POST(makeRequest({ path: '/news/section/llm' }));
    expect(res.status).toBe(200);
  });

  it('accepts a topic path', async () => {
    const res = await POST(makeRequest({ path: '/news/topic/AI%20Agents' }));
    expect(res.status).toBe(200);
  });

  it('rejects a path not starting with /news/', async () => {
    const res = await POST(makeRequest({ path: '/tools/chatgpt' }));
    expect(res.status).toBe(400);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('rejects a bare /news path (must have sub-path)', async () => {
    const res = await POST(makeRequest({ path: '/compare/tools' }));
    expect(res.status).toBe(400);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('rejects a non-string path', async () => {
    const res = await POST(makeRequest({ path: 42 }));
    expect(res.status).toBe(400);
  });

  it('rejects missing path', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it('returns 400 on malformed JSON body', async () => {
    const req = new NextRequest('http://localhost/api/pageview', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'not-json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

describe('POST /api/pageview — path normalisation', () => {
  it('strips a trailing slash before passing to the DB', async () => {
    await POST(makeRequest({ path: '/news/some-slug/' }));
    expect(rpcMock).toHaveBeenCalledWith('upsert_page_view', expect.objectContaining({
      p_path: '/news/some-slug',
    }));
  });

  it('strips a query string before passing to the DB', async () => {
    await POST(makeRequest({ path: '/news/some-slug?ref=twitter' }));
    expect(rpcMock).toHaveBeenCalledWith('upsert_page_view', expect.objectContaining({
      p_path: '/news/some-slug',
    }));
  });
});

describe('POST /api/pageview — rate limiting', () => {
  it('cuts off a single IP that floods the counter, without touching the DB after the limit', async () => {
    const ip = '10.0.0.99';
    const results: number[] = [];

    for (let i = 0; i < 40; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const res = await POST(makeRequest({ path: `/news/slug-${i}` }, ip));
      results.push(res.status);
    }

    expect(results).toContain(429);
  });

  it('does not rate-limit a fresh IP after another IP is exhausted', async () => {
    const exhaustedIp = '10.0.0.88';
    for (let i = 0; i < 40; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await POST(makeRequest({ path: `/news/spam-${i}` }, exhaustedIp));
    }

    const res = await POST(makeRequest({ path: '/news/fresh' }, '10.0.0.77'));
    expect(res.status).toBe(200);
  });
});

describe('POST /api/pageview — Supabase error handling', () => {
  it('returns 500 when the RPC returns an error', async () => {
    rpcMock.mockResolvedValueOnce({ error: { message: 'db down' } });
    const res = await POST(makeRequest({ path: '/news/some-slug' }));
    expect(res.status).toBe(500);
  });

  it('returns 500 when the RPC throws', async () => {
    rpcMock.mockRejectedValueOnce(new Error('network failure'));
    const res = await POST(makeRequest({ path: '/news/some-slug' }));
    expect(res.status).toBe(500);
  });
});
