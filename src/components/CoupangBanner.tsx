import { COUPANG_DISCLOSURE, bannerOfTheDay, bannerWithSubId, kstToday } from '@/lib/affiliate/coupang';
import OutclickLink from '@/components/OutclickLink';

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
        {/*
          클릭을 센다 (2026-09-26). 파트너스 대시보드는 전환만 보여줘서, 그 앞단인
          "몇 명이 눌렀나"가 없으면 배치를 고칠지 배너를 바꿀지 가릴 수 없다.
          referrerPolicy 는 OutclickLink 안에 있다 — 빠지면 수수료가 귀속되지 않는다.
        */}
        <OutclickLink href={tagged.href} network="coupang" placement={subId}>
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
        </OutclickLink>
      </div>

      {/* Coupang's exact sentence. Shortening or rewording it violates the FTC endorsement rules. */}
      <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-400">{COUPANG_DISCLOSURE}</p>
    </aside>
  );
}
