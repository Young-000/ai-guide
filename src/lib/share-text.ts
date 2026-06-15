/**
 * Builds a share caption from an article's key fields.
 * Pure function — no side effects, safe to call anywhere.
 */
export function buildShareText(title: string, summary: string, url: string): string {
  return `${title.trim()}\n\n${summary.trim()}\n\n${url.trim()}`;
}
