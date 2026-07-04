export type CanonicalHostCheck = {
  host: string;
  vercelEnv: string | undefined;
};

const VERCEL_APP_HOST_SUFFIX = '.vercel.app';

/**
 * True when a request should 308-redirect to the canonical production host.
 *
 * GSC flagged https://ai-guide-nu.vercel.app/ as an indexable duplicate of
 * aiwire.news. Only PRODUCTION traffic hitting a *.vercel.app host should
 * redirect — preview deployments (VERCEL_ENV === 'preview') must keep
 * working on their own vercel.app preview URL for review, and any custom
 * domain (including localhost in dev) must never be redirected.
 */
export function shouldRedirectToCanonicalHost({ host, vercelEnv }: CanonicalHostCheck): boolean {
  if (vercelEnv !== 'production') return false;

  const hostWithoutPort = host.toLowerCase().split(':')[0] ?? '';
  return hostWithoutPort.endsWith(VERCEL_APP_HOST_SUFFIX);
}
