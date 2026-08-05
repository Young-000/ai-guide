import { COUPANG_DISCLOSURE, bannerOfTheDay, bannerWithSubId, kstToday } from '@/lib/affiliate/coupang';

interface CoupangBannerProps {
  /**
   * Which page the banner sits on. Reported as `subId` in the Partners dashboard, so revenue can be
   * traced back to the placement instead of landing in one undifferentiated bucket.
   */
  subId: string;
}

/**
 * Coupang Partners banner.
 *
 * Placed after the content ends, never inside it. Our articles are editorial; an ad woven into the
 * reading flow would read as if we were recommending the product.
 *
 * Korean pages only — Coupang ships to Korea and the mandated disclosure is Korean.
 */
export default function CoupangBanner({ subId }: CoupangBannerProps): JSX.Element | null {
  const banner = bannerOfTheDay(kstToday());
  if (!banner) return null;

  const tagged = bannerWithSubId(banner, subId);

  return (
    <aside className="mx-auto max-w-5xl px-4 py-8" aria-label="쿠팡 파트너스 광고">
      <p className="mb-2 text-center text-[11px] font-medium uppercase tracking-wide text-slate-400">광고</p>

      <div className="flex justify-center">
        <a
          href={tagged.href}
          target="_blank"
          rel="noopener sponsored"
          // Without this the referrer never reaches Coupang and the commission is not attributed.
          referrerPolicy="unsafe-url"
        >
          {/* next/image would proxy a third-party ad endpoint through our optimizer — wrong tool here. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={tagged.imageSrc}
            alt="쿠팡 파트너스 추천 상품"
            width={tagged.width}
            height={tagged.height}
            loading="lazy"
            className="h-auto max-w-full"
          />
        </a>
      </div>

      {/* Coupang's exact sentence. Shortening or rewording it violates the FTC endorsement rules. */}
      <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-400">{COUPANG_DISCLOSURE}</p>
    </aside>
  );
}
