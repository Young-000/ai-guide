import { metadata } from '../layout';
import { ADSENSE_CLIENT } from '@/lib/adsense-client';

// The layout imports Vercel Analytics, which ships ESM only; the metadata under test
// does not depend on it.
jest.mock('@vercel/analytics/next', () => ({ Analytics: () => null }));

// Regression guard (2026-09-27): AdSenseScript loads only after hydration and only
// for human user agents, so the server HTML carries no AdSense marker at all. The
// review crawler then has nothing to tie the site to the publisher account, and
// aiwire.news sat in "검토 중" from 9/12. The account meta tag is the marker that
// works without loading any ad code — it must stay in the server-rendered <head>.
describe('root layout — AdSense account meta', () => {
  it('declares the publisher account in server metadata', () => {
    expect(metadata.other).toMatchObject({ 'google-adsense-account': ADSENSE_CLIENT });
  });

  it('uses the teamY publisher id', () => {
    expect(ADSENSE_CLIENT).toBe('ca-pub-1379707580934572');
  });
});
