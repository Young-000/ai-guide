import {
  COUPANG_BANNERS,
  COUPANG_DISCLOSURE,
  bannerOfTheDay,
  bannerWithSubId,
} from '../affiliate/coupang';

describe('COUPANG_DISCLOSURE', () => {
  // Coupang specifies this sentence and the FTC endorsement guidelines make it mandatory.
  // If someone "improves" the wording, this test is what catches it.
  it('matches the wording Coupang Partners requires, verbatim', () => {
    expect(COUPANG_DISCLOSURE).toBe(
      '이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.',
    );
  });
});

describe('COUPANG_BANNERS', () => {
  it('carries the tracking code on every banner', () => {
    for (const banner of COUPANG_BANNERS) {
      expect(banner.imageSrc).toContain('trackingCode=AF3704750');
    }
  });

  it('links to a Coupang partner URL', () => {
    for (const banner of COUPANG_BANNERS) {
      expect(banner.href).toMatch(/^https:\/\/link\.coupang\.com\//);
    }
  });
});

describe('bannerWithSubId', () => {
  it('fills in the subId so revenue is attributable to this site', () => {
    const tagged = bannerWithSubId(COUPANG_BANNERS[0], 'aiwire');

    expect(new URL(tagged.imageSrc).searchParams.get('subId')).toBe('aiwire');
  });

  it('keeps the tracking code and dimensions intact', () => {
    const tagged = bannerWithSubId(COUPANG_BANNERS[0], 'aiwire');
    const params = new URL(tagged.imageSrc).searchParams;

    expect(params.get('trackingCode')).toBe('AF3704750');
    expect(tagged.width).toBe(COUPANG_BANNERS[0].width);
    expect(tagged.height).toBe(COUPANG_BANNERS[0].height);
  });

  it('does not mutate the source banner', () => {
    const before = COUPANG_BANNERS[0].imageSrc;
    bannerWithSubId(COUPANG_BANNERS[0], 'aiwire');

    expect(COUPANG_BANNERS[0].imageSrc).toBe(before);
  });
});

describe('bannerOfTheDay', () => {
  it('returns the same banner for the same date', () => {
    const banners = [
      { href: 'https://link.coupang.com/a/one', imageSrc: 'https://x/1', width: 728, height: 90 },
      { href: 'https://link.coupang.com/a/two', imageSrc: 'https://x/2', width: 728, height: 90 },
    ];

    expect(bannerOfTheDay('2026-08-06', banners)).toBe(bannerOfTheDay('2026-08-06', banners));
  });

  it('returns null when there is nothing to show', () => {
    expect(bannerOfTheDay('2026-08-06', [])).toBeNull();
  });
});
