type Bucket = { tokens: number; updatedAt: number };

export type RateLimiter = {
  /** Returns true if the request is allowed, false if the key is over its limit. */
  check: (key: string, now?: number) => boolean;
};

/**
 * Best-effort per-key token bucket rate limiter, held in memory.
 *
 * Serverless instances are not shared and can cold-start at any time, so
 * this does not guarantee a hard global limit — it only slows down abuse
 * from a single warm instance. That's an acceptable trade-off for a public
 * subscribe endpoint where the alternative (no limit at all) is worse.
 */
export function createTokenBucketRateLimiter(
  capacity: number,
  refillIntervalMs: number,
): RateLimiter {
  const buckets = new Map<string, Bucket>();

  function check(key: string, now: number = Date.now()): boolean {
    const bucket = buckets.get(key) ?? { tokens: capacity, updatedAt: now };
    const elapsedIntervals = Math.floor((now - bucket.updatedAt) / refillIntervalMs);
    const tokens = Math.min(capacity, bucket.tokens + Math.max(elapsedIntervals, 0));
    const updatedAt = elapsedIntervals > 0 ? now : bucket.updatedAt;

    if (tokens <= 0) {
      buckets.set(key, { tokens, updatedAt });
      return false;
    }

    buckets.set(key, { tokens: tokens - 1, updatedAt });
    return true;
  }

  return { check };
}
