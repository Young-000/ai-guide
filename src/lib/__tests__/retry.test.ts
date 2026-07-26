import { isRetryableStatus, backoffDelayMs, withRetry } from '../retry';

describe('isRetryableStatus', () => {
  it('retries transient server-side and throttling responses', () => {
    for (const status of [408, 425, 429, 500, 502, 503, 504]) {
      expect(isRetryableStatus(status)).toBe(true);
    }
  });

  it('does not retry client errors that a retry cannot fix', () => {
    for (const status of [400, 401, 403, 404, 410]) {
      expect(isRetryableStatus(status)).toBe(false);
    }
  });

  it('does not retry success responses', () => {
    expect(isRetryableStatus(200)).toBe(false);
    expect(isRetryableStatus(304)).toBe(false);
  });
});

describe('backoffDelayMs', () => {
  it('grows exponentially from the base delay', () => {
    expect(backoffDelayMs(0, 500)).toBe(500);
    expect(backoffDelayMs(1, 500)).toBe(1000);
    expect(backoffDelayMs(2, 500)).toBe(2000);
  });

  it('caps the delay so a long retry chain cannot stall the run', () => {
    expect(backoffDelayMs(20, 500)).toBe(30_000);
  });
});

describe('withRetry', () => {
  const noSleep = (): Promise<void> => Promise.resolve();

  it('returns the first successful result without retrying', async () => {
    const attempt = jest.fn().mockResolvedValue('ok');
    const result = await withRetry(attempt, { retries: 3, baseDelayMs: 1, sleep: noSleep });
    expect(result).toBe('ok');
    expect(attempt).toHaveBeenCalledTimes(1);
  });

  it('retries a throwing call until it succeeds', async () => {
    const attempt = jest
      .fn()
      .mockRejectedValueOnce(new Error('ETIMEDOUT'))
      .mockRejectedValueOnce(new Error('ECONNRESET'))
      .mockResolvedValue('recovered');
    const result = await withRetry(attempt, { retries: 3, baseDelayMs: 1, sleep: noSleep });
    expect(result).toBe('recovered');
    expect(attempt).toHaveBeenCalledTimes(3);
  });

  it('rethrows the last error once retries are exhausted', async () => {
    const attempt = jest.fn().mockRejectedValue(new Error('still down'));
    await expect(
      withRetry(attempt, { retries: 2, baseDelayMs: 1, sleep: noSleep })
    ).rejects.toThrow('still down');
    // 1 initial + 2 retries
    expect(attempt).toHaveBeenCalledTimes(3);
  });

  it('stops immediately when shouldRetry rejects the error', async () => {
    const attempt = jest.fn().mockRejectedValue(new Error('HTTP 404'));
    await expect(
      withRetry(attempt, {
        retries: 5,
        baseDelayMs: 1,
        sleep: noSleep,
        shouldRetry: () => false,
      })
    ).rejects.toThrow('HTTP 404');
    expect(attempt).toHaveBeenCalledTimes(1);
  });

  it('waits with exponential backoff between attempts', async () => {
    const waits: number[] = [];
    const attempt = jest
      .fn()
      .mockRejectedValueOnce(new Error('a'))
      .mockRejectedValueOnce(new Error('b'))
      .mockResolvedValue('done');
    await withRetry(attempt, {
      retries: 3,
      baseDelayMs: 100,
      sleep: (ms) => {
        waits.push(ms);
        return Promise.resolve();
      },
    });
    expect(waits).toEqual([100, 200]);
  });

  it('passes the zero-based attempt number to the callback', async () => {
    const seen: number[] = [];
    await withRetry(
      (attempt) => {
        seen.push(attempt);
        return attempt < 2 ? Promise.reject(new Error('retry')) : Promise.resolve('ok');
      },
      { retries: 3, baseDelayMs: 1, sleep: noSleep }
    );
    expect(seen).toEqual([0, 1, 2]);
  });
});
