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
    /*
      🔴 모바일에서는 내린다 (2026-09-26).

      발급받은 배너는 728×90 고정이다 — URL 의 w/h 파라미터를 320×100·300×250 로 바꿔
      요청해도 **같은 이미지(26,910 bytes, 같은 파일명)** 가 온다(실측). 375px 화면에
                맞추면 높이가 38px 이 되어 글씨를 읽을 수 없다.

      읽을 수 없는 광고는 눌리지 않는다. 게다가 "광고" 라벨과 3줄짜리 고지문이 정작
      광고보다 커지고, AdSense 심사자가 모바일로 보면 "광고 자리만 있고 내용 없음"으로
      읽힌다 — 지금은 심사 통과가 수익보다 먼저다.

      모바일용 배너(320×100 등)를 파트너스 콘솔에서 발급받으면 즉시 되살린다.
      발급은 오너만 가능해 docs/PENDING-OWNER-ACTIONS.md 에 올려 두었다.
    */
    <aside className="mx-auto hidden max-w-5xl px-4 py-8 sm:block" aria-label="쿠팡 파트너스 광고">
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
