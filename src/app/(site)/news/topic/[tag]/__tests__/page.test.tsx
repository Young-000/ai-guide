import { generateStaticParams } from '../page';
import { getAllTags } from '@/lib/news';

describe('topic page generateStaticParams', () => {
  it('returns raw (un-encoded) tags, not pre-encoded ones', () => {
    const params = generateStaticParams();
    const rawTags = getAllTags('ko');

    expect(params.map((p) => p.tag)).toEqual(rawTags);
  });

  it('never returns a tag containing a "%" escape sequence', () => {
    // encodeURIComponent output never contains a literal space, and any
    // already-percent-encoded string would contain '%'. Raw tags may
    // legitimately contain spaces (e.g. "Gemma 4") but never '%'.
    const params = generateStaticParams();
    for (const { tag } of params) {
      expect(tag).not.toContain('%');
    }
  });

  it('resolves a real multi-word tag route without double-encoding', () => {
    const params = generateStaticParams();
    const multiWord = params.find((p) => p.tag.includes(' '));

    // Guards against the fixture data losing its multi-word tags silently.
    expect(multiWord).toBeDefined();

    // What Next.js does internally: encode the raw param once when building
    // the prerendered path key. This must match what an incoming request
    // `/news/topic/<encoded tag>` decodes back to.
    const encodedOnce = encodeURIComponent(multiWord!.tag);
    expect(decodeURIComponent(encodedOnce)).toBe(multiWord!.tag);
    // The bug produced a double-encoded value like 'AI%2520Agents' — assert
    // generateStaticParams itself never emits a percent-encoded tag.
    expect(multiWord!.tag).not.toContain('%25');
  });
});
