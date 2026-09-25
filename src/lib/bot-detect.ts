/**
 * 봇 판정 (User-Agent 기반).
 *
 * 왜 필요한가 — 2026-08-11 실측:
 *   - Amplitude에 하루 **75,394명**이 세션 0초로 잡혔다. 같은 기간 사람으로 보이는 사용자는
 *     319명(세션 1분 50초)이다. 즉 계측의 99.6%가 봇이었다.
 *   - `/go` 클릭 카운터도 같은 이유로 무의미했다 (8/10: 16,307개 상품이 상품당 1회씩).
 *   - 이 봇은 **JS를 실행한다**(헤드리스 브라우저). 그래서 robots.txt로도, "봇은 JS를 안 돈다"는
 *     통념으로도 걸러지지 않았다.
 *
 * **이 파일은 trend-radar 에서 가져왔다** (2026-09-26). 같은 착오를 aiwire.news 가
 * 반복하고 있었다 — 9/25 에 17,960 뷰가 잡혔는데 상위 6개가 전부 목록 페이지였다.
 * 두 사이트가 각자 판정하면 한쪽만 고쳐지므로, 토큰 목록이 갈리면 둘 다 본다.
 *
 * 판정 원칙: **명시적인 봇 토큰만** 잡는다. 넓게 잡아 사람을 봇으로 오판하면 그 사람의
 * 클릭이 사라진다 — 계측을 고치려다 매출을 깎는 셈이다. 그래서 브라우저 이름(Chrome/Safari)이나
 * OS 문자열로는 절대 판정하지 않고, 카카오톡·네이버 인앱 브라우저는 테스트로 고정해 둔다.
 */

/** 봇을 자칭하는 토큰. 사람 브라우저 UA에는 등장하지 않는다. */
const BOT_TOKENS = [
  'bot', // googlebot, bingbot, GPTBot, ClaudeBot, AhrefsBot, SemrushBot, Twitterbot, DotBot …
  'crawler',
  'crawling',
  'spider',
  'slurp', // Yahoo
  /*
    이름에 'bot'이 없는 국내 검색 크롤러. 슬래시까지 붙여 좁게 잡는다 —
    'daum'만 보면 다음 인앱 브라우저(`DaumApps/4.1`)를 쓰는 사람이 봇으로 오판된다.
  */
  'yeti/', // 네이버
  'daum/', // 다음
  'facebookexternalhit',
  'headlesschrome', // 헤드리스 브라우저 — 지금 우리를 훑는 그 스윕
  'phantomjs',
  'puppeteer',
  'playwright',
  'scrapy',
  'python-requests',
  'python-urllib',
  'aiohttp',
  'httpx',
  'curl/',
  'wget/',
  'go-http-client',
  'java/',
  'okhttp',
  'axios/',
  'node-fetch',
  'got (',
  'lighthouse',
  'pingdom',
  'uptimerobot',
  'gtmetrix',
];

/**
 * UA가 봇인지 판정한다. UA가 비었거나 없으면 봇으로 본다 —
 * 정상 브라우저는 User-Agent를 항상 보낸다.
 */
export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent) return true;

  const ua = userAgent.toLowerCase();
  return BOT_TOKENS.some((token) => ua.includes(token));
}
