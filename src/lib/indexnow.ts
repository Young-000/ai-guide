import { BASE_URL } from '@/lib/site';

// IndexNow key. MUST match the public key file public/{INDEXNOW_KEY}.txt,
// whose body is also exactly this key. Search engines verify ownership by
// fetching that file.
export const INDEXNOW_KEY = 'ddd82090bbb3126c02df2153ddd48ceb';

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const HOST = new URL(BASE_URL).host; // 'aiwire.news'

export type IndexNowPayload = {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
};

export type SubmitResult = {
  ok: boolean;
  submitted: number;
  status: number;
};

// Keeps only well-formed, same-host, deduped URLs. IndexNow rejects a batch
// if any URL is off-host, so we filter defensively.
function sanitizeUrls(urls: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of urls) {
    let parsed: URL;
    try {
      parsed = new URL(raw);
    } catch {
      continue;
    }
    if (parsed.host !== HOST) continue;
    if (seen.has(parsed.href)) continue;
    seen.add(parsed.href);
    out.push(parsed.href);
  }
  return out;
}

/**
 * Builds the IndexNow request body for a set of URLs (sanitized + deduped).
 * Pure — unit-testable without network.
 */
export function buildIndexNowPayload(urls: readonly string[]): IndexNowPayload {
  return {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: sanitizeUrls(urls),
  };
}

/**
 * Submits URLs to IndexNow. Fail-soft: never throws, returns ok:false on error.
 * Skips the network call entirely when there are no valid URLs.
 */
export async function submitUrls(urls: readonly string[]): Promise<SubmitResult> {
  const payload = buildIndexNowPayload(urls);
  if (payload.urlList.length === 0) {
    return { ok: true, submitted: 0, status: 0 };
  }

  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    });
    return {
      ok: res.ok,
      submitted: res.ok ? payload.urlList.length : 0,
      status: res.status,
    };
  } catch (err) {
    console.warn('[indexnow] submit failed:', (err as Error).message);
    return { ok: false, submitted: 0, status: 0 };
  }
}
