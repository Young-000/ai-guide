import { shouldLoadAds } from '../ad-eligibility';

/**
 * 🔴 왜 (2026-09-26): 하루 6,000뷰의 대부분이 크롤러인데 광고 요청이 그들에게도
 * 나가고 있었다. AdSense 심사 중에 무효 트래픽이 쌓이는 것은 통과에 불리하다.
 *
 * 다만 **구글의 광고 크롤러는 막으면 안 된다** — 광고를 매칭하려고 페이지를 읽는
 * 쪽이라, 차단하면 광고 품질이 떨어지고 심사에도 해가 된다.
 */
describe('shouldLoadAds', () => {
  it('사람에게는 내려보낸다', () => {
    expect(shouldLoadAds('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit/605.1.15 Safari/604.1')).toBe(true);
    expect(shouldLoadAds('Mozilla/5.0 (Linux; Android 14) Chrome/129.0 Mobile Safari/537.36 KAKAOTALK')).toBe(true);
  });

  it('일반 크롤러에게는 내려보내지 않는다', () => {
    expect(shouldLoadAds('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')).toBe(false);
    expect(shouldLoadAds('Mozilla/5.0 (compatible; Yeti/1.1; +http://naver.me/spd)')).toBe(false);
    expect(shouldLoadAds('Mozilla/5.0 HeadlessChrome/129.0.0.0 Safari/537.36')).toBe(false);
  });

  /*
    🔴 이 예외가 이 파일의 존재 이유다. 광고 크롤러를 막으면 광고 매칭이 무너진다.
  */
  it('구글 광고 크롤러는 예외로 통과시킨다', () => {
    expect(shouldLoadAds('Mediapartners-Google')).toBe(true);
    expect(shouldLoadAds('Mozilla/5.0 (compatible; Mediapartners-Google/2.1; +http://www.google.com/bot.html)')).toBe(true);
    expect(shouldLoadAds('AdsBot-Google (+http://www.google.com/adsbot.html)')).toBe(true);
    expect(shouldLoadAds('AdsBot-Google-Mobile-Apps')).toBe(true);
  });

  it('UA 가 없으면 내려보내지 않는다', () => {
    expect(shouldLoadAds('')).toBe(false);
    expect(shouldLoadAds(null)).toBe(false);
  });
});
