/**
 * @jest-environment node
 */
import { isTrackablePath } from '@/lib/server-page-view';

// ─── isTrackablePath (pure path guard) ───────────────────────────────────────

describe('isTrackablePath', () => {
  it('accepts a news article path', () => {
    expect(isTrackablePath('/news/some-slug')).toBe(true);
  });

  it('accepts a section path', () => {
    expect(isTrackablePath('/news/section/llm')).toBe(true);
  });

  it('accepts a URL-encoded topic path', () => {
    expect(isTrackablePath('/news/topic/AI%20Agents')).toBe(true);
  });

  it('rejects the bare /news index (no trailing slash — Next.js normalises)', () => {
    expect(isTrackablePath('/news')).toBe(false);
  });

  it('rejects non-news paths', () => {
    expect(isTrackablePath('/tools/chatgpt')).toBe(false);
    expect(isTrackablePath('/')).toBe(false);
    expect(isTrackablePath('')).toBe(false);
  });

  it('rejects paths that exceed the max length', () => {
    expect(isTrackablePath('/news/' + 'a'.repeat(500))).toBe(false);
  });
});

// ─── trackServerPageView ─────────────────────────────────────────────────────

const rpcMock = jest.fn(async () => ({ error: null as { message: string } | null }));

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ rpc: rpcMock }),
}));

// Import after mock so the module picks up the mocked createClient.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { trackServerPageView } = require('@/lib/server-page-view') as typeof import('@/lib/server-page-view');

const ORIG_SUPABASE_URL = process.env.SUPABASE_URL;
const ORIG_SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

beforeEach(() => {
  rpcMock.mockClear();
  process.env.SUPABASE_URL = 'https://test.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
});

afterEach(() => {
  if (ORIG_SUPABASE_URL === undefined) {
    delete process.env.SUPABASE_URL;
  } else {
    process.env.SUPABASE_URL = ORIG_SUPABASE_URL;
  }
  if (ORIG_SUPABASE_KEY === undefined) {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  } else {
    process.env.SUPABASE_SERVICE_ROLE_KEY = ORIG_SUPABASE_KEY;
  }
});

describe('trackServerPageView', () => {
  it('calls upsert_page_view with the normalised path and a KST date', async () => {
    await trackServerPageView('/news/some-slug');
    expect(rpcMock).toHaveBeenCalledWith('upsert_page_view', {
      p_path: '/news/some-slug',
      p_day: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    });
  });

  it('strips trailing slash before passing to the DB', async () => {
    await trackServerPageView('/news/some-slug/');
    expect(rpcMock).toHaveBeenCalledWith('upsert_page_view', expect.objectContaining({
      p_path: '/news/some-slug',
    }));
  });

  it('strips query string before passing to the DB', async () => {
    await trackServerPageView('/news/some-slug?ref=twitter');
    expect(rpcMock).toHaveBeenCalledWith('upsert_page_view', expect.objectContaining({
      p_path: '/news/some-slug',
    }));
  });

  it('is a no-op when SUPABASE_URL is missing', async () => {
    delete process.env.SUPABASE_URL;
    await trackServerPageView('/news/some-slug');
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('is a no-op when SUPABASE_SERVICE_ROLE_KEY is missing', async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    await trackServerPageView('/news/some-slug');
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('is a no-op for non-trackable paths', async () => {
    await trackServerPageView('/tools/chatgpt');
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('swallows DB errors silently', async () => {
    rpcMock.mockRejectedValueOnce(new Error('connection refused'));
    await expect(trackServerPageView('/news/some-slug')).resolves.toBeUndefined();
  });

  it('swallows Supabase RPC error objects silently', async () => {
    rpcMock.mockResolvedValueOnce({ error: { message: 'RPC failed' } });
    await expect(trackServerPageView('/news/some-slug')).resolves.toBeUndefined();
  });
});
