import { NextRequest, NextResponse, NextFetchEvent } from 'next/server';
import { shouldRedirectToCanonicalHost } from '@/lib/canonical-host';
import { trackServerPageView } from '@/lib/server-page-view';

const CANONICAL_HOST = 'aiwire.news';

// GSC: https://ai-guide-nu.vercel.app/ serves an indexable 200 (it carries a
// cross-domain canonical to aiwire.news, so it's "benign", but we want it
// eliminated). Permanently redirect PRODUCTION traffic on the default/alias
// vercel.app host to the same path on the real domain. Preview deployments
// and any custom domain (including localhost) must pass through untouched —
// see shouldRedirectToCanonicalHost for the decision logic (unit-tested
// separately in src/lib/__tests__/canonical-host.test.ts).
export function middleware(request: NextRequest, event: NextFetchEvent): NextResponse {
  const host = request.headers.get('host') ?? '';

  if (!shouldRedirectToCanonicalHost({ host, vercelEnv: process.env.VERCEL_ENV })) {
    // 뉴스 서브페이지 GET → 서버사이드 방문 카운트를 백그라운드에서 upsert.
    // waitUntil: 응답을 보낸 뒤에도 런타임이 Promise가 완료될 때까지 살아있도록 보장.
    event.waitUntil(trackServerPageView(request.nextUrl.pathname));
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
