import { XMLParser } from 'fast-xml-parser';

// ─── Public types ────────────────────────────────────────────────────────────

export type FeedItem = {
  source: string;
  title: string;
  url: string;
  publishedAt: string | null;
  summary: string | null;
};

// ─── Internal types ──────────────────────────────────────────────────────────

type XmlNode = Record<string, unknown>;

// ─── XML parser (shared instance) ────────────────────────────────────────────

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  // Force item/entry to arrays even when there is only one child element.
  isArray: (name: string) => name === 'item' || name === 'entry',
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Coerces an unknown XML node value to a trimmed string, or null. */
function toStr(v: unknown): string | null {
  if (typeof v === 'string') return v.trim() || null;
  if (v !== null && typeof v === 'object') {
    const node = v as XmlNode;
    const text = node['#text'];
    if (typeof text === 'string') return text.trim() || null;
  }
  return null;
}

/**
 * Extracts the href from an Atom `<link>` value.
 * Handles: string, single object `{ @_href }`, array of objects (picks rel=alternate or first).
 */
function extractAtomLink(linkVal: unknown): string | null {
  if (typeof linkVal === 'string') return linkVal.trim() || null;

  if (Array.isArray(linkVal)) {
    const preferred = (linkVal as XmlNode[]).find(
      (l) => l['@_rel'] === 'alternate' || !l['@_rel'],
    );
    const candidate = preferred ?? (linkVal[0] as XmlNode | undefined);
    return candidate ? toStr(candidate['@_href']) : null;
  }

  if (linkVal !== null && typeof linkVal === 'object') {
    return toStr((linkVal as XmlNode)['@_href']);
  }

  return null;
}

// ─── Public functions ────────────────────────────────────────────────────────

/**
 * Parses an RSS 2.0 or Atom feed XML string into `FeedItem[]`.
 * Returns `[]` on any parse error or unrecognised feed format (fail-open).
 */
export function parseFeed(xml: string, sourceName: string): FeedItem[] {
  if (!xml.trim()) return [];

  let parsed: unknown;
  try {
    parsed = xmlParser.parse(xml);
  } catch {
    return [];
  }

  const root = parsed as XmlNode;

  // ── RSS 2.0 ───────────────────────────────────────────────────────────────
  const rssRoot = root['rss'] as XmlNode | undefined;
  const channel = rssRoot?.['channel'] as XmlNode | undefined;
  if (channel) {
    const rawItems = (channel['item'] ?? []) as XmlNode[];
    return rawItems
      .map((item): FeedItem => ({
        source: sourceName,
        title: toStr(item['title']) ?? '',
        url: toStr(item['link']) ?? '',
        publishedAt: toStr(item['pubDate']),
        summary: toStr(item['description']),
      }))
      .filter((i) => i.title !== '' && i.url !== '');
  }

  // ── Atom ──────────────────────────────────────────────────────────────────
  const atomFeed = root['feed'] as XmlNode | undefined;
  if (atomFeed) {
    const rawEntries = (atomFeed['entry'] ?? []) as XmlNode[];
    return rawEntries
      .map((entry): FeedItem => ({
        source: sourceName,
        title: toStr(entry['title']) ?? '',
        url: extractAtomLink(entry['link']) ?? '',
        publishedAt: toStr(entry['updated']),
        summary: toStr(entry['summary']),
      }))
      .filter((i) => i.title !== '' && i.url !== '');
  }

  return [];
}

/**
 * Filters `items` to those not already published.
 * - Drops items whose `url` is in `publishedUrls`.
 * - Drops items whose title (lowercased, trimmed) is in `existingTitles`.
 */
export function dedupeItems(
  items: FeedItem[],
  publishedUrls: Set<string>,
  existingTitles: Set<string>,
): FeedItem[] {
  return items.filter((item) => {
    if (publishedUrls.has(item.url)) return false;
    if (existingTitles.has(item.title.toLowerCase().trim())) return false;
    return true;
  });
}
