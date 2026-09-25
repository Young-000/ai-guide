import { isBotUserAgent } from '../bot-detect';

describe('isBotUserAgent', () => {
  it('검색 크롤러를 잡는다', () => {
    expect(isBotUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')).toBe(true);
    expect(isBotUserAgent('Mozilla/5.0 (compatible; Yeti/1.1; +http://naver.me/spd)')).toBe(true);
    expect(isBotUserAgent('Mozilla/5.0 (compatible; ClaudeBot/1.0)')).toBe(true);
  });

  /*
    🔴 이게 aiwire.news 에서 세던 트래픽의 정체로 의심되는 쪽이다 — JS를 실행하므로
    클라이언트 계측에 사람처럼 잡힌다 (trend-radar 2026-08-11: 계측의 99.6%).
  */
  it('헤드리스 브라우저를 잡는다', () => {
    expect(isBotUserAgent('Mozilla/5.0 HeadlessChrome/129.0.0.0 Safari/537.36')).toBe(true);
    expect(isBotUserAgent('node-fetch/1.0')).toBe(true);
  });

  it('UA가 없으면 봇으로 본다', () => {
    expect(isBotUserAgent(null)).toBe(true);
    expect(isBotUserAgent('')).toBe(true);
  });

  /*
    넓게 잡으면 사람의 방문이 사라진다 — 계측을 고치려다 지표를 더 망친다.
    국내 인앱 브라우저를 고정해 둔다.
  */
  it('사람의 브라우저는 통과시킨다', () => {
    expect(isBotUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit/605.1.15 Safari/604.1')).toBe(false);
    expect(isBotUserAgent('Mozilla/5.0 (Linux; Android 14) Chrome/129.0.0.0 Mobile Safari/537.36 KAKAOTALK')).toBe(false);
    expect(isBotUserAgent('Mozilla/5.0 (iPhone) NAVER(inapp; search; 2000; 12.5.5)')).toBe(false);
    expect(isBotUserAgent('Mozilla/5.0 (Linux; Android 13) DaumApps/4.1 Chrome/120 Mobile Safari/537.36')).toBe(false);
  });
});
