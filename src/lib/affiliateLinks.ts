type UtmParams = {
  source: string;
  medium: string;
  campaign: string;
  content?: string;
};

/**
 * Append UTM parameters to a tool's official URL.
 * If the URL already has query params, appends with &.
 * Returns the original URL unchanged if it's empty/invalid.
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
