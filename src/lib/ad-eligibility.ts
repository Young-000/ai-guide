import { isBotUserAgent } from './bot-detect';

/**
 * 이 방문자에게 광고 스크립트를 내려보낼 것인가.
 *
 * 🔴 왜 (2026-09-26): 이 사이트의 하루 6,000 페이지뷰는 대부분 크롤러인데(상위 6개
 * 경로가 전부 목록 페이지), 광고 스크립트가 방문자를 가리지 않고 로드돼 **하루 수천
 * 건의 봇 광고 요청**이 나가고 있었다. AdSense 는 9/12부터 심사 중이고, 무효 트래픽이
 * 쌓이는 것은 통과에 불리하다.
 *
 * 🔴 **구글의 광고 크롤러는 예외다.** 이들은 광고를 매칭하려고 페이지를 읽는 쪽이라
 * 막으면 광고 품질이 떨어지고 심사에도 해가 된다. 그런데 우리 봇 판정은 'bot' 토큰을
 * 전부 잡아서 `Mediapartners-Google` 도 걸린다 — 그래서 이 함수가 따로 있다.
 * 계측용 `isBotUserAgent` 를 그대로 쓰면 안 되는 유일한 자리다.
 */

/** 광고를 매칭하려고 페이지를 읽는 구글 크롤러. 막으면 광고가 나빠진다. */
const AD_CRAWLERS = ['mediapartners-google', 'adsbot-google'];

export function shouldLoadAds(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;

  const ua = userAgent.toLowerCase();
  if (AD_CRAWLERS.some((token) => ua.includes(token))) return true;

  return !isBotUserAgent(userAgent);
}
