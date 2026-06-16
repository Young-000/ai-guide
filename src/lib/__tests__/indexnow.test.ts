import { buildIndexNowPayload, INDEXNOW_KEY, submitUrls } from '@/lib/indexnow';

describe('INDEXNOW_KEY', () => {
  it('is a 32-char lowercase hex string matching the public key file', () => {
    expect(INDEXNOW_KEY).toMatch(/^[a-f0-9]{32}$/);
  });
});

describe('buildIndexNowPayload', () => {
  it('builds the IndexNow body with host, key, keyLocation and urlList', () => {
    const payload = buildIndexNowPayload([
      'https://aiwire.news/news/foo',
      'https://aiwire.news/news/bar',
    ]);
    expect(payload).toEqual({
      host: 'aiwire.news',
      key: INDEXNOW_KEY,
      keyLocation: `https://aiwire.news/${INDEXNOW_KEY}.txt`,
      urlList: ['https://aiwire.news/news/foo', 'https://aiwire.news/news/bar'],
    });
  });

  it('drops urls that do not belong to the aiwire.news host', () => {
    const payload = buildIndexNowPayload([
      'https://aiwire.news/news/foo',
      'https://evil.example.com/x',
      'not-a-url',
    ]);
    expect(payload.urlList).toEqual(['https://aiwire.news/news/foo']);
  });

  it('dedupes urls', () => {
    const payload = buildIndexNowPayload([
      'https://aiwire.news/a',
      'https://aiwire.news/a',
    ]);
    expect(payload.urlList).toEqual(['https://aiwire.news/a']);
  });
});

describe('submitUrls', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete (global as unknown as Record<string, unknown>).fetch;
  });

  it('returns skipped result without calling fetch when there are no valid urls', async () => {
    const fetchMock = jest.fn();
    (global as unknown as Record<string, unknown>).fetch = fetchMock;
    const result = await submitUrls(['not-a-url']);
    expect(result).toEqual({ ok: true, submitted: 0, status: 0 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('POSTs the payload to the IndexNow endpoint', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, status: 200 });
    (global as unknown as Record<string, unknown>).fetch = fetchMock;

    const result = await submitUrls(['https://aiwire.news/news/foo']);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.indexnow.org/indexnow');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body as string)).toEqual(
      buildIndexNowPayload(['https://aiwire.news/news/foo']),
    );
    expect(result).toEqual({ ok: true, submitted: 1, status: 200 });
  });

  it('fails soft (ok:false, no throw) when fetch rejects', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    (global as unknown as Record<string, unknown>).fetch = jest
      .fn()
      .mockRejectedValue(new Error('network'));
    const result = await submitUrls(['https://aiwire.news/news/foo']);
    expect(result.ok).toBe(false);
    expect(result.submitted).toBe(0);
  });
});
