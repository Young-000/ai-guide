import { recordView, getKstDay } from '@/lib/page-views';

// Mock supabase module so we never hit real Supabase in unit tests
jest.mock('@/lib/supabase', () => ({
  getServiceClient: jest.fn(),
}));

import { getServiceClient } from '@/lib/supabase';

const mockGetServiceClient = getServiceClient as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getKstDay', () => {
  it('returns YYYY-MM-DD string', () => {
    expect(getKstDay()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('is one day ahead of UTC when it is 23:30 UTC', () => {
    // 2026-08-20T23:30 UTC  →  2026-08-21T08:30 KST
    const spy = jest.spyOn(Date, 'now').mockReturnValue(
      new Date('2026-08-20T23:30:00.000Z').getTime(),
    );
    expect(getKstDay()).toBe('2026-08-21');
    spy.mockRestore();
  });

  it('stays on the same UTC day at 14:00 UTC', () => {
    // 2026-08-20T14:00 UTC  →  2026-08-20T23:00 KST  (still same KST day)
    const spy = jest.spyOn(Date, 'now').mockReturnValue(
      new Date('2026-08-20T14:00:00.000Z').getTime(),
    );
    expect(getKstDay()).toBe('2026-08-20');
    spy.mockRestore();
  });
});

describe('recordView', () => {
  it('calls upsert_page_view RPC with the correct path and KST day', async () => {
    const mockRpc = jest.fn().mockResolvedValue({ error: null });
    mockGetServiceClient.mockReturnValue({ rpc: mockRpc });

    const spy = jest.spyOn(Date, 'now').mockReturnValue(
      new Date('2026-08-20T10:00:00.000Z').getTime(),
    );

    await recordView('/news/test-slug');

    expect(mockRpc).toHaveBeenCalledTimes(1);
    expect(mockRpc).toHaveBeenCalledWith('upsert_page_view', {
      p_path: '/news/test-slug',
      p_day: '2026-08-20', // UTC 10:00 → KST 19:00, still 08-20
    });

    spy.mockRestore();
  });

  it('logs error but resolves without throwing on Supabase error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockRpc = jest.fn().mockResolvedValue({ error: { message: 'DB error' } });
    mockGetServiceClient.mockReturnValue({ rpc: mockRpc });

    await expect(recordView('/news/fail-path')).resolves.toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      '[page-views] recordView failed:',
      '/news/fail-path',
      'DB error',
    );

    consoleSpy.mockRestore();
  });

  it('passes different paths as separate records', async () => {
    const mockRpc = jest.fn().mockResolvedValue({ error: null });
    mockGetServiceClient.mockReturnValue({ rpc: mockRpc });

    await recordView('/news/a');
    await recordView('/news/section/tech');

    expect(mockRpc).toHaveBeenCalledTimes(2);
    expect(mockRpc.mock.calls[0][1].p_path).toBe('/news/a');
    expect(mockRpc.mock.calls[1][1].p_path).toBe('/news/section/tech');
  });
});
