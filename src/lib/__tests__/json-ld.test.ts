import { safeJson } from '@/lib/json-ld';

describe('safeJson', () => {
  it('serializes a plain object to JSON', () => {
    expect(safeJson({ a: 1, b: 'two' })).toBe('{"a":1,"b":"two"}');
  });

  it('escapes "<" and ">" so a raw </script> cannot break out of the enclosing <script> tag', () => {
    const json = safeJson({ headline: '</script><script>alert(1)</script>' });
    expect(json).not.toContain('<');
    expect(json).not.toContain('>');
    expect(json).toContain('\\u003c/script\\u003e');
  });
});
