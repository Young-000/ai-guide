/**
 * Affiliate link configuration and helpers.
 *
 * HOW TO ADD REAL AFFILIATE LINKS:
 *   1. Join the tool's partner/affiliate program (see docs/AFFILIATE.md).
 *   2. Paste the affiliate URL into the `affiliateUrl` field for that slug.
 *   3. Set `affiliateUrl: null` to fall back to the normal site URL (no sponsored rel).
 *
 * The `NEXT_PUBLIC_AFFILIATE_REF` env var appends a generic `?ref=` tag to
 * non-null affiliate URLs when set (optional — leave unset if the program
 * uses a full URL instead of a tag param).
 */

// ─── Types ─────────────────────────────────────────────────────────────────

type UtmParams = {
  source: string;
  medium: string;
  campaign: string;
  content?: string;
};

type AffiliateConfig = {
  /** Name of the affiliate program (for docs/reporting). */
  program: string;
  /**
   * Full affiliate URL provided by the program.
   * null = no program yet; falls back to the tool's normal URL.
   * TODO: 제휴 가입 후 실제 링크로 교체
   */
  affiliateUrl: string | null;
};

export type ToolLinkResult = {
  href: string;
  isAffiliate: boolean;
};

// ─── Config ────────────────────────────────────────────────────────────────

/**
 * Single source of truth for affiliate programs.
 * Slugs match keys in src/data/tools.json.
 *
 * TO PLUG IN REAL IDs:
 *   Replace `affiliateUrl: null` with the URL you receive after joining the
 *   partner program. See docs/AFFILIATE.md for program links and instructions.
 */
const AFFILIATE_CONFIGS: Record<string, AffiliateConfig> = {
  chatgpt: {
    program: 'OpenAI (none — direct referral only)',
    affiliateUrl: null, // TODO: 제휴 가입 후 실제 링크
  },
  claude: {
    program: 'Anthropic (none — direct referral only)',
    affiliateUrl: null, // TODO: 제휴 가입 후 실제 링크
  },
  gemini: {
    program: 'Google (none — direct referral only)',
    affiliateUrl: null, // TODO: 제휴 가입 후 실제 링크
  },
  cursor: {
    program: 'Cursor Partner Program',
    affiliateUrl: null, // TODO: 제휴 가입 후 실제 링크 (https://cursor.sh/partners)
  },
  'github-copilot': {
    program: 'GitHub Affiliate Program',
    affiliateUrl: null, // TODO: 제휴 가입 후 실제 링크
  },
  midjourney: {
    program: 'Midjourney (no public program)',
    affiliateUrl: null, // TODO: 프로그램 공개 여부 재확인
  },
  notion: {
    program: 'Notion Affiliate Program',
    affiliateUrl: null, // TODO: 제휴 가입 후 실제 링크 (https://www.notion.com/affiliates)
  },
  'notion-ai': {
    program: 'Notion Affiliate Program',
    affiliateUrl: null, // TODO: 제휴 가입 후 실제 링크 (https://www.notion.com/affiliates)
  },
  gamma: {
    program: 'Gamma Affiliate Program',
    affiliateUrl: null, // TODO: 제휴 가입 후 실제 링크
  },
  perplexity: {
    program: 'Perplexity Affiliate Program',
    affiliateUrl: null, // TODO: 제휴 가입 후 실제 링크
  },
  canva: {
    program: 'Canva Affiliate Program',
    affiliateUrl: null, // TODO: 제휴 가입 후 실제 링크 (https://www.canva.com/affiliates/)
  },
  'canva-ai': {
    program: 'Canva Affiliate Program',
    affiliateUrl: null, // TODO: 제휴 가입 후 실제 링크 (https://www.canva.com/affiliates/)
  },
  grammarly: {
    program: 'Grammarly Affiliate Program',
    affiliateUrl: null, // TODO: 제휴 가입 후 실제 링크 (https://www.grammarly.com/affiliates)
  },
  deepl: {
    program: 'DeepL Affiliate Program',
    affiliateUrl: null, // TODO: 제휴 가입 후 실제 링크
  },
  elevenlabs: {
    program: 'ElevenLabs Affiliate Program',
    affiliateUrl: null, // TODO: 제휴 가입 후 실제 링크
  },
  runway: {
    program: 'Runway Affiliate Program',
    affiliateUrl: null, // TODO: 제휴 가입 후 실제 링크
  },
  otter: {
    program: 'Otter.ai Affiliate Program',
    affiliateUrl: null, // TODO: 제휴 가입 후 실제 링크
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Returns the correct link for a tool:
 *   - affiliate URL (+ optional ref tag) if a program is configured
 *   - the tool's normal URL with UTM params appended otherwise
 *
 * The optional `normalUrl` is only used for the non-affiliate fallback.
 */
export function getToolLink(slug: string, normalUrl: string): ToolLinkResult {
  const config = AFFILIATE_CONFIGS[slug];

  if (config?.affiliateUrl) {
    const ref = process.env['NEXT_PUBLIC_AFFILIATE_REF'];
    let href = config.affiliateUrl;

    if (ref) {
      try {
        const url = new URL(href);
        url.searchParams.set('ref', ref);
        href = url.toString();
      } catch {
        // malformed affiliate URL — use as-is
      }
    }

    return { href, isAffiliate: true };
  }

  return { href: buildToolUrl(normalUrl, slug, 'tool'), isAffiliate: false };
}

/**
 * Returns true if the page has at least one configured (non-null) affiliate
 * link among the provided slugs. Used to conditionally render disclosure.
 */
export function hasAffiliateLinks(slugs: readonly string[]): boolean {
  return slugs.some((slug) => AFFILIATE_CONFIGS[slug]?.affiliateUrl != null);
}

/**
 * Append UTM parameters to a tool's official URL.
 * If the URL already has query params, appends with &.
 * Returns the original URL unchanged if it is empty/invalid.
 */
export function buildToolUrl(
  baseUrl: string,
  toolSlug: string,
  sourcePage: string,
): string {
  if (!baseUrl) return '';

  const utm: UtmParams = {
    source: 'ai-guide',
    medium: 'referral',
    campaign: toolSlug,
    content: sourcePage,
  };

  try {
    const url = new URL(baseUrl);
    url.searchParams.set('utm_source', utm.source);
    url.searchParams.set('utm_medium', utm.medium);
    url.searchParams.set('utm_campaign', utm.campaign);
    if (utm.content) {
      url.searchParams.set('utm_content', utm.content);
    }
    return url.toString();
  } catch {
    // If URL parsing fails, return original
    return baseUrl;
  }
}
