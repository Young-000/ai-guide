/**
 * 유입원 판정.
 *
 * 🔴 왜 이 파일이 필요한가 (2026-09-26).
 *
 * trend-radar 의 계측은 `utm_source` 만 봤다. 구글·네이버 검색으로 들어온 사람은
 * utm 이 없으니 전부 `direct` 로 기록됐고, 21일 누적 464명 중 439명이 그 덩어리였다.
 * "직접 방문이 88%"라는 숫자만 남아 무엇을 키울지 판단할 수 없었다.
 *
 * 세 사이트가 같은 판정을 써야 한다 — 사이트마다 다르게 세면 나란히 비교할 수 없고,
 * 실제로 그래서 aiwire.news 의 트래픽이 hottrend.news 의 260배라는 것을 3주 동안 몰랐다.
 */

export type VisitSource = { source: string; medium: string };

/** DB 로 그대로 가는 값이라 길이·문자를 제한한다. */
const MAX_SOURCE_LENGTH = 40;

function sanitize(value: string): string {
  return value.replace(/[^a-zA-Z0-9_.-]/g, '').slice(0, MAX_SOURCE_LENGTH);
}

/** 검색엔진 — 호스트 조각으로 찾는다 (google.co.kr·search.naver.com 등 변형이 많다). */
const SEARCH_ENGINES: [fragment: string, source: string][] = [
  ['google.', 'google'],
  ['naver.', 'naver'],
  ['daum.', 'daum'],
  ['bing.', 'bing'],
  ['duckduckgo.', 'duckduckgo'],
  ['search.yahoo.', 'yahoo'],
  ['perplexity.', 'perplexity'],
  ['chatgpt.com', 'chatgpt'],
];

const SOCIAL: [fragment: string, source: string][] = [
  ['t.co', 'x'],
  ['twitter.com', 'x'],
  ['x.com', 'x'],
  ['facebook.', 'facebook'],
  ['instagram.', 'instagram'],
  ['youtube.', 'youtube'],
  ['youtu.be', 'youtube'],
  ['threads.', 'threads'],
  ['linkedin.', 'linkedin'],
  ['reddit.', 'reddit'],
];

function matchHost(host: string, table: [string, string][]): string | null {
  for (const [fragment, source] of table) {
    if (host.includes(fragment)) return source;
  }
  return null;
}

/**
 * 이 방문을 어디서 온 것으로 셀지 정한다.
 *
 * `null` 은 "세지 않는다"는 뜻이다 — 같은 사이트 안에서의 이동은 새 방문이 아니다.
 *
 * @param referrer document.referrer (없으면 빈 문자열)
 * @param currentHost 우리 사이트 호스트
 * @param search window.location.search
 */
export function classifyReferrer(referrer: string, currentHost: string, search: string): VisitSource | null {
  /* 우리가 붙인 표식이 가장 정확하다 — 어느 글에서 왔는지까지 담긴다. */
  const params = new URLSearchParams(search);
  const utmSource = params.get('utm_source');
  if (utmSource) {
    return { source: sanitize(utmSource), medium: sanitize(params.get('utm_medium') ?? 'unknown') || 'unknown' };
  }

  if (!referrer) {
    /*
      앱 안에서 링크를 열면 referrer 가 비어 온다 (카카오톡·인스타). 그래서 direct 를
      "주소를 직접 친 사람"으로 읽으면 안 된다 — medium 을 남겨 이 덩어리를 따로 본다.
    */
    return { source: 'direct', medium: 'none' };
  }

  let host: string;
  try {
    host = new URL(referrer).host.toLowerCase();
  } catch {
    /* 정상 브라우저가 만들지 않는 값이다. 버리지 말고 direct 로 합친다. */
    return { source: 'direct', medium: 'none' };
  }

  if (host === currentHost.toLowerCase()) return null;

  const engine = matchHost(host, SEARCH_ENGINES);
  if (engine) return { source: engine, medium: 'organic' };

  const social = matchHost(host, SOCIAL);
  if (social) return { source: social, medium: 'social' };

  return { source: sanitize(host.replace(/^www\./, '')), medium: 'referral' };
}
