import { shouldRedirectToCanonicalHost } from '@/lib/canonical-host';

describe('shouldRedirectToCanonicalHost', () => {
  it('redirects production traffic hitting the default vercel.app domain', () => {
    expect(
      shouldRedirectToCanonicalHost({ host: 'ai-guide-nu.vercel.app', vercelEnv: 'production' }),
    ).toBe(true);
  });

  it('redirects production traffic on any *.vercel.app alias, not just the known one', () => {
    expect(
      shouldRedirectToCanonicalHost({ host: 'some-other-alias.vercel.app', vercelEnv: 'production' }),
    ).toBe(true);
  });

  it('is case-insensitive about the host header', () => {
    expect(
      shouldRedirectToCanonicalHost({ host: 'AI-GUIDE-NU.VERCEL.APP', vercelEnv: 'production' }),
    ).toBe(true);
  });

  it('does NOT redirect preview deployments even on a vercel.app host', () => {
    expect(
      shouldRedirectToCanonicalHost({ host: 'ai-guide-git-feature-x.vercel.app', vercelEnv: 'preview' }),
    ).toBe(false);
  });

  it('does NOT redirect local development', () => {
    expect(
      shouldRedirectToCanonicalHost({ host: 'localhost:3000', vercelEnv: undefined }),
    ).toBe(false);
  });

  it('does NOT redirect the custom domain itself, even in production', () => {
    expect(
      shouldRedirectToCanonicalHost({ host: 'aiwire.news', vercelEnv: 'production' }),
    ).toBe(false);
  });

  it('does NOT redirect a host that merely contains "vercel.app" as a substring elsewhere', () => {
    expect(
      shouldRedirectToCanonicalHost({ host: 'vercel.app.evil-lookalike.com', vercelEnv: 'production' }),
    ).toBe(false);
  });
});
