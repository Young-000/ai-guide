import { fetchTrendingKeywords } from '@/lib/trending';
import { getServiceClient } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  getServiceClient: jest.fn(),
}));

const mockedGetServiceClient = getServiceClient as jest.MockedFunction<
  typeof getServiceClient
>;

type QueryPayload = { data: unknown; error: unknown };
type QueryBuilder = {
  select: jest.Mock;
  eq: jest.Mock;
  order: jest.Mock;
  limit: jest.Mock;
};

// Builds a chainable query-builder stub that resolves to the given payload.
function buildClient(payload: QueryPayload): ReturnType<typeof getServiceClient> {
  const builder: QueryBuilder = {
    select: jest.fn((): QueryBuilder => builder),
    eq: jest.fn((): QueryBuilder => builder),
    order: jest.fn((): QueryBuilder => builder),
    limit: jest.fn(() => Promise.resolve(payload)),
  };
  return { from: jest.fn(() => builder) } as unknown as ReturnType<
    typeof getServiceClient
  >;
}

afterEach(() => jest.clearAllMocks());

describe('fetchTrendingKeywords — fail-soft', () => {
  it('returns [] when getServiceClient throws (missing env)', async () => {
    mockedGetServiceClient.mockImplementation(() => {
      throw new Error('Missing SUPABASE_URL');
    });
    await expect(fetchTrendingKeywords()).resolves.toEqual([]);
  });

  it('returns [] when the query returns an error', async () => {
    mockedGetServiceClient.mockReturnValue(
      buildClient({ data: null, error: { message: 'boom' } }),
    );
    await expect(fetchTrendingKeywords()).resolves.toEqual([]);
  });

  it('returns [] when the query returns no rows', async () => {
    mockedGetServiceClient.mockReturnValue(buildClient({ data: [], error: null }));
    await expect(fetchTrendingKeywords()).resolves.toEqual([]);
  });

  it('maps rows through the pure transform on success', async () => {
    const rows = [
      {
        source: 'google',
        geo: 'KR',
        captured_at: '2026-06-17T00:00:00.000Z',
        rank: 2,
        keyword: 'ChatGPT',
        traffic: null,
      },
      {
        source: 'google',
        geo: 'KR',
        captured_at: '2026-06-17T00:00:00.000Z',
        rank: 1,
        keyword: '날씨',
        traffic: null,
      },
    ];
    mockedGetServiceClient.mockReturnValue(buildClient({ data: rows, error: null }));
    const result = await fetchTrendingKeywords(8);
    expect(result).toEqual([
      { keyword: '날씨', rank: 1 },
      { keyword: 'ChatGPT', rank: 2 },
    ]);
  });
});
