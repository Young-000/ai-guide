// 일시적 장애(네트워크 끊김, 5xx, 레이트리밋)에 대한 재시도 유틸.
// 수집·생성 파이프라인이 "한 번 실패 = 그 소스 통째로 포기"였던 걸 고치기 위해 도입.

/** 지수 백오프 상한. 이 위로 올라가면 CI 한 회차가 재시도만 하다 끝난다. */
const MAX_DELAY_MS = 30_000;

/** 재시도로 풀릴 가망이 있는 HTTP 상태 — 요청 타임아웃·레이트리밋·서버 오류. */
const RETRYABLE_STATUSES = new Set([408, 425, 429]);

export type RetryOptions = {
  /** 최초 시도 이후 추가로 시도할 횟수. */
  retries: number;
  baseDelayMs: number;
  /** 주입 가능한 지연 함수 — 테스트에서 즉시 반환시켜 실제 대기를 없앤다. */
  sleep?: (ms: number) => Promise<void>;
  /** false를 반환하면 재시도 없이 즉시 던진다 (예: 404). */
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  /** 재시도 직전에 호출 — 로그 남기는 용도. */
  onRetry?: (error: unknown, attempt: number, delayMs: number) => void;
};

export function isRetryableStatus(status: number): boolean {
  return RETRYABLE_STATUSES.has(status) || (status >= 500 && status <= 599);
}

export function backoffDelayMs(attempt: number, baseDelayMs: number): number {
  return Math.min(baseDelayMs * 2 ** attempt, MAX_DELAY_MS);
}

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * `attempt`를 성공할 때까지 최대 `retries`회 더 호출한다.
 * 재시도를 모두 소진하면 마지막 에러를 그대로 던진다 — 실패를 삼키지 않는다.
 */
export async function withRetry<T>(
  attempt: (attemptNumber: number) => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const { retries, baseDelayMs, sleep = defaultSleep, shouldRetry, onRetry } = options;

  let lastError: unknown;

  for (let i = 0; i <= retries; i++) {
    try {
      return await attempt(i);
    } catch (error) {
      lastError = error;

      const isLastAttempt = i === retries;
      if (isLastAttempt || (shouldRetry && !shouldRetry(error, i))) break;

      const delayMs = backoffDelayMs(i, baseDelayMs);
      onRetry?.(error, i, delayMs);
      await sleep(delayMs);
    }
  }

  throw lastError;
}
