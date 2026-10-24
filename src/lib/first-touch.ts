/**
 * 첫 접점(first touch) 보존 — 유료 광고 계측 준비 (2026-10-24 감사 §11-3).
 *
 * 왜. 지금까지는 랜딩에서 utm source/medium 한 줄만 셌고, 수익 이벤트에는 어떤 유입 정보도 없었다.
 * 광고를 눌러 들어온 사람이 몇 페이지를 돌다 제휴 링크를 누르면, 그 클릭이 어느 캠페인의 것인지 읽을 수 없었다.
 *
 * 저장 값: utm_source · utm_medium · utm_campaign · utm_content · utm_term · gclid · gbraid · wbraid · fbclid · referrer.
 * 저장소: localStorage + 쿠키 (30일, Secure). 한쪽이 지워져도 다른 쪽에서 복구한다.
 *
 * 귀속 규칙은 lucksy `src/lib/analytics/channel.ts`(운영 규칙, 206행 근처 `captureChannel`)를 따른다 — 새 규칙을 만들지 않는다:
 *   - 저장된 **유료** 첫 접점은 최종이다. 이후의 어떤 랜딩(새 유료 클릭 포함)도 덮지 못한다.
 *   - 저장된 유료가 아닌 접점은 첫 접점이 이기되, 유료 랜딩이 오면 그 랜딩으로 교체한다 (광고 예산이 산 방문은 그 클릭이다).
 *   - 직접 방문·사이트 내부 이동은 저장하지 않는다 (저장하면 이후의 진짜 첫 접점을 가린다).
 *   - 유료 판정: 구글 클릭 ID(gclid · gbraid · wbraid) 또는 유료 utm_medium(cpc · ppc · paid · paid_social · paidsocial · display · demandgen).
 *   - `fbclid` 는 유료 신호가 아니다. Meta 가 오가닉 FB/IG 링크에도 붙인다. utm 이 없으면 `utm_source=meta`, `utm_medium=social`(오가닉)로
 *     기록하고, utm_medium 이 유료를 말할 때만 유료다.
 *
 * 값 검증 (쓸 때와 읽을 때 같은 함수를 쓴다 — lucksy `toChannel` 처럼 저장소의 값도 믿지 않는다):
 *   - utm 값은 lucksy `channel.ts` 의 라벨 규칙: 소문자, `^[a-z0-9_:-]{1,40}$`, 숫자-구분자-숫자 꼴(날짜 등)과 휴대전화 번호 꼴은 `other`.
 *     광고 소재 엔진이 쓰는 UUID(`utm_content`)는 소재 ID 라서 규칙 앞에서 통과시킨다.
 *   - 클릭 ID 는 불투명 토큰이라 `^[A-Za-z0-9_-]{1,200}$` 만 받는다.
 *   - referrer 는 origin(100자 이하)까지만 남긴다 (경로·쿼리에는 검색어가 들어간다).
 *   - 저장소에서 읽은 값이 이 규칙을 하나라도 어기면 레코드 전체를 버린다 (고치지 않는다). 미래 시각(`savedAt > now`)과 30일 지난 레코드도 버린다.
 *
 * 이 파일은 trend-radar · flight-trends · ai-guide 에 **복사본**으로 있다 (공용 패키지를 만들지 않기로 했다).
 * 저장 키 두 상수 외에는 세 파일이 같다. trend-radar 와 flight-trends 는 같은 도메인(hottrend.news)이라 같은 키를 쓴다.
 *
 * 어떤 경우에도 throw 하지 않는다. 저장소가 막혀도(사생활 보호 모드) 현재 주소로만 판정한다.
 */

export const FIRST_TOUCH_STORAGE_KEY = 'aiwire:first-touch';
export const FIRST_TOUCH_COOKIE_NAME = 'aiwire_ft';
export const FIRST_TOUCH_TTL_DAYS = 30;

const UTM_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
const PAID_CLICK_ID_FIELDS = ['gclid', 'gbraid', 'wbraid'] as const;
const CLICK_ID_FIELDS = [...PAID_CLICK_ID_FIELDS, 'fbclid'] as const;
const PAID_MEDIUMS: readonly string[] = ['cpc', 'ppc', 'paid', 'paid_social', 'paidsocial', 'display', 'demandgen'];

export type FirstTouchField =
  | (typeof UTM_FIELDS)[number]
  | (typeof CLICK_ID_FIELDS)[number]
  | 'referrer';
export type FirstTouch = Partial<Record<FirstTouchField, string>>;

type StoredTouch = { savedAt: number; touch: FirstTouch };

const TTL_SECONDS = FIRST_TOUCH_TTL_DAYS * 24 * 60 * 60;
const TTL_MS = TTL_SECONDS * 1000;
const OTHER = 'other';
const LABEL_PATTERN = /^[a-z0-9_:-]{1,40}$/;
const LABEL_FORBIDDEN = /\d[-_.:]+\d/;
const PHONE_PATTERN = /^01[016789]\d{7,8}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const CLICK_ID_PATTERN = /^[A-Za-z0-9_-]{1,200}$/;
const MAX_REFERRER_LENGTH = 100;
const MAX_STORED_LENGTH = 4096;

function toLabel(raw: string | null): string | undefined {
  const value = raw?.trim().toLowerCase();
  if (!value) return undefined;
  if (UUID_PATTERN.test(value)) return value;
  if (PHONE_PATTERN.test(value)) return OTHER;
  return LABEL_PATTERN.test(value) && !LABEL_FORBIDDEN.test(value) ? value : OTHER;
}

function toClickId(raw: string | null): string | undefined {
  if (raw === null || PHONE_PATTERN.test(raw)) return undefined;
  return CLICK_ID_PATTERN.test(raw) ? raw : undefined;
}

function toOrigin(raw: string): string | undefined {
  try {
    const url = new URL(raw);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined;
    return url.origin.length <= MAX_REFERRER_LENGTH ? url.origin : undefined;
  } catch {
    return undefined;
  }
}

function externalReferrerOrigin(referrer: string, currentHostname: string): string | undefined {
  if (!referrer) return undefined;
  const origin = toOrigin(referrer);
  return origin !== undefined && new URL(origin).hostname !== currentHostname ? origin : undefined;
}

/** Meta 는 오가닉 FB/IG 링크에도 fbclid 를 붙인다. utm 이 없으면 오가닉 소셜(meta / social)로 기록하고, 유료 여부는 utm_medium 만 말해 준다. */
function withFbclidDefaults(touch: FirstTouch): void {
  if (touch.fbclid === undefined) return;
  touch.utm_source ??= 'meta';
  touch.utm_medium ??= 'social';
}

function parseLanding(search: string, referrer: string, hostname: string): FirstTouch {
  const params = new URLSearchParams(search);
  const touch: FirstTouch = {};
  for (const field of UTM_FIELDS) {
    const label = toLabel(params.get(field));
    if (label !== undefined) touch[field] = label;
  }
  for (const field of CLICK_ID_FIELDS) {
    const clickId = toClickId(params.get(field));
    if (clickId !== undefined) touch[field] = clickId;
  }
  withFbclidDefaults(touch);
  const origin = externalReferrerOrigin(referrer, hostname);
  if (origin !== undefined) touch.referrer = origin;
  return touch;
}

/** 쓸 때 쓰는 검증과 같은 함수로 다시 거른다 — 저장소·쿠키의 값은 우리가 쓴 값이라는 보장이 없다. */
function isWrittenByUs(field: string, value: string): boolean {
  if ((UTM_FIELDS as readonly string[]).includes(field)) return toLabel(value) === value;
  if ((CLICK_ID_FIELDS as readonly string[]).includes(field)) return toClickId(value) === value;
  return field === 'referrer' && toOrigin(value) === value;
}

function isValidTouch(value: unknown): value is FirstTouch {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const entries = Object.entries(value);
  if (entries.length === 0) return false;
  return entries.every(([key, item]) => typeof item === 'string' && isWrittenByUs(key, item));
}

function parseStored(raw: string | null, now: number): StoredTouch | null {
  if (raw === null || raw.length > MAX_STORED_LENGTH) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const { savedAt, touch } = parsed as Partial<StoredTouch>;
    if (typeof savedAt !== 'number' || !Number.isFinite(savedAt)) return null;
    if (savedAt > now || now - savedAt > TTL_MS) return null;
    return isValidTouch(touch) ? { savedAt, touch } : null;
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
    const remainingSeconds = Math.floor((stored.savedAt + TTL_MS - now) / 1000);
    const maxAge = Math.min(TTL_SECONDS, Math.max(1, remainingSeconds));
    document.cookie =
      `${FIRST_TOUCH_COOKIE_NAME}=${encodeURIComponent(json)}; Max-Age=${maxAge}; Path=/; SameSite=Lax; Secure`;
  } catch {
    // 쿠키가 막혀도 페이지는 계속된다.
  }
}

/** 구글 클릭 ID 가 있거나 utm_medium 이 유료를 말하는 접점. fbclid 만으로는 유료가 아니다. */
function isPaid(touch: FirstTouch): boolean {
  if (PAID_CLICK_ID_FIELDS.some((field) => touch[field] !== undefined)) return true;
  return touch.utm_medium !== undefined && PAID_MEDIUMS.includes(touch.utm_medium);
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

/** lucksy channel.ts 와 같다: 저장된 유료 접점은 최종, 유료가 아닌 접점은 유료 랜딩에만 자리를 내준다. */
function keepsStoredTouch(stored: StoredTouch, landing: FirstTouch): boolean {
  return isPaid(stored.touch) || !isPaid(landing);
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
    if (stored !== null && keepsStoredTouch(stored, landing)) return keepStored(stored, now);
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
