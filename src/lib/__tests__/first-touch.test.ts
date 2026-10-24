import {
  FIRST_TOUCH_COOKIE_NAME,
  FIRST_TOUCH_STORAGE_KEY,
  captureFirstTouch,
  firstTouchProperties,
} from '../first-touch';

const DAY_MS = 24 * 60 * 60 * 1000;
const THIRTY_DAYS_SECONDS = 30 * 24 * 60 * 60;

/*
  jsdom 은 http 주소에서 Secure 쿠키를 버린다. 이 테스트는 브라우저가 아니라 우리 코드가 쓰고 읽는 값을 본다 —
  document.cookie 를 이름→값 항아리로 바꿔, 쓴 문자열(속성 포함)을 그대로 기록한다.
*/
let cookieWrites: string[] = [];
const jar = new Map<string, string>();

function installCookieJar(): void {
  cookieWrites = [];
  jar.clear();
  Object.defineProperty(document, 'cookie', {
    configurable: true,
    get: () => Array.from(jar, ([name, value]) => `${name}=${value}`).join('; '),
    set: (raw: string) => {
      cookieWrites.push(raw);
      const [pair, ...attributes] = raw.split(';').map((part) => part.trim());
      const separator = pair.indexOf('=');
      const name = pair.slice(0, separator);
      if (attributes.includes('Max-Age=0')) jar.delete(name);
      else jar.set(name, pair.slice(separator + 1));
    },
  });
}

function landOn(search: string, referrer = ''): void {
  window.history.pushState({}, '', `/${search}`);
  Object.defineProperty(document, 'referrer', { value: referrer, configurable: true });
}

function storedRecord(): { savedAt: number; touch: Record<string, string> } | null {
  const raw = window.localStorage.getItem(FIRST_TOUCH_STORAGE_KEY);
  return raw === null ? null : JSON.parse(raw);
}

function seedStorage(record: unknown): void {
  window.localStorage.setItem(FIRST_TOUCH_STORAGE_KEY, JSON.stringify(record));
}

function seedCookie(record: unknown): void {
  jar.set(FIRST_TOUCH_COOKIE_NAME, encodeURIComponent(JSON.stringify(record)));
}

beforeEach(() => {
  window.localStorage.clear();
  installCookieJar();
  landOn('');
  jest.restoreAllMocks();
});

describe('captureFirstTouch', () => {
  it('stores the five utm values, the click id and the external referrer origin on landing', () => {
    landOn(
      '?utm_source=google&utm_medium=display&utm_campaign=deals_a&utm_content=ad1&utm_term=kwd-1&gclid=abc123',
      'https://www.google.com/search?q=secret',
    );

    const touch = captureFirstTouch();

    expect(touch).toEqual({
      utm_source: 'google',
      utm_medium: 'display',
      utm_campaign: 'deals_a',
      utm_content: 'ad1',
      utm_term: 'kwd-1',
      gclid: 'abc123',
      referrer: 'https://www.google.com',
    });
    expect(storedRecord()?.touch).toEqual(touch);
    expect(jar.has(FIRST_TOUCH_COOKIE_NAME)).toBe(true);
  });

  it('keeps the first touch when a later landing is not paid', () => {
    landOn('?utm_source=youtube&utm_medium=shorts');
    captureFirstTouch();

    landOn('?utm_source=naver&utm_medium=blog');
    const touch = captureFirstTouch();

    expect(touch?.utm_source).toBe('youtube');
  });

  it.each(['gclid', 'gbraid', 'wbraid'])('lets a %s landing replace a stored organic touch', (clickId) => {
    landOn('?utm_source=youtube&utm_medium=shorts');
    captureFirstTouch();

    landOn(`?utm_source=google&utm_medium=display&${clickId}=newclick`);
    const touch = captureFirstTouch();

    expect(touch).toEqual({ utm_source: 'google', utm_medium: 'display', [clickId]: 'newclick' });
  });

  it('never replaces a stored paid touch, not even with a later paid click (lucksy channel.ts rule)', () => {
    landOn('?utm_source=google&utm_medium=display&utm_campaign=first&gclid=first');
    captureFirstTouch();

    landOn('?utm_source=google&utm_medium=display&utm_campaign=second&gclid=second');
    const touch = captureFirstTouch();

    expect(touch?.utm_campaign).toBe('first');
    expect(touch?.gclid).toBe('first');
    expect(storedRecord()?.touch.gclid).toBe('first');
  });

  it('keeps a stored paid touch against a later paid utm_medium landing too', () => {
    landOn('?gclid=first');
    captureFirstTouch();

    landOn('?utm_source=meta&utm_medium=paid_social&fbclid=f2');

    expect(captureFirstTouch()).toEqual({ gclid: 'first' });
  });

  describe('fbclid is not a paid click id', () => {
    it('records a bare fbclid as organic social from meta', () => {
      landOn('?fbclid=fb1');

      expect(captureFirstTouch()).toEqual({ fbclid: 'fb1', utm_source: 'meta', utm_medium: 'social' });
    });

    it('does not replace a stored organic touch', () => {
      landOn('?utm_source=youtube&utm_medium=shorts');
      captureFirstTouch();

      landOn('?fbclid=fb1');

      expect(captureFirstTouch()).toEqual({ utm_source: 'youtube', utm_medium: 'shorts' });
    });

    it('is paid only when utm_medium says so, and then replaces an organic touch', () => {
      landOn('?utm_source=youtube&utm_medium=shorts');
      captureFirstTouch();

      landOn('?utm_source=instagram&utm_medium=paid_social&fbclid=fb2');

      expect(captureFirstTouch()).toEqual({
        utm_source: 'instagram',
        utm_medium: 'paid_social',
        fbclid: 'fb2',
      });
    });

    it('does not replace a stored paid touch', () => {
      landOn('?gclid=g1');
      captureFirstTouch();

      landOn('?fbclid=fb1&utm_medium=paid_social');

      expect(captureFirstTouch()).toEqual({ gclid: 'g1' });
    });
  });

  it('does not rewrite the record when the same click id lands again', () => {
    landOn('?gclid=same');
    captureFirstTouch();
    const first = storedRecord();
    jest.spyOn(Date, 'now').mockReturnValue((first?.savedAt ?? 0) + 5 * DAY_MS);

    landOn('?gclid=same&utm_source=other');
    captureFirstTouch();

    expect(storedRecord()).toEqual(first);
  });

  it('stores nothing for a direct visit and for an internal referrer', () => {
    landOn('', 'http://localhost/some/page');

    expect(captureFirstTouch()).toBeNull();
    expect(window.localStorage.getItem(FIRST_TOUCH_STORAGE_KEY)).toBeNull();
    expect(jar.has(FIRST_TOUCH_COOKIE_NAME)).toBe(false);
  });

  it('records an external referrer alone as the first touch', () => {
    landOn('', 'https://search.naver.com/search.naver?query=x');

    expect(captureFirstTouch()).toEqual({ referrer: 'https://search.naver.com' });
  });

  it('does not keep a referrer longer than 100 characters', () => {
    landOn('', `https://${'a'.repeat(120)}.com/path`);

    expect(captureFirstTouch()).toBeNull();
  });

  it('applies the label rule: lowercase, accepted charset, no date-shaped values', () => {
    landOn(
      '?utm_source=Google&utm_medium=Display Ads&utm_campaign=1990-08-05&utm_content=0f8fad5b-d9cb-469f-a165-70867728950e&utm_term=kwd-123:aud-456',
    );

    expect(captureFirstTouch()).toEqual({
      utm_source: 'google',
      utm_medium: 'other',
      utm_campaign: 'other',
      utm_content: '0f8fad5b-d9cb-469f-a165-70867728950e',
      utm_term: 'kwd-123:aud-456',
    });
  });

  it.each(['01012345678', '0111234567', '01698765432'])(
    'maps the phone-number-shaped label %s to other',
    (phone) => {
      landOn(`?utm_source=${phone}&utm_campaign=${phone}`);

      expect(captureFirstTouch()).toEqual({ utm_source: 'other', utm_campaign: 'other' });
    },
  );

  it('keeps a number that is not phone-shaped', () => {
    landOn('?utm_campaign=2027');

    expect(captureFirstTouch()).toEqual({ utm_campaign: '2027' });
  });

  it('drops a click id that is not a plain token or is phone-shaped', () => {
    landOn('?gclid=<script>&fbclid=ok_1-2&wbraid=01012345678');

    expect(captureFirstTouch()).toEqual({ fbclid: 'ok_1-2', utm_source: 'meta', utm_medium: 'social' });
  });

  it('forgets a touch older than 30 days and takes the new landing', () => {
    landOn('?utm_source=old');
    captureFirstTouch();
    const savedAt = storedRecord()?.savedAt ?? 0;
    jest.spyOn(Date, 'now').mockReturnValue(savedAt + 31 * DAY_MS);

    landOn('?utm_source=fresh');

    expect(captureFirstTouch()).toEqual({ utm_source: 'fresh' });
  });

  it('reads the cookie when localStorage is empty and restores localStorage from it', () => {
    landOn('?utm_source=youtube&utm_campaign=shorts_a');
    captureFirstTouch();
    window.localStorage.clear();

    landOn('');

    expect(captureFirstTouch()).toEqual({ utm_source: 'youtube', utm_campaign: 'shorts_a' });
    expect(storedRecord()?.touch.utm_source).toBe('youtube');
  });

  it('does not throw when storage is blocked', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    landOn('?utm_source=youtube');

    expect(captureFirstTouch()).toEqual({ utm_source: 'youtube' });
  });
});

describe('values read back from storage or cookie are re-validated', () => {
  const now = () => Date.now();

  it.each([
    ['an email address as utm_source', { utm_source: 'young@example.com' }],
    ['an uppercase label', { utm_source: 'Google' }],
    ['a date-shaped label', { utm_campaign: '1990-08-05' }],
    ['a phone-number-shaped label', { utm_term: '01012345678' }],
    ['a click id with markup', { gclid: '<img src=x>' }],
    ['a 3000-character referrer', { referrer: `https://${'a'.repeat(3000)}.com` }],
    ['a referrer with a path', { referrer: 'https://www.google.com/search?q=secret' }],
    ['a javascript: referrer', { referrer: 'javascript:alert(1)' }],
    ['an unknown field', { utm_source: 'google', email: 'a@b.com' }],
    ['a non-string value', { utm_source: 42 }],
    ['an empty touch', {}],
  ])('rejects the whole record with %s (localStorage)', (_, touch) => {
    seedStorage({ savedAt: now(), touch });

    expect(captureFirstTouch()).toBeNull();
    expect(firstTouchProperties()).toEqual({});
  });

  it('rejects an invalid cookie record the same way', () => {
    seedCookie({ savedAt: now(), touch: { utm_source: 'young@example.com' } });

    expect(captureFirstTouch()).toBeNull();
  });

  it('does not let a poisoned record reach the ft_ properties, and a clean landing replaces it', () => {
    seedStorage({ savedAt: now(), touch: { utm_source: 'young@example.com', referrer: `https://${'a'.repeat(3000)}.com` } });
    landOn('?utm_source=youtube');

    expect(firstTouchProperties()).toEqual({ ft_utm_source: 'youtube' });
  });

  it('accepts a record that is exactly what we write', () => {
    seedStorage({ savedAt: now(), touch: { utm_source: 'other', gclid: 'Abc_1-2', referrer: 'https://www.google.com' } });

    expect(captureFirstTouch()).toEqual({ utm_source: 'other', gclid: 'Abc_1-2', referrer: 'https://www.google.com' });
  });
});

describe('record time and cookie attributes', () => {
  it('rejects a record saved in the future, so the 30-day TTL cannot be stretched', () => {
    seedStorage({ savedAt: Date.now() + 100 * DAY_MS, touch: { utm_source: 'forged' } });
    landOn('?utm_source=real');

    expect(captureFirstTouch()).toEqual({ utm_source: 'real' });
  });

  it('rejects a non-finite savedAt', () => {
    seedStorage({ savedAt: null, touch: { utm_source: 'forged' } });

    expect(captureFirstTouch()).toBeNull();
  });

  it('writes the cookie with Secure and a Max-Age of at most 30 days', () => {
    landOn('?utm_source=youtube');
    captureFirstTouch();

    const write = cookieWrites.find((raw) => raw.startsWith(`${FIRST_TOUCH_COOKIE_NAME}=`)) ?? '';
    const maxAge = Number(/Max-Age=(\d+)/.exec(write)?.[1]);
    expect(write).toContain('; Secure');
    expect(write).toContain('SameSite=Lax');
    expect(maxAge).toBeGreaterThan(0);
    expect(maxAge).toBeLessThanOrEqual(THIRTY_DAYS_SECONDS);
  });

  it('shortens the Max-Age as the record ages, never extending it', () => {
    landOn('?utm_source=youtube');
    captureFirstTouch();
    const savedAt = storedRecord()?.savedAt ?? 0;
    jest.spyOn(Date, 'now').mockReturnValue(savedAt + 10 * DAY_MS);
    cookieWrites = [];

    landOn('');
    captureFirstTouch();

    const maxAge = Number(/Max-Age=(\d+)/.exec(cookieWrites[0] ?? '')?.[1]);
    expect(maxAge).toBeLessThanOrEqual(20 * 24 * 60 * 60);
  });
});

describe('firstTouchProperties', () => {
  it('prefixes every stored value with ft_ and omits absent fields', () => {
    landOn('?utm_source=youtube&gclid=g1', 'https://www.youtube.com/watch?v=1');
    captureFirstTouch();
    landOn('');

    expect(firstTouchProperties()).toEqual({
      ft_utm_source: 'youtube',
      ft_gclid: 'g1',
      ft_referrer: 'https://www.youtube.com',
    });
  });

  it('is empty when there is no first touch', () => {
    expect(firstTouchProperties()).toEqual({});
  });

  it('captures the current landing itself, so a click on the landing page is attributed', () => {
    landOn('?utm_source=meta&fbclid=f9');

    expect(firstTouchProperties()).toEqual({ ft_utm_source: 'meta', ft_fbclid: 'f9', ft_utm_medium: 'social' });
  });
});
