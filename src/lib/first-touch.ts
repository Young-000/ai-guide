/**
 * 첫 접점(first touch) 보존 — 유료 광고 계측 준비 (2026-10-24 감사 §11-3).
 *
 * 왜. 지금까지는 랜딩에서 utm source/medium 한 줄만 셌고, 수익 이벤트(`outbound_click`)에는 어떤 유입 정보도 없었다.
 * 광고를 눌러 들어온 사람이 몇 페이지를 돌다 제휴 링크를 누르면, 그 클릭이 어느 캠페인의 것인지 읽을 수 없었다.
 *
 * 저장 값: utm_source · utm_medium · utm_campaign · utm_content · utm_term · gclid · gbraid · wbraid · fbclid · referrer.
 * 저장소: localStorage + 쿠키 (30일). 한쪽이 지워져도 다른 쪽에서 복구한다.
 *
 * 규칙:
 *   - 첫 접점이 이긴다. 광고가 아닌 후속 랜딩(utm만, referrer만)은 저장된 값을 덮지 않는다 (lane-battle `portal.ts` 방식).
 *   - 단, 저장된 값과 다른 **새 유료 클릭 ID**(gclid · gbraid · wbraid · fbclid)로 들어오면 그 랜딩으로 교체한다.
 *     광고 예산이 산 방문은 그 클릭이다. 같은 클릭 ID 로 다시 들어오면(새로고침) 건드리지 않는다.
 *   - 직접 방문·사이트 내부 이동은 저장하지 않는다 (저장하면 이후의 진짜 첫 접점을 가린다).
 *   - utm 값은 lucksy `channel.ts` 의 라벨 규칙을 따른다: 소문자, `^[a-z0-9_:-]{1,40}$`, 숫자-구분자-숫자 꼴(날짜 등)은 `other`.
 *     광고 소재 엔진이 쓰는 UUID(`utm_content`)는 소재 ID 라서 규칙 앞에서 통과시킨다.
 *   - 클릭 ID 는 불투명 토큰이라 `^[A-Za-z0-9_-]{1,200}$` 만 받고 나머지는 버린다.
 *   - referrer 는 origin 까지만 남긴다 (경로·쿼리에는 검색어가 들어간다).
 *
 * 이 파일은 trend-radar · flight-trends · ai-guide 에 **복사본**으로 있다 (공용 패키지를 만들지 않기로 했다).
 * 저장 키 두 상수만 사이트마다 다르다 — trend-radar · flight-trends(hottrend.news)와 다른 도메인이라 키가 다르다.
 *
 * 어떤 경우에도 throw 하지 않는다. 저장소가 막혀도(사생활 보호 모드) 현재 주소로만 판정한다.
 */

export const FIRST_TOUCH_STORAGE_KEY = 'aiwire:first-touch';
export const FIRST_TOUCH_COOKIE_NAME = 'aiwire_ft';
export const FIRST_TOUCH_TTL_DAYS = 30;

const UTM_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
const PAID_CLICK_ID_FIELDS = ['gclid', 'gbraid', 'wbraid', 'fbclid'] as const;

export type FirstTouchField =
  | (typeof UTM_FIELDS)[number]
  | (typeof PAID_CLICK_ID_FIELDS)[number]
  | 'referrer';
export type FirstTouch = Partial<Record<FirstTouchField, string>>;

type StoredTouch = { savedAt: number; touch: FirstTouch };

const TTL_MS = FIRST_TOUCH_TTL_DAYS * 24 * 60 * 60 * 1000;
const OTHER = 'other';
const LABEL_PATTERN = /^[a-z0-9_:-]{1,40}$/;
const LABEL_FORBIDDEN = /\d[-_.:]+\d/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const CLICK_ID_PATTERN = /^[A-Za-z0-9_-]{1,200}$/;
const MAX_REFERRER_LENGTH = 100;

function toLabel(raw: string | null): string | undefined {
  const value = raw?.trim().toLowerCase();
  if (!value) return undefined;
  if (UUID_PATTERN.test(value)) return value;
  return LABEL_PATTERN.test(value) && !LABEL_FORBIDDEN.test(value) ? value : OTHER;
}

function toClickId(raw: string | null): string | undefined {
  return raw !== null && CLICK_ID_PATTERN.test(raw) ? raw : undefined;
}

function externalReferrerOrigin(referrer: string, currentHostname: string): string | undefined {
  if (!referrer) return undefined;
  try {
    const url = new URL(referrer);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined;
    if (url.hostname === currentHostname) return undefined;
    return url.origin.slice(0, MAX_REFERRER_LENGTH);
  } catch {
    return undefined;
  }
}

function parseLanding(search: string, referrer: string, hostname: string): FirstTouch {
  const params = new URLSearchParams(search);
  const touch: FirstTouch = {};
  for (const field of UTM_FIELDS) {
    const label = toLabel(params.get(field));
    if (label !== undefined) touch[field] = label;
  }
  for (const field of PAID_CLICK_ID_FIELDS) {
    const clickId = toClickId(params.get(field));
    if (clickId !== undefined) touch[field] = clickId;
  }
  const origin = externalReferrerOrigin(referrer, hostname);
  if (origin !== undefined) touch.referrer = origin;
  return touch;
}

function isValidTouch(value: unknown): value is FirstTouch {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const allowed: readonly string[] = [...UTM_FIELDS, ...PAID_CLICK_ID_FIELDS, 'referrer'];
  return Object.entries(value).every(
    ([key, item]) => allowed.includes(key) && typeof item === 'string',
  );
}

function parseStored(raw: string | null, now: number): StoredTouch | null {
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const { savedAt, touch } = parsed as Partial<StoredTouch>;
    if (typeof savedAt !== 'number' || now - savedAt > TTL_MS || !isValidTouch(touch)) return null;
    return { savedAt, touch };
  } catch {
    return null;
  }
}

function readCookieValue(): string | null {
  const prefix = `${FIRST_TOUCH_COOKIE_NAME}=`;
  const part = document.cookie.split(';').map((item) => item.trim()).find((item) => item.startsWith(prefix));
  return part === undefined ? null : decodeURIComponent(part.slice(prefix.length));
}

function readStored(now: number): StoredTouch | null {
  let fromLocal: string | null = null;
  try {
    fromLocal = window.localStorage.getItem(FIRST_TOUCH_STORAGE_KEY);
  } catch {
    // 막힌 저장소: 쿠키로 넘어간다.
  }
  try {
    return parseStored(fromLocal, now) ?? parseStored(readCookieValue(), now);
  } catch {
    return null;
  }
}

function writeStored(stored: StoredTouch, now: number): void {
  const json = JSON.stringify(stored);
  try {
    window.localStorage.setItem(FIRST_TOUCH_STORAGE_KEY, json);
  } catch {
    // 막힌 저장소: 쿠키만 남긴다.
  }
  try {
    const remainingSeconds = Math.max(1, Math.floor((stored.savedAt + TTL_MS - now) / 1000));
    document.cookie =
      `${FIRST_TOUCH_COOKIE_NAME}=${encodeURIComponent(json)}; Max-Age=${remainingSeconds}; Path=/; SameSite=Lax`;
  } catch {
    // 쿠키가 막혀도 페이지는 계속된다.
  }
}

function hasNewPaidClickId(landing: FirstTouch, stored: FirstTouch): boolean {
  return PAID_CLICK_ID_FIELDS.some((field) => landing[field] !== undefined && landing[field] !== stored[field]);
}

function isEmpty(touch: FirstTouch): boolean {
  return Object.keys(touch).length === 0;
}

/** 저장된 값을 그대로 유지하며 비어 있는 쪽 저장소를 복구한다. 만료 시각은 그대로. */
function keepStored(stored: StoredTouch | null, now: number): FirstTouch | null {
  if (stored === null) return null;
  writeStored(stored, now);
  return stored.touch;
}

/**
 * 이 방문자의 첫 접점. 지금 주소가 새 첫 접점이면 저장하고, 아니면 저장된 값을 돌려준다.
 * 이벤트마다 불러도 안전하다 (같은 입력이면 같은 결과). 서버(window 없음)에서는 null.
 */
export function captureFirstTouch(): FirstTouch | null {
  if (typeof window === 'undefined') return null;
  try {
    const now = Date.now();
    const stored = readStored(now);
    const landing = parseLanding(window.location.search, document.referrer, window.location.hostname);
    if (isEmpty(landing)) return keepStored(stored, now);
    if (stored !== null && !hasNewPaidClickId(landing, stored.touch)) return keepStored(stored, now);
    writeStored({ savedAt: now, touch: landing }, now);
    return landing;
  } catch {
    return null;
  }
}

/** 전환 이벤트에 얹는 속성. 각 키에 `ft_` 를 붙여 "지금 페이지"의 값과 섞이지 않게 한다. 없는 필드는 키째 뺀다. */
export function firstTouchProperties(): Record<string, string> {
  const touch = captureFirstTouch();
  if (touch === null) return {};
  return Object.fromEntries(Object.entries(touch).map(([key, value]) => [`ft_${key}`, value]));
}
