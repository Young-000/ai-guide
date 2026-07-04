import { createTokenBucketRateLimiter } from '@/lib/rate-limit';

describe('createTokenBucketRateLimiter', () => {
  it('allows requests up to the bucket capacity', () => {
    const limiter = createTokenBucketRateLimiter(3, 60_000);
    const now = 1_000_000;

    expect(limiter.check('1.2.3.4', now)).toBe(true);
    expect(limiter.check('1.2.3.4', now)).toBe(true);
    expect(limiter.check('1.2.3.4', now)).toBe(true);
  });

  it('rejects a request once capacity is exhausted within the window', () => {
    const limiter = createTokenBucketRateLimiter(2, 60_000);
    const now = 1_000_000;

    expect(limiter.check('1.2.3.4', now)).toBe(true);
    expect(limiter.check('1.2.3.4', now)).toBe(true);
    expect(limiter.check('1.2.3.4', now)).toBe(false);
  });

  it('tracks separate buckets per key (per-IP isolation)', () => {
    const limiter = createTokenBucketRateLimiter(1, 60_000);
    const now = 1_000_000;

    expect(limiter.check('1.2.3.4', now)).toBe(true);
    expect(limiter.check('1.2.3.4', now)).toBe(false);
    // A different IP has its own untouched bucket.
    expect(limiter.check('5.6.7.8', now)).toBe(true);
  });

  it('refills tokens after the refill interval elapses', () => {
    const limiter = createTokenBucketRateLimiter(1, 60_000);
    const now = 1_000_000;

    expect(limiter.check('1.2.3.4', now)).toBe(true);
    expect(limiter.check('1.2.3.4', now)).toBe(false);
    // Not enough time has passed yet.
    expect(limiter.check('1.2.3.4', now + 30_000)).toBe(false);
    // A full interval later, the bucket has refilled.
    expect(limiter.check('1.2.3.4', now + 60_000)).toBe(true);
  });
});
