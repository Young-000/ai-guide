import { NextRequest, NextResponse } from 'next/server';
import { shouldRedirectToCanonicalHost } from '@/lib/canonical-host';

const CANONICAL_HOST = 'aiwire.news';

// GSC: https://ai-guide-nu.vercel.app/ serves an indexable 200 (it carries a
// cross-domain canonical to aiwire.news, so it's "benign", but we want it
// eliminated). Permanently redirect PRODUCTION traffic on the default/alias
// vercel.app host to the same path on the real domain. Preview deployments
// and any custom domain (including localhost) must pass through untouched —
// see shouldRedirectToCanonicalHost for the decision logic (unit-tested
// separately in src/lib/__tests__/canonical-host.test.ts).
export function middleware(request: NextRequest): NextResponse {
  const host = request.headers.get('host') ?? '';

  if (!shouldRedirectToCanonicalHost({ host, vercelEnv: process.env.VERCEL_ENV })) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.protocol = 'https:';
  url.host = CANONICAL_HOST;
  url.port = '';
  return NextResponse.redirect(url, 308);
}

export const config = {
  // Skip Next.js internals, the image optimizer, favicon, and API routes.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
