import type { Types } from '@amplitude/analytics-browser';

/**
 * 외부 분석 서비스로 나가는 주소에서 비밀을 걷어낸다.
 * 인증 콜백은 `#access_token=…`·`?code=…` 를 주소에 싣는데, 페이지뷰·referrer 속성이 그 주소를 그대로 보낸다.
 * - `#fragment` 는 통째로 버린다.
 * - 아래 이름의 쿼리 파라미터는 지운다. `utm_*` · `fbclid` · `gclid` 는 남는다.
 * - 이름이 `Query`·`Fragment` 로 끝나는 속성은 통째로 버리고, `referrer` 류 속성은 origin + 경로까지만 남긴다.
 */
const SECRET_PARAMS: ReadonlySet<string> = new Set([
  'access_token', 'refresh_token', 'id_token', 'token', 'code', 'state', 'token_hash', 'type',
  'error_description', 'apikey', 'key', 'email', 'phone',
]);

const PLACEHOLDER_ORIGIN = 'https://placeholder.invalid';
const AUTH_PATH = /^(?:\/[a-z]{2}(?:-[a-zA-Z]{2,4})?)?\/(?:auth(?:\/|$)|callback(?:\/|$))/;

export function sanitizeUrl(value: string): string {
  if (!/^(?:https?:\/\/|\/)/.test(value)) return value;
  let url: URL;
  try {
    url = new URL(value, PLACEHOLDER_ORIGIN);
  } catch {
    return value;
  }
  for (const name of Array.from(url.searchParams.keys())) {
    if (SECRET_PARAMS.has(name.toLowerCase())) url.searchParams.delete(name);
  }
  const rest = `${url.pathname}${url.search}`;
  return value.startsWith('/') ? rest : `${url.origin}${rest}`;
}

/** 인증 콜백 경로에서는 페이지뷰를 아예 보내지 않는다 */
export function isAuthCallbackPath(pathname: string): boolean {
  return AUTH_PATH.test(pathname);
}

/** 원시 쿼리·해시를 그대로 싣는 속성 이름 (네트워크 캡처의 'URL Query'·'URL Fragment' 등) — 값을 거르지 않고 속성째 버린다 */
const RAW_URL_PART_KEY = /(?:query|fragment)$/i;
/** referrer 류 속성은 origin + 경로까지만 남긴다 (검색어는 쿼리에 실린다). `referring_domain` 은 이미 도메인뿐이다 */
const REFERRER_KEY = /referrer$/i;

function toOriginAndPath(value: string): string {
  const url = sanitizeUrl(value);
  const cut = url.search(/[?#]/);
  return cut === -1 ? url : url.slice(0, cut);
}

function sanitizeValue(value: unknown, key = ''): unknown {
  if (typeof value === 'string') return REFERRER_KEY.test(key) ? toOriginAndPath(value) : sanitizeUrl(value);
  if (Array.isArray(value)) return value.map((item) => sanitizeValue(item, key));
  if (value && typeof value === 'object') return sanitizeRecord(value);
  return value;
}

function sanitizeRecord(record: object): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  Object.keys(record).forEach((key) => {
    if (RAW_URL_PART_KEY.test(key)) return;
    cleaned[key] = sanitizeValue((record as Record<string, unknown>)[key], key);
  });
  return cleaned;
}

/**
 * 같은 일을 하는 플러그인을 이름만 달리해 둘 만든다 (타임라인은 같은 이름의 두 번째 등록을 무시한다).
 * 하나는 init 직후(초기화 중에 나가는 첫 페이지뷰도 거치도록), 하나는 SDK 내장 플러그인이 다 깔린 뒤(마지막 enrichment)에 붙인다.
 */
export function createSanitizingPlugin(name = 'sanitize-urls'): Types.EnrichmentPlugin {
  return {
    name,
    type: 'enrichment',
    async execute(event) {
      if (event.event_properties) event.event_properties = sanitizeRecord(event.event_properties);
      if (event.user_properties) event.user_properties = sanitizeRecord(event.user_properties);
      return event;
    },
  };
}

export const sanitizingPlugin: Types.EnrichmentPlugin = createSanitizingPlugin();

/**
 * 인증 콜백 경로의 주소창에서 쿼리·`#fragment` 를 지운다 — 토큰이 SDK 에 닿기 전에.
 * 🔴 앱의 인증 처리기가 주소의 토큰을 이미 소비한 뒤에만 불러야 한다(이 저장소는 브라우저 인증 콜백이 없다).
 *    소비 전에 지우면 로그인이 깨진다. 인증 콜백이 생기면 이 호출 위치를 먼저 확인한다.
 */
export function scrubAuthCallbackAddress(): void {
  if (typeof location === 'undefined' || typeof history === 'undefined') return;
  if (!isAuthCallbackPath(location.pathname) || (!location.search && !location.hash)) return;
  try {
    history.replaceState(history.state, '', location.pathname);
  } catch {
    // 주소를 못 바꾸면 sanitizer 플러그인이 속성에서 지운다
  }
}
