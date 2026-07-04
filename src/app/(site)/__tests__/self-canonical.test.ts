import fs from 'node:fs';
import path from 'node:path';
import { BASE_URL } from '@/lib/site';
import { metadata as homeMetadata } from '../page';
import { metadata as glossaryMetadata } from '../glossary/page';
import { metadata as situationsMetadata } from '../situations/page';
import { metadata as toolsMetadata } from '../tools/page';
import { metadata as quizMetadata } from '../quiz/page';
import { metadata as trendsMetadata } from '../trends/page';
import { metadata as projectsMetadata } from '../projects/page';
import { metadata as onboardingMetadata } from '../onboarding/page';
import { metadata as compareMetadata } from '../compare/page';
import { metadata as myProgressMetadata } from '../my-progress/page';
import { metadata as onboardingResultMetadata } from '../onboarding/result/page';

type MetadataLike = { alternates?: { canonical?: string } };

function canonicalOf(metadata: MetadataLike): string | undefined {
  return metadata.alternates?.canonical;
}

// These 8 pages were the reported GSC "Duplicate without canonical" bucket:
// they exported no metadata at all and silently inherited the root layout's
// `alternates.canonical: BASE_URL`, so Google folded them into the homepage.
describe.each([
  ['situations', situationsMetadata, `${BASE_URL}/situations`],
  ['tools', toolsMetadata, `${BASE_URL}/tools`],
  ['compare', compareMetadata, `${BASE_URL}/compare`],
  ['glossary', glossaryMetadata, `${BASE_URL}/glossary`],
  ['quiz', quizMetadata, `${BASE_URL}/quiz`],
  ['trends', trendsMetadata, `${BASE_URL}/trends`],
  ['projects', projectsMetadata, `${BASE_URL}/projects`],
  ['onboarding', onboardingMetadata, `${BASE_URL}/onboarding`],
  // Found during the audit: same leak, not in the original reported bucket.
  ['my-progress', myProgressMetadata, `${BASE_URL}/my-progress`],
  ['onboarding/result', onboardingResultMetadata, `${BASE_URL}/onboarding/result`],
])('%s route metadata', (name, metadata, expectedCanonical) => {
  it(`canonicalizes to its own path (${expectedCanonical}), not the homepage`, () => {
    const canonical = canonicalOf(metadata as MetadataLike);
    expect(canonical).toBe(expectedCanonical);
    expect(canonical).not.toBe(BASE_URL);
  });
});

describe('home page metadata', () => {
  it('canonicalizes to "/" — no longer inherited from the root layout', () => {
    expect(canonicalOf(homeMetadata as MetadataLike)).toBe('/');
  });

  it('still exposes the RSS alternate link (previously only set on the root layout)', () => {
    const types = (homeMetadata as MetadataLike & { alternates?: { types?: Record<string, string> } })
      .alternates?.types;
    expect(types?.['application/rss+xml']).toBe(`${BASE_URL}/feed.xml`);
  });
});

describe('root layout metadata', () => {
  // Static source check rather than importing the module: app/layout.tsx
  // transitively imports @vercel/analytics/next, an ESM-only package Jest
  // can't transform, so importing it here would fail for unrelated reasons.
  it('no longer declares a site-wide alternates.canonical (the source of the leak)', () => {
    const source = fs.readFileSync(
      path.join(__dirname, '..', '..', 'layout.tsx'),
      'utf8',
    );
    expect(source).not.toMatch(/alternates\s*:\s*{\s*canonical\s*:\s*BASE_URL/);
  });
});
