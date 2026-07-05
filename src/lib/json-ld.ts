// Serializes a JSON-LD payload for embedding inside a <script type="application/ld+json">
// tag. Escapes "<" and ">" so a value containing "</script>" (or any other
// tag-like substring) cannot prematurely close the surrounding <script> element
// or inject markup — defense-in-depth even when the source data is static.
export function safeJson(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e');
}
