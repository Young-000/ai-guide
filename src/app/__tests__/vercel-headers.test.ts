import fs from 'node:fs';
import path from 'node:path';

type VercelHeaderRule = {
  source: string;
  headers: { key: string; value: string }[];
};

type VercelConfig = {
  headers: VercelHeaderRule[];
};

function loadVercelConfig(): VercelConfig {
  const raw = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'vercel.json'), 'utf8');
  return JSON.parse(raw) as VercelConfig;
}

// Regression guard for the embed-widget framing bug: the site-wide catch-all
// header rule sends X-Frame-Options: DENY, which blocks /embed/ai-news from
// being iframed on third-party sites (its whole purpose). See
// src/app/embed/ai-news/page.tsx's own comment about this.
describe('vercel.json — embed widget framability', () => {
  const config = loadVercelConfig();

  it('scopes the catch-all security-header rule to exclude /embed/*', () => {
    const catchAll = config.headers.find((h) => h.headers.some((hh) => hh.key === 'X-Frame-Options'));
    expect(catchAll).toBeDefined();
    expect(catchAll!.source).not.toBe('/(.*)');

    const xfo = catchAll!.headers.find((hh) => hh.key === 'X-Frame-Options');
    expect(xfo?.value).toBe('DENY');
  });

  it('has a dedicated /embed/(.*) rule that omits X-Frame-Options and sets frame-ancestors *', () => {
    const embedRule = config.headers.find((h) => h.source === '/embed/(.*)');
    expect(embedRule).toBeDefined();
    expect(embedRule!.headers.some((hh) => hh.key === 'X-Frame-Options')).toBe(false);

    const csp = embedRule!.headers.find((hh) => hh.key === 'Content-Security-Policy');
    expect(csp?.value).toContain('frame-ancestors *');
  });

  it('the /embed rule still sets the other baseline security headers (nosniff, referrer policy, etc.)', () => {
    const embedRule = config.headers.find((h) => h.source === '/embed/(.*)');
    const keys = embedRule!.headers.map((hh) => hh.key);
    expect(keys).toEqual(
      expect.arrayContaining([
        'X-Content-Type-Options',
        'X-XSS-Protection',
        'Referrer-Policy',
        'Permissions-Policy',
      ]),
    );
  });

  it('the catch-all exclusion pattern (as a regex fragment) excludes /embed/* paths but not ordinary ones', () => {
    // Vercel's `source` matcher compiles this via path-to-regexp, which we
    // can't exercise offline — this checks the regex fragment's own JS
    // semantics in isolation. Confirm the real behavior post-deploy with:
    //   curl -sI https://aiwire.news/embed/ai-news | grep -i "x-frame\|content-security"
    //   curl -sI https://aiwire.news/ | grep -i x-frame   # still DENY
    const catchAll = config.headers.find((h) => h.headers.some((hh) => hh.key === 'X-Frame-Options'))!;
    const pattern = new RegExp(`^${catchAll.source.slice(1)}$`);

    expect(pattern.test('embed/ai-news')).toBe(false);
    expect(pattern.test('news')).toBe(true);
    expect(pattern.test('')).toBe(true);
    // Only an exact "embed/" prefix is excluded, not any path containing "embed".
    expect(pattern.test('embedded-page')).toBe(true);
  });
});
