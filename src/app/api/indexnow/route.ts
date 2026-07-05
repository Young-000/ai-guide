import { NextResponse } from 'next/server';
import { getAllNews } from '@/lib/news';
import { submitUrls } from '@/lib/indexnow';
import { BASE_URL } from '@/lib/site';
import { createTokenBucketRateLimiter } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/request-ip';

// IndexNow ping endpoint. After the auto-publish routine pushes new articles,
// call this to notify search engines, e.g.:
//   curl -fsS "https://aiwire.news/api/indexnow?secret=$CRON_SECRET"
// (omit ?secret when CRON_SECRET is unset).

export const dynamic = 'force-dynamic';

// Best-effort per-IP guard. This route is unauthenticated whenever
// CRON_SECRET is unset (see isAuthorized below), and even when it is set the
// guard still protects the upstream IndexNow API/key from being hammered.
// 5 requests/minute is generous for the cron-triggered use case.
const RATE_LIMIT_CAPACITY = 5;
const RATE_LIMIT_REFILL_MS = 60_000;
const rateLimiter = createTokenBucketRateLimiter(RATE_LIMIT_CAPACITY, RATE_LIMIT_REFILL_MS);

// Collects the URLs worth pinging IndexNow about: the home, the news index,
// and every published Korean + English article. Kept small and deterministic.
function collectUrls(): string[] {
  const urls: string[] = [`${BASE_URL}/`, `${BASE_URL}/news`, `${BASE_URL}/en/news`];
  for (const n of getAllNews('ko')) urls.push(`${BASE_URL}/news/${n.slug}`);
  for (const n of getAllNews('en')) urls.push(`${BASE_URL}/en/news/${n.slug}`);
  return urls;
}

// Optional shared-secret guard. When CRON_SECRET is set, the caller must send
// it via `?secret=` or the `Authorization: Bearer` header. When unset, the
// route is open (it only triggers public search-engine indexing — low risk).
function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const url = new URL(request.url);
  if (url.searchParams.get('secret') === secret) return true;
  const auth = request.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

async function handle(request: Request): Promise<NextResponse> {
  if (!rateLimiter.check(getClientIp(request))) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const result = await submitUrls(collectUrls());
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}

export async function GET(request: Request): Promise<NextResponse> {
  return handle(request);
}

export async function POST(request: Request): Promise<NextResponse> {
  return handle(request);
}
