/**
 * Coupang Partners banner.
 *
 * Rules that must not be relaxed:
 *
 * 1. **The disclosure sentence is fixed.** Coupang Partners specifies the exact wording, and the
 *    Korean Fair Trade Commission's endorsement guidelines make it mandatory. Shortening or
 *    rewording it is a violation, so it lives here as a constant and is rendered verbatim.
 * 2. **`referrerPolicy="unsafe-url"` on the link.** Without it the referrer never reaches Coupang
 *    and no commission is attributed — the banner renders but earns nothing.
 * 3. **Korean pages only.** Coupang ships to Korea and the disclosure is Korean, so the banner has
 *    no place on `/en`.
 * 4. **Never pushed through messengers or SNS.** Sending these links to people who did not opt in
 *    is illegal spam (up to a KRW 30M fine or criminal liability). Placing them on our own pages
 *    is not affected.
 */

/** Verbatim wording required by Coupang Partners. Do not edit. */
export const COUPANG_DISCLOSURE =
  '이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.';

export type CoupangBanner = {
  /** Landing URL issued by the Partners console. */
  href: string;
  /** Banner image endpoint. `subId` is filled in per site by `bannerWithSubId`. */
  imageSrc: string;
  width: number;
  height: number;
};

/**
 * Banners issued in the Partners console.
 *
 * Keep the query string exactly as issued — `trackingCode` and `traceId` are what tie a click back
 * to our account.
 */
export const COUPANG_BANNERS: CoupangBanner[] = [
  {
    href: 'https://link.coupang.com/a/fYm5U9GKzs',
    imageSrc:
      'https://ads-partners.coupang.com/banners/1014520?trackingCode=AF3704750&subId=&traceId=V0-301-879dd1202e5c73b2-I1014520&w=728&h=90',
    width: 728,
    height: 90,
  },
];

/**
 * Tag a banner with the site it runs on.
 *
 * The Partners dashboard reports revenue per `subId`, so without this every site's earnings land in
 * one undifferentiated bucket and we cannot tell which one pays for itself.
 */
export function bannerWithSubId(banner: CoupangBanner, subId: string): CoupangBanner {
  const url = new URL(banner.imageSrc);
  url.searchParams.set('subId', subId);

  return { ...banner, imageSrc: url.toString() };
}

/** Today in Seoul, as `YYYY-MM-DD`. Kept local so this module stays self-contained. */
export function kstToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/**
 * The banner to show on a given day.
 *
 * Seeded by date rather than `Math.random()`: a random pick would differ between the server render
 * and the client, breaking hydration, and would not survive ISR caching either.
 */
export function bannerOfTheDay(
  date: string,
  banners: CoupangBanner[] = COUPANG_BANNERS,
): CoupangBanner | null {
  if (banners.length === 0) return null;

  const seed = Array.from(date).reduce((total, char) => total + char.charCodeAt(0), 0);
  return banners[seed % banners.length];
}
