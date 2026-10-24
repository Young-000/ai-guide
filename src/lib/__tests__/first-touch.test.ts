import {
  FIRST_TOUCH_COOKIE_NAME,
  FIRST_TOUCH_STORAGE_KEY,
  captureFirstTouch,
  firstTouchProperties,
} from '../first-touch';

const DAY_MS = 24 * 60 * 60 * 1000;

function landOn(search: string, referrer = ''): void {
  window.history.pushState({}, '', `/${search}`);
  Object.defineProperty(document, 'referrer', { value: referrer, configurable: true });
}

function clearCookie(): void {
  document.cookie = `${FIRST_TOUCH_COOKIE_NAME}=; Max-Age=0; Path=/`;
}

function storedRecord(): { savedAt: number; touch: Record<string, string> } | null {
  const raw = window.localStorage.getItem(FIRST_TOUCH_STORAGE_KEY);
  return raw === null ? null : JSON.parse(raw);
}

beforeEach(() => {
  window.localStorage.clear();
  clearCookie();
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
    expect(document.cookie).toContain(`${FIRST_TOUCH_COOKIE_NAME}=`);
  });

  it('keeps the first touch when a later landing has only utm tags', () => {
    landOn('?utm_source=youtube&utm_medium=shorts');
    captureFirstTouch();

    landOn('?utm_source=naver&utm_medium=blog');
    const touch = captureFirstTouch();

    expect(touch?.utm_source).toBe('youtube');
  });

  it('lets a new paid click id replace the stored first touch', () => {
    landOn('?utm_source=youtube&utm_medium=shorts');
    captureFirstTouch();

    landOn('?utm_source=google&utm_medium=display&gclid=newclick');
    const touch = captureFirstTouch();

    expect(touch).toEqual({ utm_source: 'google', utm_medium: 'display', gclid: 'newclick' });
  });

  it('treats fbclid, gbraid and wbraid as paid click ids too', () => {
    landOn('?utm_source=youtube');
    captureFirstTouch();

    landOn('?utm_source=meta&fbclid=fb1');
    expect(captureFirstTouch()?.fbclid).toBe('fb1');

    landOn('?gbraid=gb1');
    expect(captureFirstTouch()).toEqual({ gbraid: 'gb1' });

    landOn('?wbraid=wb1');
    expect(captureFirstTouch()).toEqual({ wbraid: 'wb1' });
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
    expect(document.cookie).not.toContain(FIRST_TOUCH_COOKIE_NAME);
  });

  it('records an external referrer alone as the first touch', () => {
    landOn('', 'https://search.naver.com/search.naver?query=x');

    expect(captureFirstTouch()).toEqual({ referrer: 'https://search.naver.com' });
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

  it('drops a click id that is not a plain token', () => {
    landOn('?gclid=<script>&fbclid=ok_1-2');

    expect(captureFirstTouch()).toEqual({ fbclid: 'ok_1-2' });
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

    expect(firstTouchProperties()).toEqual({ ft_utm_source: 'meta', ft_fbclid: 'f9' });
  });
});
