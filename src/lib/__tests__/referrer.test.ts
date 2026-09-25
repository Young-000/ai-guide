import { classifyReferrer } from '../referrer';

const HOST = 'aiwire.news';

describe('classifyReferrer', () => {
  /*
    🔴 이 함수가 없어서 3주를 헛다리 짚었다 (2026-09-26).
    trend-radar 의 계측은 utm_source 만 봐서, 구글 검색으로 들어온 사람도 전부
    'direct' 로 기록됐다. "직접 방문 439명"의 정체를 알 수 없던 이유다.
  */
  it('검색엔진을 organic 으로 가른다', () => {
    expect(classifyReferrer('https://www.google.com/search?q=claude', HOST, '')).toEqual({
      source: 'google', medium: 'organic',
    });
    expect(classifyReferrer('https://search.naver.com/search.naver?query=ai', HOST, '')).toEqual({
      source: 'naver', medium: 'organic',
    });
    expect(classifyReferrer('https://www.bing.com/search?q=x', HOST, '')).toEqual({
      source: 'bing', medium: 'organic',
    });
  });

  it('utm 이 있으면 referrer 보다 우선한다', () => {
    /* 우리가 붙인 표식이 가장 정확하다 — 어느 글에서 왔는지까지 담긴다. */
    expect(
      classifyReferrer('https://www.google.com/', HOST, '?utm_source=naver-blog&utm_medium=post'),
    ).toEqual({ source: 'naver-blog', medium: 'post' });
  });

  it('같은 사이트 안에서의 이동은 세지 않는다', () => {
    expect(classifyReferrer(`https://${HOST}/news`, HOST, '')).toBeNull();
  });

  it('referrer 가 없으면 direct 다', () => {
    expect(classifyReferrer('', HOST, '')).toEqual({ source: 'direct', medium: 'none' });
  });

  /*
    앱 안에서 링크를 열면 referrer 가 비어 오는 경우가 많다 — 카카오톡·인스타.
    그래서 direct 를 "주소를 직접 친 사람"으로 읽으면 안 된다. medium 을 'none' 으로
    남겨, 나중에 이 덩어리를 따로 볼 수 있게 한다.
  */
  it('모르는 사이트는 referral 로 남긴다', () => {
    expect(classifyReferrer('https://news.ycombinator.com/item?id=1', HOST, '')).toEqual({
      source: 'news.ycombinator.com', medium: 'referral',
    });
  });

  it('소셜을 따로 가른다', () => {
    expect(classifyReferrer('https://t.co/abc', HOST, '')).toEqual({ source: 'x', medium: 'social' });
    expect(classifyReferrer('https://m.facebook.com/', HOST, '')).toEqual({
      source: 'facebook', medium: 'social',
    });
    expect(classifyReferrer('https://www.youtube.com/', HOST, '')).toEqual({
      source: 'youtube', medium: 'social',
    });
  });

  it('망가진 referrer 로 죽지 않는다', () => {
    expect(classifyReferrer('%%%not a url%%%', HOST, '')).toEqual({ source: 'direct', medium: 'none' });
  });

  /* 유입원 값은 그대로 DB 로 간다 — 길이·문자를 제한해 두지 않으면 쓰레기가 쌓인다. */
  it('source 는 40자 이내의 안전한 문자만 남긴다', () => {
    const long = `https://${'a'.repeat(80)}.com/`;
    const result = classifyReferrer(long, HOST, '');
    expect(result!.source.length).toBeLessThanOrEqual(40);
    expect(result!.source).toMatch(/^[a-zA-Z0-9_.-]+$/);
  });
});
